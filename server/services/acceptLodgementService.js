'use strict';
var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var userSchema = require('../models/userSchema.js');
var contractSchema = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var lodgementSchema = require('../models/lodgementSchema.js');
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
    var user = req.user;
    return contractSchema.find({
            workflows: {
                $size: 10
            },
            'workflows.9.stage': enums.POST_MINING_ENUM.ADVISING_BANK_LODGEMENT,
            'issuingBankId': user._id
        }, '-bcContractAddress -initiatorIpfcDocHash')
        .populate('buyerId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('sellerId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('advisingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('issuingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('presentingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
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

exports.retrieveFileFromIPFS = function(req, res) {
    console.log("inside issuing bank->retrieveFileFromIPFS()");
    var contractId = req.params.contractId;
    var lodgementDocumentId = String(req.params.lodgementDocumentId);
    console.log("contractId->" + contractId);
    console.log("lodgementDocumentId->" + lodgementDocumentId);

    // contractSchema.find({'lodgementDocuments.$._id':new ObjectId(lodgementDocumentId)},  function(err, lcContractRecord)
    contractSchema.findOne({
        _id: contractId
    },  function(err, lcContractRecord)  {      
        if  (lcContractRecord)  {  
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


                
        } 
        else  {        
            return res.status(401).end();      
        }    
    });

}

exports.acceptLC = function(req, res) {
    console.log("inside acceptLodgementService-acceptLC");
    var contractID = req.body.contractID;

    // Stage for acceptLodgementService
    var workflows1 = new workflowSchema();
    workflows1.stage = enums.PRE_MINING_ENUM.ISSUING_BANK_LODGEMENT;

    contractSchema.findByIdAndUpdate(contractID, {
        $push: {
            workflows: workflows1
        }
    }).then(function(result) {
        console.log("create event to update in BLOCKCHAIN");
        console.log(result);
        var data = {
            fromObjectId: result.issuingBankId,
            toObjectId: result.buyerId,
            state: enums.CONTRACT_STATE.ISSUING_BANK_LODGEMENT,
            lcNumber: result.lcNumber,
            primaryKey: result._id,
            address: result.bcContractAddress
        };

        console.log(data);
        socket.emit('doAcceptLodgementIsu', data);
        res.json({
            success: true
        });
    });
}
