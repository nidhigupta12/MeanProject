'use strict';

var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = require('../models/userSchema.js');
var lcContracts = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var roles = require('../models/roles.js');

var rp = require('request-promise');
var ipfsAPI = require('ipfs-api');
var fs = require('fs');
var ipfs = ipfsAPI(config.ipfsIp, config.ipfsPort, {
    protocol: 'http'
});
var formidable = require('formidable');
var path = require('path');

var utils = require('../helpers/utils');
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.providerEndpoint));
var eth = web3.eth;

var socket = require('socket.io-client')('http://127.0.0.1:3012');
var enums = require('../constants/enums.js');

exports.onload = function(req, res, next) {
    console.log('---- This query has to change to accomodate new ' +
        +'role table and get only users with 200, 300, 400-----');

    //
    // roles.find({'roleId':100}).then(roleAdv =>{
    //   if(!roleAdv) {
    //     console.log("401");
    //   }
    //   console.log("Advinsing");
    //   console.log(roleAdv);
    // });



    return User.find({}, '-blockchainAddress -blockchainAcPwd -salt -password')
        .populate('role', '-_id -createdDate')
        .exec()
        .then(User => {
            console.log("Printing user " + User);
            if (!User) {
                return res.status(401).end();
            }
            var userList = [];
            for (var i = 0; i < User.length; i++) {
                var userInfo = {
                    id: '',
                    name: '',
                    address: '',
                    email: ''
                };
                userInfo.id = User[i]._id;
                userInfo.name = User[i].name;
                userInfo.address = User[i].address;
                userInfo.email = User[i].email;
                userInfo.accountDetail = User[i].accountDetail;
                userInfo.entity = User[i].entity;
                userInfo.branch = User[i].branch;
                var roleArray = [];
                for (var j = 0; j < User[i].role.length; j++) {
                    roleArray.push(User[i].role[j].roleId);
                }
                userInfo.roles = roleArray;
                userList.push(userInfo);
            }
            res.status(200).json(userList);
        })
        .catch(err => next(err));



}
//change here
exports.submit = function(req, res, next) {
    var lcContractObj = new lcContracts();
    console.log(req.body);
    var result = [];
    var workflows1 = new workflowSchema();
    workflows1.stage = enums.PRE_MINING_ENUM.INITIATOR;
    result.push(workflows1);

    console.log("Seller ID is   =======" + req.body.sellerId);

    lcContractObj.workflows = result;
    lcContractObj.poNumber = req.body.poNumber;
    lcContractObj.buyerId = req.body.buyerId;
    lcContractObj.sellerId = req.body.sellerId;
    lcContractObj.poItem = req.body.poItem;
    lcContractObj.poValue = req.body.poValue;
    lcContractObj.lcDuration = req.body.lcDuration;
    lcContractObj.tolerancePercent = req.body.tolerancePercent;
    lcContractObj.usancePeriod = req.body.usancePeriod;
    lcContractObj.usancePeriodFrom = req.body.usancePeriodFrom;
    lcContractObj.initiatorIpfcDocHash = req.body.initiatorIpfcDocHash;
    lcContractObj.issuingBankId = req.body.bankId;
    // Advising bank ID to be saved in issuing bank form while submit
    // lcContractObj.advisingBankId = req.body.advBankId;
    lcContractObj.initiaterFileName = req.body.initiaterFileName;
    lcContractObj.lcInitDate = req.body.userDate;
    // casting poQuantity to Number, since lcContract DB requires number and UI is sending string
    lcContractObj.poQuantity = parseInt(req.body.poQuantity);
    lcContractObj.poCurrency = req.body.poCurrency;

    lcContractObj.save()
        .then(function(result) {
            return Promise.resolve(result);
        }, function(error) {
            return Promise.reject(error);
        })
        .then(function(savedresult) {
            socket.emit('createAgreement', savedresult);

        }, function(error) {

            return Promise.reject(error);
        })
        .then(function() {
            return res.status(200).json({
                "message": "Request submitted - Block chain processing initiated"

            });

        })
        .catch(function(error) {
            console.log(error);
            return res.status(500).json({
                "message": "Internal Server error"
            });
        });



}

//Upload  a file
exports.uploadFile = function(req, res) {
    var files = req.files.files;
    var ipfsFiles = [];
    for (var i = 0; i < 1; i++) {
        ipfs.util.addFromFs(files[i].path, function(err, response) {

            if (err) {
                console.log('addition to ipfs failed');
                var message = {
                    "status": "IPFS add failed"
                };
                return res.status(500).json(message);

            } else {
                console.log(response);
                return res.status(200).json(response);
            }

        });

    }


}



exports.uploadLocal = function(req, res) {
    var files = req.files.files;
    var ipfsFiles = [];

    for (var i = 0; i < 1; i++) {
        var path_to_local_dir = path.join(__dirname, "../uploadedFiles/" + files[i].name); 
        var oldLoc = files[i].path;

        fs.readFile(oldLoc, function(err, data) {
            fs.writeFile(path_to_local_dir, data, function(err) {
                fs.unlink(oldLoc, function() {
                    if (err) throw err;
                    res.send("File uploaded to: " + path_to_local_dir);
                });
            });

            console.log("File copied to the local directory");
        })



    }


}

exports.validatePoNumber = function(req, res) {

    var params = req.params;

    var poNumber = params.poNumber;
    var buyerId = params.buyerId;
    if (poNumber != undefined && poNumber != "" && poNumber != null) {
        // query to check poNumber for given buyerId
        lcContracts.count({
                'poNumber': poNumber,
                'buyerId': buyerId
            })
            .then(count => {
                if (count == 0) {
                    return res.status(200).send({
                        message: "po Number is Unique"
                    }).end();
                }
                res.status(409).send({
                    message: "po Number already exists"
                });
            })
            .catch(err => console.log(err));

    } else {
        console.log("UNDEFINED OR NULL !");
        return res.status(409).send({
            message: "po Number Undefined"
        }).end();
    }
}
