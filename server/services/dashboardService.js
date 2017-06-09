'use strict';

var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var dashboardSchema = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');


exports.getAll = function(req, res, next) {
    console.log("inside dashboardService-getAll-1");
    /*
	var workflows = new workflowSchema();
		workflows.stage="1";
		//workflows.transactionHash="transactionHash-1";

	var workflows1 = new workflowSchema();
		workflows1.stage="2";
		//workflows1.transactionHash="transactionHash-2";

	var workflows2 = new workflowSchema();
		workflows2.stage="3";
		//workflows2.transactionHash="transactionHash-3";

	var workflows3 = new workflowSchema();
		workflows3.stage="4";
		//workflows3.transactionHash="transactionHash-4";

	var workflows4 = new workflowSchema();
		workflows4.stage="5";
		//workflows4.transactionHash="transactionHash-5";

	var result = [];
	result.push(workflows);
	result.push(workflows1);
	result.push(workflows2);
	result.push(workflows3);
	result.push(workflows4);
	console.log("inside dashboardService-getAll function===="+workflowSchema);

	var contract = new dashboardSchema();
	contract.poNumber="a_po_number";
	contract.poItem="a_po_item";
	contract.poValue="a_po_value"
	contract.poCurrency="a_po_currency";
	contract.lcNumber="a_lc_number";
	contract.lcDuration=20;
	contract.usancePeriod=21;
	contract.lcValue="a_lc_value";
	contract.initiatorIpfcDocHash="a_ipfs_hash";
	contract.workflows=result;
	contract.buyerId="58abe49f48be2f3fe42f846a";
	contract.sellerId="58abe49f48be2f3fe42f846d";
	contract.advisingBankId="58abe49f48be2f3fe42f846c";
	contract.issuingBankId="58abe49f48be2f3fe42f846b"

		console.log("contract="+contract);
        contract.save()
            .then(function(lcContracts) {
                var token = jwt.sign({
                    _id: lcContracts._id
                }, config.secrets.session, {
                    expiresIn: 60 * 60 * 5
                });
                res.json({
                    token
                });

				res.status(200).end();
            })
            .catch(validationError(res));

	*/

   // return dashboardSchema.find({},{'workflows.stage':{$in:[100,200,300,400,500,600]}}).populate('buyerId','-_id
   // find().where('workflows.stage').in([100,200,300,400,500,600])
	return dashboardSchema.find().populate('buyerId','-_id   -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('sellerId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('advisingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('issuingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('presentingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password').sort({
            'poNumber': -1
        }).exec()
        .then(dashboards => {
            if (!dashboards) {
                console.log("inside dashboard.getall()-1");
                return res.status(401).end();
            }

            // console.log("dashboards=" + dashboards);
            // console.log("inside dashboard.getall()-2" + dashboards);
            //console.log(dashboards.sort());
            res.status(200).json(dashboards);
        })
        .catch(err => next(err));
}

/* Retrieve data from DB using start and end date */
exports.getByDate = function(req, res, next) {
    console.log("inside dashboardService-getByDate-");
	/*var startDt = req.params.startDate;
	var endDt = req.params.endDate;
	console.log("startDt="+startDt);
	console.log("endDt="+endDt);*/

	console.log("=========================");
	var startDate_1 = new Date(new Date(req.params.startDate).toISOString());
	console.log("========startDate="+startDate_1);

	var endDt = new Date(req.params.endDate);
	endDt.setDate(endDt.getDate()+1);

	var endDate_1 = new Date(endDt.toISOString());
	console.log("========endDate_1="+endDate_1);
	console.log("=========================");
	//Thu Mar 02 2017 00:00:00 GMT+0530 (India Standard Time)

	return dashboardSchema.find({"workflows" : {"$elemMatch" :{"createdDateUTC":{
		"$gte" : startDate_1,
	"$lte" : endDate_1}}}}).populate('sellerId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('advisingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password')
        .populate('issuingBankId','-_id -blockchainAddress -blockchainAcPwd -salt -password').sort({
            'poNumber': -1
        }).exec()
        .then(dashboards => {
            if (!dashboards) {
                console.log("inside dashboard.getall()-1");
                return res.status(401).end();
            }

           // console.log("dashboards=" + dashboards);
            //console.log("inside dashboard.getall()-2" + dashboards);
            //console.log(dashboards.sort());
            res.status(200).json(dashboards);
        })
        .catch(err => next(err));
}
