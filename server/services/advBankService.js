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

exports.getFileFromFileDir = function(req, res) {
    var primaryId = req.params.fileName;
    //  new ObjectId(primaryId)
    contractSchema.findById(primaryId,  function(err, lcContract)  {      
        if  (lcContract)  {       
            ipfs.cat(lcContract.initiatorIpfcDocHash).then(function(result) {
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

exports.getIPFSFile = function(req, res) {
    console.log("inside advBankService-2");
    var ipfsHash = req.body.ipfsHash;

    console.log("ipfsHash is " + ipfsHash);
    var hash = "QmZw7CMrU99SrU2JpjJFdEAhFrTneoTEr1y1H7VrmNoRPn";
    //"QmVw6psvosedb84QsSVuJ2t6JHZ4827ABCtDj9Xp7kzbga";
    //"QmZw7CMrU99SrU2JpjJFdEAhFrTneoTEr1y1H7VrmNoRPn";
    console.log("hvhbj" + hash);

    if (typeof hash === 'undefined') {
        // do nothing
        console.log("inside file - undefined");
        res.end();
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Content-Type", "application/text");
        res.header("access-control-allow-credentials", "true");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Accept");

        var current_path_to_locales_dir = path.join(__dirname, "../uploadedFiles");
        console.log("PATH is =" + current_path_to_locales_dir);

        var fileName = "testing-12.pdf";
        var filePath = current_path_to_locales_dir + "/" + fileName;
        var tempPath = current_path_to_locales_dir + "/" + "test.pdf";
        var file = fs.createWriteStream(filePath);
        console.log("filePath=" + filePath);
        var resp = '';

        var  options  =   {  
            host:   'localhost',
              port:  443,
              path:   '/broker/rest/api',
              method:   'GET'
        };
        var url = "http://ipfs.io/ipfs/QmZw7CMrU99SrU2JpjJFdEAhFrTneoTEr1y1H7VrmNoRPn";
        //var url = "https://ipfs.io/ipfs/QmZw7CMrU99SrU2JpjJFdEAhFrTneoTEr1y1H7VrmNoRPn";
        //var url = "http://localhost:8085/ipfs/QmZw7CMrU99SrU2JpjJFdEAhFrTneoTEr1y1H7VrmNoRPn";
        /*
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
          }
        });
        */
        var tempFile = fs.createWriteStream(tempPath);
        tempFile.on('open', function(fd) {
            console.log("=========1=====");
            http.request(url, function(res) {
                console.log("=========2=====");
                res.on('data', function(chunk) {
                    console.log("=========3=====");
                    tempFile.write(chunk);
                }).on('end', function() {
                    console.log("=========4=====");
                    tempFile.end();
                    console.log("=========5=====");
                    fs.renameSync(tempFile.path, filepath);
                    return filepath;
                });
            });
        });

        //
        /*	 var tempFile = fs.createWriteStream(tempPath);
        	 tempFile.on('open', function(fd) {
        		ipfs.cat(hash, function (err, stream) {
        			stream.on('data', function(chunk) {
        				tempFile.write(chunk);
        			}).on('end', function() {
        				tempFile.end();
        				fs.renameSync(tempFile.path, filepath);
        				return filepath;
        			});
        		});
        	});*/
        //
    }
}

exports.acceptLC = function(req, res) {
    console.log("inside advBankService-2");
    var contractID = req.body.contractID;

    // Stage for Adivising bank
    var workflows1 = new workflowSchema();
    workflows1.stage = enums.PRE_MINING_ENUM.ADVISING_BANK;

    contractSchema.findByIdAndUpdate(contractID, {
        $push: {
            workflows: workflows1
        }
    }).then(function(result) {
        console.log('Adv Bank Update done ---> Socket start---->')
        console.log(result);
        // Adv Bank accepts LC  -- state 2...
        //issuing bank accept lodgement state 4
        //
        var data = {
            fromObjectId: result.advisingBankId,
            toObjectId: result.sellerId,
            state: enums.CONTRACT_STATE.ADVISING_BANK,
            lcNumber: result.lcNumber,
            primaryKey: result._id,
            address: result.bcContractAddress
        };

        socket.emit('doAccept', data);
        res.json({
            success: true
        });
    });
}


exports.getAll = function(req, res, next) {
    console.log("inside advBankService-1");
    var user = req.user;
    return contractSchema.find({
            workflows: {
                $size: 4
            },
            'workflows.3.stage': enums.POST_MINING_ENUM.ISSUING_BANK,
            'advisingBankId': user._id
        }, '-bcContractAddress -initiatorIpfcDocHash')
        .populate('buyerId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('sellerId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('advisingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('issuingBankId', '-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .exec()
        .then(advBankService => {
            if (!advBankService) {
                console.log("inside advBankService.getall()-1");
                return res.status(401).end();
            }
            console.log("advBankService=" + advBankService);
            //console.log(advBankService.sort());
            res.status(200).json(advBankService);
        })
        .catch(err => next(err));
}
