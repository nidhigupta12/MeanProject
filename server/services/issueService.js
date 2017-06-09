'use strict';
var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var lcContracts = require('../models/lcContractSchema.js');

exports.getAll = function(req, res, next) {
    console.log("inside IssueForm controller");
    return lcContracts.find().exec()
        .then(lcContract => {
            if (!lcContract) {
                console.log("inside IssueForm 401");
                return res.status(401).end();
            }
            console.log("inside IssueForm success");
            res.status(200).json(lcContract);
        })
        .catch(err => next(err));
}

exports.getdetail = function(req, res, next) {
    var po = req.params.id;
    return lcContracts.findOne({
            po: po
        }).exec()
        .then(lcContract => {
            if (!lcContract) {
                return res.status(401).end();
            }
            res.status(200).json(lcContract);
        })
        .catch(err => next(err));
}


exports.submit = function(req, res, next) {
    //log.console("Submit for the id =====");
    var po = req.body.po;
    console.log('This is ----->' + po);

    // return res.status(200).json({"HI":"There"});
    return lcContracts.update({
            'po': po
        }, {
            $set: {
                'ipfsImgHash': 'www.google.com'
            }
        })
        .then(function(result) {
            console.log(result);
        }, function() {
            console.log('error occurred');
        }).catch();

}
