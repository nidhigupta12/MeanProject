/**
 * @author hitjoshi@deloitte.com
 */
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../models/userSchema.js');
var Roles = require('../models/roles.js');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var config = getConf('./property.js').get(process.env.NODE_ENV);

module.exports.register = function(req, res) {
    if (!req.body.name || !req.body.email || !req.body.password ||
        !req.body.role) {
        return res.status(400).json({
            "message": "All fields required"
        });
    }

    var user = new User(req.body);
    user.save()
        .then(function(savedUser) {
            var token = savedUser.generateJwt();
            return res.status(200).json({
                "token": token
            });
        })
        .catch(function(err) {
            console.log(err);
            console.log('error occurred');
        });
}



module.exports.login = function(req, res) {

    if (!(req.body.email) || !(req.body.password)) {
        return res.status(400).json({
            "message": "Input fields missing"
        });
    }
    passport.authenticate('local', function(err, user, info) {
        var token;

        if (err) {
            res.status(404).json(err);
            return;
        }
        if (user) {
            user.generateJwt().then(function(result) {
                return res.status(200).json({
                    "token": result
                });

            })


        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);
};

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
module.exports.isAuthenticated = function() {
    return compose()
        // Validate jwt
        .use(function(req, res, next) {
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = `Bearer ${req.query.access_token}`;
            }
            // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
            if (req.query && typeof req.headers.authorization === 'undefined') {
                req.headers.authorization = `Bearer ${req.cookies.token}`;
            }
            console.log('Auth - token');
            console.log(req.headers.authorization);
            validateJwt(req, res, next);
        })
        // Attach user to request
        .use(function(req, res, next) {
            console.log('user Id----------- ' + req.user._id);
            User.findById(req.user._id).exec()
                .then(user => {

                    if (!user) {
                        console.log('FAILED----------------------');
                        return res.status(401).end();
                    }
                    req.user = user;
                    next();
                })
                .catch(err => next(err));
        });
};

var validateJwt = expressJwt({
    secret: config.secrets.session
});


module.exports.hasRole = function(roleRequired) {


    if (!roleRequired) {
        throw new Error('Required role needs to be set');
    }
    return compose()
        .use(this.isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            return Roles.find({
                "_id": {
                    "$in": req.user.role
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
                console.log('------------ error ----- ');
                console.log(error);
            }).then(function(res) {

                console.log(res);
                if (res.indexOf(roleRequired) != -1) {
                    console.log('User Has required Role');
                    return next();
                } else {
                    return res.status(403).json({
                        "message": "Forbidden Route"
                    });
                }
                //res has roleRequired

            }).catch(function(err) {
                console.log(err);
            });

            // if (config.userRoles.indexOf(req.user.role) ==
            //     config.userRoles.indexOf(roleRequired)) {
            //     console.log('User Has required Role');
            //     return next();
            // } else {
            //     return res.status(403).json({
            //         "message": "Forbidden Route"
            //     });
            // }
        });
};

module.exports.refreshToken = function(req, res) {
    console.log("refreshing token ----- >");
    console.log('token' + req.body.token);
    // verify the existing token
    var profile = jwt.verify(req.body.token, config.secrets.session);

    console.log(profile);
    // if more than 14 days old, force login - we can remove this check
    if ((profile.iat - new Date()) > 7) { // iat == issued at
        console.log('expired ---->');
        return res.send(401); // re-logging
    }

    // check if the user still exists or if authorization hasn't been revoked
    // if (!valid) return res.send(401); // re-logging

    var email = profile.email;
    console.log("Printing the user ---> " + email);
    User.findOne({
        email: email.toLowerCase()
    }).then(function(user) {
        var refreshed_token = user.generateJwt();
        return res.json({
            token: refreshed_token
        });
    })
    // issue a new token

};;
