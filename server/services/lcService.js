var mongoose = require('mongoose');
// var Lc = require('../models/lcSchema.js');
var userSchema = require('../models/userSchema.js');
var LcContract = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var Roles = require('../models/roles.js');
var enums = require('../constants/enums.js');
var config = getConf('./property.js').get(process.env.NODE_ENV);
//added for ipfs
var Promise = require('bluebird');
var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI(config.ipfsIp, config.ipfsPort, {
    protocol: 'http'
});
var fs = require('fs');
var path = require('path');

var utils = require('../helpers/utils');
var Web3 = require('web3');
var web3 = new Web3();
var config = getConf('./property.js').get(process.env.NODE_ENV);
web3.setProvider(new web3.providers.HttpProvider(config.providerEndpoint));
var eth = web3.eth;

var socket = require('socket.io-client')('http://127.0.0.1:3012');


// regular service call with Ipfs file -- form with file upload
var uploadDoc = function(req, res) {
    console.log('In the server side UPLOAD');
    console.log(req);
    return res.status(200);
}

var getFileFromFileDir = function(req, res) {
    console.log("inside issuing bank->getFileFromFileDir()");
    var primaryId = req.params.fileName;
    //  new ObjectId(primaryId)
    LcContract.findById(primaryId,  function(err, lcContractRecord)  {      
        if  (lcContractRecord)  {       
            ipfs.cat(lcContractRecord.initiatorIpfcDocHash).then(function(result) {
                if (result.readable) {
                    // get the file name from mongo Db
                    res.setHeader('Content-disposition', 'inline; filename=' + 'test.pdf');
                    res.setHeader('Content-type', 'application/pdf');
                    return result.pipe(res);
                }
            }, function(err) {
                console.log(err);
                console.log('IPFS cat failed');
            });      
        } 
        else  {        
            return res.status(401).end();      
        }    
    });

}

var getPoNumbers = function(req, res) {
    var user = req.user;
    LcContract.find({
            workflows: {
                $size: 2
            },
            'workflows.1.stage': enums.POST_MINING_ENUM.INITIATOR,
            'issuingBankId': user._id
        }, "poQuantity sellerId advisingBankId buyerId usancePeriod usancePeriodFrom lcDuration poValue poNumber poInitDate poItem tolerancePercent poCurrency")
        .populate('buyerId', 'name address accountDetail.accountNo -_id')
        .populate('advisingBankId', 'entity branch address -_id')
        .populate('sellerId', 'name address accountDetail.accountNo -_id')
        .exec()
        .then(docs => {
            if (!docs) {
                console.log("inside docs.find()-1");
                return res.status(401).end();
            }
            // console.log("docs=" + docs);
            res.status(200).send({
                message: docs
            });
        })
        .catch(err => console.log(err));
}


// regular service call
var saveLcForm = function(req, res) {
    // console.log('In the server side');
    // console.log(req.body);

    var contractID = req.body.contractID;
    var lcNumber = req.body.lcNumber;
    var lcValue = req.body.lcValue;
    var lcTerms = req.body.lcTerms;
    var lcFee = req.body.lcFee;
    var lcDocsRequired = req.body.lcDocsRequired;
    var advBankId = req.body.advisingBankId;

    // Stage for Issuing Bank
    var workflows1 = new workflowSchema();
    workflows1.stage = enums.PRE_MINING_ENUM.ISSUING_BANK;
    LcContract.findByIdAndUpdate(contractID, {
            $push: {
                "workflows": workflows1
            },
            $set: {
                'lcNumber': lcNumber,
                "termsCondition": lcTerms,
                "lcValue": lcValue,
                "lcCreationFee": lcFee,
                "lcDocsRequired": lcDocsRequired,
                "advisingBankId": advBankId
            }
        }, {
            'new': true
        })
        .then(function(result) {
            console.log("----Updated ----");
            console.log(result);
            console.log('Do Issue LC Transaction --------> ');
            // console.log(data);
            socket.emit('doIssueLc', result);
            return Promise.resolve(result);
        }, function(error) {
            console.log('error occurred');
            return res.status(500).json({
                "message": "LC Form Failed"
            });
        }).then(function(result) {
            return res.status(200).json({
                "message": "LC Form verified : Block chain processing initiated"
            });
        })
        .catch(function(error) {
            console.log(error);
            return res.status(500).send({
                message: "Issue LC Failed"
            });
        });
}

