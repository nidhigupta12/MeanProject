'use strict';

var crypto = require('crypto');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var requestpromise = require('request-promise');


var config = getConf('./property.js').get(process.env.NODE_ENV);

var socket = require('socket.io-client')('http://127.0.0.1:3012');

const authTypes = ['github', 'twitter', 'facebook', 'google'];
var roles = require('./roles.js');

var UserSchema = new Schema({
    name: String,
    entity: String,
    email: {
        type: String,
        lowercase: true,
        required() {
            if (authTypes.indexOf(this.provider) === -1) {
                return true;
            } else {
                return false;
            }
        }
    },
    // role: {
    //   type: Number,
    //   required: true
    // },
    role: [{
        type: Schema.ObjectId,
        ref: 'roles'
    }],
    password: {
        type: String,
        required() {
            if (authTypes.indexOf(this.provider) === -1) {
                return true;
            } else {
                return false;
            }
        }
    },
    accNumber: String,
    provider: String,
    salt: String,
    blockchainAddress: String,
    address: String,
    blockchainAcPwd: String,
    branch: String,
    accountDetail: {
        accountNo: String,
        bankDetail: {
            type: Schema.ObjectId,
            ref: 'UserSchema'
        }
    },
    facebook: {},
    twitter: {},
    google: {},
    github: {}
});

/**
 * Virtuals
 */

// Public profile information
// Virtual method to get combined file information
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            name: this.name,
            role: this.role
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            _id: this._id,
            role: this.role
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function(email) {
        if (authTypes.indexOf(this.provider) !== -1) {
            return true;
        }
        return email.length;
    }, 'Email cannot be blank');

// Validate empty password
UserSchema
    .path('password')
    .validate(function(password) {
        if (authTypes.indexOf(this.provider) !== -1) {
            return true;
        }
        return password.length;
    }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(function(value, respond) {
        if (authTypes.indexOf(this.provider) !== -1) {
            return respond(true);
        }

        return this.constructor.findOne({
                email: value
            }).exec()
            .then(user => {
                if (user) {
                    if (this.id === user.id) {
                        return respond(true);
                    }
                    return respond(false);
                }
                return respond(true);
            })
            .catch(function(err) {
                throw err;
            });
    }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
    return value && value.length;
};

// first generate a random salt
var genSalt = function(password) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                reject(err);
            } else {

                resolve({
                    salt: salt,
                    password: password
                });
            }
        });
    });
}

var genHash = function(salt, password) {
    return new Promise(function(resolve, reject) {
        bcrypt.hash(password, salt).then(function(hash) {
                resolve({
                    salt: salt,
                    hash: hash
                });
            },
            function(error) {
                console.log('error generating Hash');
                reject(error);
            })

    });
}

var createBcAddress = function(options) {
    return new Promise(function(resolve, reject) {
        requestpromise(options)
            .then(function(bcResult) {
                resolve(bcResult.result);
            }, function(error) {
                console.log('error generating Hash');
                reject(error);
            });

    });
}


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    genSalt(user.password)
        .then(function(result) {
            return genHash(result.salt, result.password);
        }, function(error) {
            console.error(error);
        })
        .then(function(result) {
            user.salt = result.salt;
            user.password = result.hash;
        })
        .then(function() {
            var blockchain_pwd = crypto.createHash('md5')
                .update(user.password, 'utf8')
                .digest('hex');
            user.blockchainAcPwd = blockchain_pwd;
        })
        .then(function() {
            var bcAccountData = {
                "params": [user.blockchainAcPwd],
                "method": "personal_newAccount",
                "jsonrpc": "2.0",
                "id": 0,
            }
            //TODO- Hitesh: Move the URI out to a config file
            var options = {
                method: 'POST',
                uri: config.providerEndpoint,
                body: bcAccountData,
                json: true
            };
            return createBcAddress(options);
        })
        .then(function(result) {
            user.blockchainAddress = result;
            // send some funds to this address
            var data = {
                userBCAddress: user.blockchainAddress,
            };
            console.log(data);
            socket.emit('transferFunds', data);
        })
        .then(function() {
            next();
        })
        .catch(function(err) {
            console.log(err);
        });

});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} password
     * @param {Function} callback
     * @return {Boolean}
     * @api public
     */
    authenticate(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    },
    generateJwt() {
        var roleIdArr = this.role;
        var curDate = new Date();
        // expiry.setDate(expiry.getDate() + 7);
        var expiry = new Date(curDate.setMinutes(curDate.getMinutes() + 55));
        var jwtJson = {
            _id: this._id,
            email: this.email,
            name: this.name,
            address: this.address,
            userId: this._id,
            accountNo: this.accountDetail.accountNo,
            exp: parseInt(expiry.getTime() / 1000)
        };
        // get roles by id
        return roles.find({
                "_id": {
                    "$in": roleIdArr

                }
            }, {
                "roleId": 1,
                "_id": 0
            }).then(function(result) {
                var roleArray = [];
                for (var i = 0; i < result.length; i++) {
                    roleArray.push(result[i].roleId);
                }

                return Promise.resolve(roleArray);
            }, function(error) {
                console.log(error);
            }).then(function(res) {
                jwtJson.role = res;
                return Promise.resolve(jwtJson);
            })
            .then(function(resp) {
                return Promise.resolve(jwt.sign(resp, config.secrets.session));
            });

    },
    populateRoles() {
        return roles.find({
                "_id": {
                    "$in": this.role
                }
            }, "roleId -_id")
            .then(function(result) {
                var roleArray = [];
                for (var i = 0; i < result.length; i++) {
                    roleArray.push(result[i].roleId);
                }
                return Promise.resolve(roleArray);
            }, function(error) {
                console.log(error);
            });
    }
};

module.exports = mongoose.model('User', UserSchema);
