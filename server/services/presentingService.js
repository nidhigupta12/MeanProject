'use strict';
var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var userSchema = require('../models/userSchema.js');
var contractSchema = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var Promise = require('bluebird');

var ipfsAPI = require('ipfs-api');
var ipfs = Promise.promisifyAll(ipfsAPI(config.ipfsIp, config.ipfsPort, {
    protocol: 'http'
}));
var fs = require('fs');
var path = require('path');
var http = require('http');
var request = require('request');
var enums = require('../constants/enums.js');


var utils = require('../helpers/utils');
var Web3 = require('web3');
var web3 = new Web3();
var config = getConf('./property.js').get(process.env.NODE_ENV);
web3.setProvider(new web3.providers.HttpProvider(config.providerEndpoint));
var eth = web3.eth;

var socket = require('socket.io-client')('http://127.0.0.1:3012');




exports.getAll = function(req, res, next) {
    console.log("Service ***************");
    var user = req.user;
    return contractSchema.find({
            workflows: {
                $size: 8
            },
            'workflows.7.stage': enums.POST_MINING_ENUM.BENEFICIARY,
            'presentingBankId': user._id
        }, '-bcContractAddress -initiatorIpfcDocHash')
        .populate('buyerId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('sellerId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('advisingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('issuingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .exec()
        .then(acceptLodgementService => {
            if (!acceptLodgementService) {
                console.log("inside acceptLodgementService.getall()-1");
                return res.status(401).end();
            }
            res.status(200).json(acceptLodgementService);
        })
        .catch(err => next(err));
}

exports.acceptLC = function(req, res) {
    console.log("inside acceptLodgementService-acceptLC");
    var contractID = req.body.contractID;

    // Stage for acceptLodgementService
    var workflows1 = new workflowSchema();
    workflows1.stage = enums.PRE_MINING_ENUM.ADVISING_BANK_LODGEMENT;
    //  workflows1.stage = 499;

    contractSchema.findByIdAndUpdate(contractID, {
        $push: {
            workflows: workflows1
        }
    }).then(function(result) {
        console.log("create event to update in BLOCKCHAIN");
        return Promise.resolve(result);
    }, function(error) {
        return Promise.reject(error);
    }).then(function(savedresult) {
        console.log('1. Emitting accept LODGEMENT Call...');
        var data = {
            fromObjectId: savedresult.presentingBankId,
            toObjectId: savedresult.issuingBankId,
            state: enums.CONTRACT_STATE.PRESENTING_BANK_LODGEMENT,
            lcNumber: savedresult.lcNumber,
            primaryKey: savedresult._id,
            address: savedresult.bcContractAddress
        };
        console.log(data);

        socket.emit('doAcceptLodgementPres', data);
    }, function(error) {
        return Promise.reject(error);
    }).then(function() {
        console.log('2 Returning the response....................');
        return res.status(200).json({
            "message": "Request submitted - Block chain processing initiated"
        });

    }).catch(function(error) {
        console.log(error);
        return res.status(500).json({
            "message": "Internal Server error"
        });
    });


    //     console.log(result);
    //     var data = {
    //         fromObjectId: result.issuingBankId,
    //         toObjectId: result.buyerId,
    //         state: 5,
    //         lcNumber: result.lcNumber,
    //         primaryKey: result._id,
    //         address: result.bcContractAddress
    //     };
    //     console.log(data);
    //     socket.emit('doAccept', result);
    //     res.json({
    //         success: true
    //     });
    // }).then(function(result){
    //   console.log("*************** Blockchain information saved  : Mining Done *************** ");
    //
    // });
}


exports.retrieveFileFromIPFS = function(req, res) {
    console.log("inside issuing bank->retrieveFileFromIPFS()");
    console.log(req.params);
    var lcId = req.params.lcId;
    var lodgementDocumentId = String(req.params.fileName);
    console.log("userId->" + lcId);
    console.log("lodgementDocumentId->" + lodgementDocumentId);

    // contractSchema.find({'lodgementDocuments.$._id':new ObjectId(lodgementDocumentId)},  function(err, lcContractRecord)
    contractSchema.findOne({
        _id: lcId
    }, function(err, lcContractRecord) {
        if (lcContractRecord) {
            var hash;
            for (var t = 0; t < lcContractRecord.lodgementDocuments.length; t++) {
                var page = lcContractRecord.lodgementDocuments[t]._id;
                if (page == lodgementDocumentId) {
                    console.log("found hash");
                    console.log(page);
                    hash = page;
                    ipfs.cat(lcContractRecord.lodgementDocuments[t].ipfsDocHash).then(function(result) {

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

            }



        } else {
            return res.status(401).end();
        }
    });

}
