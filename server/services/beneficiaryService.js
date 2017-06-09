var mongoose = require('mongoose');
// var Lc = require('../models/lcSchema.js');
var User = require('../models/userSchema.js');
var LcContract = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var lodgementSchema = require('../models/lodgementSchema.js');
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

// var utils = require('../helpers/utils');
var Web3 = require('web3');
var web3 = new Web3();
var config = getConf('./property.js').get(process.env.NODE_ENV);
web3.setProvider(new web3.providers.HttpProvider(config.providerEndpoint));
var eth = web3.eth;
var lcService = require('./lcService.js');

var socket = require('socket.io-client')('http://127.0.0.1:3012');


exports.getLcNumbers = function(req, res) {
    console.log("INSIDE getLcNumbers function");
    var user = req.user;
    LcContract.find({
            workflows: {
                $size: 6
            },
            'workflows.5.stage': enums.POST_MINING_ENUM.ADVISING_BANK,
            'sellerId': user._id
        })
        .populate('buyerId', '-_id')
        .populate('advisingBankId', '-_id')
        .populate('sellerId', '-_id')
        .populate('issuingBankId', '-_id')
        .exec()
        .then(docs => {
            if (!docs) {
                console.log("inside BENEFICIARY docs.find()-1");
                return res.status(401).end();
            }
            res.status(200).send(docs);
        })
        .catch(err => console.log(err));
}

exports.validateBillNumber = function(req, res) {
    console.log("----Server Side validate Bill Number !!----");
    var params = req.params;
    console.log(params);
    var billNumber = params.billNumber;
    var sellerId = params.sellerId;
    if (billNumber != undefined && billNumber != "" && billNumber != null) {
        // query to check billNumber for given sellerId
        LcContract.count({
                'billNumber': billNumber,
                'sellerId': sellerId
            })
            .then(count => {
                if (count == 0) {
                    console.log("No billNumber exists");
                    return res.status(200).send({
                        message: "Bill Number is Unique"
                    }).end();
                }
                res.status(409).send({
                    message: "Bill Number already exists"
                });
            })
            .catch(err => console.log(err));

    } else {
        console.log("UNDEFINED OR NULL !");
        return res.status(409).send({
            message: "billNumber Undefined"
        }).end();
    }
}

exports.getPresentingBank = function(req, res) {
    console.log("INSIDE getPresentingBank function");
    var id = req.params.lcNumber;
    console.log('-------------------------------Id in here   >' + id)
    // Since it is Presenting Bank, selection is based on LC
    lcService.fetchNonAttachedUsersWithRole(enums.ROLES_ENUM.PRESENTING_BANK, id, 'lcNumber').then(function(users) {
            console.log('------------------Printing  --------------------');
            console.log(users);
            return res.status(200).json(users);
        },
        function(error) {
            console.log(error);
            return res.status(401).end();
        })
}