//get ipfs file
var getIpfsFile = function(req, res) {
    console.log("lcService->getIpfsFile-1");
    var fileName = req.params.fileName;
    console.log("lcService->getIpfsFile-1, fileName=" + fileName);
    var path_to_local_dir = path.join(__dirname, "../uploadedFiles");
    var filePath = path_to_local_dir + "/" + fileName;
    console.log("lcService->getIpfsFile, FILE PATH is =" + filePath);
    fs.readFile(filePath, function(err, file1) {
        res.write(file1, "binary");
        res.end();
        //res.status(200).json();
    })
    //res.status(200);



}

var validateLcNumber = function(req, res) {
    console.log("   Server Side validate LC Number !!");
    var params = req.params;
    console.log(params);
    var lcNumber = params.lcNumber;
    var issuingBankId = params.issuingBankId;
    if (lcNumber != undefined && lcNumber != "" && lcNumber != null) {
        // query to check poNumber for given buyerId
        LcContract.count({
                'lcNumber': lcNumber,
                'issuingBankId': issuingBankId
            })
            .then(count => {
                if (count == 0) {
                    console.log("No lcNumber exists");
                    return res.status(200).send({
                        message: "lc Number is Unique"
                    }).end();
                }
                res.status(409).send({
                    message: "lc Number already exists"
                });
            })
            .catch(err => console.log(err));

    } else {
        console.log("UNDEFINED OR NULL !");
        return res.status(409).send({
            message: "lcNumber Undefined"
        }).end();
    }
}

var fetchUserWithRole = function(req, res) {
    var id = req.params.poNumber;
    console.log('Params ----> ' + id);
    // fetchNonAttachedUsersWithRole(enums.ROLES_ENUM.ISSUING_BANK, 1211112, 'poNumber');
    // As this is Screen1b
    fetchNonAttachedUsersWithRole(enums.ROLES_ENUM.ADVISING_BANK, id, 'poNumber').then(function(users) {
        return res.status(200).send({
            message: users
        }).end();

    }, function(error) {
        console.log(error);
        return res.status(401).end();
    });

}

var fetchbyRole = function(role) {
    return Roles.findOne({
            'roleId': role
        }, {
            "_id": 1,
            "roleId": 1,
            "roleName": 1
        })
        .then(function(roleObj) {
            return Promise.resolve(roleObj)
        }, function(error) {
            console.log('Error occurred ----');
            console.log(error);
        })
        .then(function(result) {
            console.log(result);
            return userSchema.find({
                    "role": result._id
                }).sort({
                    "name": -1
                })
                .then(function(userResults) {
                    console.log('Final result  by Role --------');
                    return Promise.resolve(userResults);
                }, function(error) {
                    console.log(error);
                })
        }, function(error) {
            console.log(error);
        }).catch(err => console.log(err));
}

var fetchNonAttachedUsersWithRole = function(role, id, type) {

    var promises = [];
    var query;
    if (type == "poNumber") {
        query = {
            "poNumber": id
        };

    } else if (type == "lcNumber") {
        query = {
            "lcNumber": id
        };
    }
    promises.push(new Promise(function(resolve, reject) {

        LcContract.findOne(query, "sellerId buyerId issuingBankId advisingBankId presentingBankId -_id").then(function(result) {
                return resolve(result);
            },
            function(error) {
                console.log(error);
                return reject(error);
            });
    }));

    promises.push(new Promise(function(resolve, reject) {
        fetchbyRole(role).then(function(users) {
            return resolve(users);
        })
    }));

    return Promise.all(promises).then(function(result) {

        var lcObject = result[0];
        var userArray = result[1];
        var keyNames = ["issuingBankId", "sellerId", "buyerId", "presentingBankId", "advisingBankId"];

        for (var i in keyNames) {
            if (lcObject[keyNames[i]]) {

                for (var j in userArray) {
                    var obj = userArray[j];
                    var objectId = String(obj._id);
                    var lcObjectId = String(lcObject[keyNames[i]]);
                    if (lcObjectId == objectId) {
                        console.log('splicing');
                        userArray.splice(j, 1);
                    }
                }
            }
        }
        console.log('Final Return List');
        console.log(userArray);
        return Promise.resolve(userArray);
    }).catch(err => console.log(err));
}

module.exports = {

    fetchbyRole: fetchbyRole,
    fetchUserWithRole: fetchUserWithRole,
    validateLcNumber: validateLcNumber,
    getIpfsFile: getIpfsFile,
    saveLcForm: saveLcForm,
    getPoNumbers: getPoNumbers,
    getFileFromFileDir: getFileFromFileDir,
    uploadDoc: uploadDoc,
    fetchNonAttachedUsersWithRole: fetchNonAttachedUsersWithRole

}
