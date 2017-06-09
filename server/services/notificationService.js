'use strict';

var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var notificationSchema = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');

exports.getAll = function(req, res, next) {
    return notificationSchema.find({},{workflows:{$slice: 499}}).populate('buyerId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('sellerId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('advisingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('issuingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password').sort({
            'workflows.createdDateUTC': -1
        }).exec()
        .then(notifications => {
            if (!notifications) {
                console.log("inside notification.getall()-1");
                return res.status(401).end();
            }
         //console.log(notifications.sort());
            res.status(200).json(notifications);
        })
        .catch(err => next(err));
}