exports.saveLodgementForm = function(req, res) {
    console.log("Inside server side beneficiary");
    console.log(req.body);
    var contractID = req.body.contractID;
    var formData = {
        'billNumber': req.body.billNumber,
        'billQuantity': req.body.billQuantity,
        'billAmount': req.body.billAmount,
        'billLading': req.body.billLading,
        'presentingBankId': req.body.presentingBankId
        // 'beneficiaryIpfsDocHash':req.body.beneficiaryIpfsDocHash,
        // 'beneficiaryFileName':req.body.beneficiaryFileName
    }
    var workflows1 = new workflowSchema();
    workflows1.stage = enums.PRE_MINING_ENUM.BENEFICIARY;

    var lodgementArray = [];
    for (var i = 0; i < req.body.lodgementDocuments.length; ++i) {
        var lodgementDocuments1 = new lodgementSchema();
        lodgementDocuments1.ipfsDocHash = req.body.lodgementDocuments[i].ipfsDocHash;
        lodgementDocuments1.fileName = req.body.lodgementDocuments[i].fileName;
        lodgementDocuments1.fileType = req.body.lodgementDocuments[i].fileType;
        // console.log( lodgementDocuments1 );
        // LcContract.findByIdAndUpdate(contractID, {
        //         $push: {
        //             "lodgementDocuments": lodgementDocuments1
        //         }
        //       }, { 'new' : true })
        //         .then( function(result){
        //             console.log("success DOCC");
        //             console.log(result);
        //         }, function(error) {
        //             console.log("error DOCC");
        //             console.log(error);
        //         })
        lodgementArray.push(lodgementDocuments1);
    }
    // console.log(lodgementDocuments1);
    console.log("LODGEMENT DOCUMENTS SERVER SIDE");
    console.log(lodgementArray);
    LcContract.findByIdAndUpdate(contractID, {
            $push: {
                "workflows": workflows1,
                "lodgementDocuments": {
                    $each: lodgementArray
                }
            },
            $set: formData
        }, {
            'new': true
        })
        .then(function(result) {
            console.log("----Updated Lodgement----");
            console.log(result);
            // result.lodgementDocuments = lodgementArray;
            // result.save()
            // .then( function(result){
            //   console.log("lodgement doc saved");
            //   console.log(result);
            // }, function(error){
            //   console.log(error);
            // })
            console.log('Do shareLodgement Transaction --------> ');
            socket.emit('doLodgement', result);
            return Promise.resolve(result);
        }, function(error) {
            console.log('error occurred');
            return res.status(500).json({
                "message": "Share Lodgement Form Failed"
            });
        }).then(function(result) {
            return res.status(200).json({
                "message": "Share Lodgement Form Verified : Block chain processing initiated"
            });
        })
    // .catch(function(error) {
    //     console.log(error);
    //     return res.status(500).send({
    //         message: "Share Lodgement Form Failed"
    //     });
    // });
}

//Upload multiple files
exports.uploadFile = function(req, res) {
    console.log("In the upload Service beneficiary :::::::::::");
    var files = req.files.files;
    // console.log(files);
    var promises = [];
    for (var i = 0; i < files.length; i++) {
        console.log("inside FOR LOOP!!!------->");
        console.log(files[i].path);
        promises.push(
            uploadToIpfs(files[i])
        );
    }
    // end for loop
    Promise.all(promises).then(function(result) {
        console.log("Returning all promises!!");
        console.log(result);
        return res.status(200).json(result);
    }, function(err) {
        console.log("Something went wrong in Upload Promises !!");
        console.log(err);
        return res.status(500).json({
            "message": "Multiple Uploads Failed !!"
        });
    });
}

var uploadToIpfs = function(file) {
    return new Promise(function(resolve, reject) {
        ipfs.util.addFromFs(file.path, function(err, response) {
            if (err) {
                console.log('addition to ipfs failed');
                var message = {
                    "status": "IPFS add failed"
                };
                reject(err);
            } else {
                console.log(response);
                console.log("uploaded to IPFS successfully");
                resolve({
                    "hash": response[0].hash,
                    "fileName": file.name
                });
            }
        });
    });
}

// upload file to local
// exports.uploadLocal = function(req, res) {
//     console.log("In the upload Service   LOCALLLLLLLLLLLLLL:::::::::::");
//     var files = req.files.files;
//     var ipfsFiles = [];
//     console.log(files);
//     console.log(files.length)
//     for (var i = 0; i < files.length; i++) {
//         var path_to_local_dir = path.join(__dirname, "../uploadedFiles/" + files[i].name); 
//         var oldLoc = files[i].path;
//         console.log(oldLoc);
//         console.log(path_to_local_dir);
//         fs.readFile(oldLoc, function(err, data) {
//             fs.writeFile(path_to_local_dir, data, function(err) {
//                 fs.unlink(oldLoc, function() {
//                     if (err) throw err;
//                     res.send("File uploaded to: " + path_to_local_dir);
//                 });
//             });
//
//             console.log("File copied to the local directory");
//         })
//
//
//
//     }
//
//
// }
