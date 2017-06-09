'use strict';

var config = getConf('./property.js').get(process.env.NODE_ENV);
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var LcContract = require('../models/lcContractSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var userSchema = require('../models/userSchema.js')
var enums = require('../constants/enums.js');
var user = require('../models/userSchema.js');
var Promise = require('bluebird');

exports.getAll = function(req, res, next) {
    var userInfo = req.user;
    console.log("HOME PAGE SERVICE ");
    console.log(userInfo);

    // Query to populate roles collection according to id in roles field
    userInfo.populateRoles()
    .then( function(result){
        var roleArr = result;
        console.log(roleArr);

        // Add identifier for acceptLodgment if role is 200(ISSUING_BANK)
        if( roleArr.indexOf(200) != -1){
          console.log("Issuing Bank exists!");
          roleArr.push(201);
        }
        console.log("New roleArr");
        console.log(roleArr);
        var lcContractsPromisesArray = [];
        for( var i=0; i<roleArr.length; ++i ){
          lcContractsPromisesArray.push(new Promise(function(resolve, reject) {
            console.log("Role and size of workflow");
            console.log(roleArr[i]);
            var currentRole = roleArr[i];
            // console.log(enums.ROLE_WORKFLOW_SIZE_MAP[currentRole]);
            var workflowSize = enums.ROLE_WORKFLOW_SIZE_MAP[currentRole];
            var workflowIndex = workflowSize - 1;
            var roleName = enums.ROLE_USER_MAP[currentRole];
            console.log("role=> " + roleArr[i]);
            console.log("workflow size=> " + workflowSize);
            console.log("workflowIndex=> " + workflowIndex);
            console.log("roleName=> " + roleName);
            var query = {};
            var selector = "";
            query["$and"] = [];
            query["$and"].push({ workflows: {$size: workflowSize} });
            if( roleName == "issuingBankId" ){
              query["$and"].push({ "workflows.1.stage" : enums.ROLE_WORKFLOW_STAGE_MAP[currentRole] , "issuingBankId" : userInfo._id });
              selector = "poNumber -_id";
            }
            else if ( roleName == "buyerId" ) {
              query["$and"].push({ "buyerId" : userInfo._id });
              selector = "poNumber lcNumber -_id";
            }
            else if( roleName == "advisingBankId" ){
              query["$and"].push({ "workflows.3.stage" : enums.ROLE_WORKFLOW_STAGE_MAP[currentRole] , "advisingBankId" : userInfo._id });
              selector = "lcNumber -_id";
            }
            else if( roleName == "sellerId" ){
              // beneficiary
              query["$and"].push({ "workflows.5.stage" : enums.ROLE_WORKFLOW_STAGE_MAP[currentRole] , "sellerId" : userInfo._id });
              selector = "lcNumber -_id";
            }
            else if ( roleName == "presentingBankId" ) {
              query["$and"].push({ "workflows.7.stage" : enums.ROLE_WORKFLOW_STAGE_MAP[currentRole] , "presentingBankId" : userInfo._id });
              selector = "lcNumber -_id";
            }
            else if ( roleName == "acceptLodgment" ) {
              query["$and"].push({ "workflows.9.stage" : enums.ROLE_WORKFLOW_STAGE_MAP[currentRole] , "issuingBankId" : userInfo._id });
              selector = "lcNumber -_id";
            }
            console.log(query);

            LcContract.find(query , selector)
                .then(docs => {
                    if (!docs) {
                        console.log("inside docs.find()-1");
                        reject(docs);
                    }
                    // console.log(docs[0]);
                    // Find state of LcContract ==> is It actionable for particular role
                    // var workflowArray = docs[0].workflows;
                    // console.log(workflowArray);
                    // var stateOfLcContract = workflowArray[ workflowArray.length - 1 ].stage;
                    // console.log(stateOfLcContract);
                    var docsObject = {};
                    docsObject[roleName] = docs;
                    resolve(docsObject);
                });
            }));
            // lcContractsPromisesArray push method end
        }
        // end for loop
        console.log("Printing Final Array of LcContracts");
        Promise.all(lcContractsPromisesArray).then(function(result) {
          console.log("Returning all promises from lcContractsArray!!");
          console.log(result);
          return res.status(200).json(result);
        }, function(err){
            console.log("Something went wrong in lcContractsArray Promises !!");
            console.log(err);
            return res.status(500).json({"message":"lcContractsArray building Failed !!"});
        });
    },function(err){
      console.log("Error populateRoles function");
    });
    // userSchema.find({
    //   "_id":userInfo._id
    // },"role -_id")
    // .populate("role","roleId")
    // .then(docs => {
    //     if (!docs) {
    //         console.log("inside docs.find()-1");
    //         return res.status(401).end();
    //     }
    //     console.log("inside then userSchema find");
    //     var roleObjectArr = docs[0].role;
    //     console.log(roleObjectArr);
    //     var roleArr = [];
    //     for( var i=0; i<roleObjectArr.length; ++i){
    //       roleArr.push(roleObjectArr[i].roleId);
    //     }
    //     console.log(roleArr);
    //     // res.status(200).send(docs);
    // })
    // .catch(err => console.log(err));

    // if (enums.ROLES_ENUM.INITIATOR == userInfo.role) {
    //     console.log("INITIATOR ");
    //     return res.status(200).end();
    // } else {
    //     console.log(" DEFAULT user");
    //     return homePageData.find({}, "lcNumber poNumber workflows.stage sellerId")
    //         .exec()
    //         .then(data => {
    //             if (!data) {
    //                 return res.status(401).end();
    //             }
    //             for (var i = 0; i < data.length; i++) {
    //                 var work = [];
    //                 work = data[i].workflows;
    //                 var max = 0;
    //                 for (var j = 0; j < work.length; j++) {
    //                     if (max < work[j].stage) {
    //                         max = work[j].stage;
    //                     }
    //                 }
    //                 // LC value stores the max of the stage
    //                 data[i].lcValue = max;
    //             }
    //
    //             var userId = userInfo._id;
    //             var dataDoc = [];
    //             if(userInfo.role==enums.ROLES_ENUM.ISSUING_BANK)  {
    //               dataDoc = data.filter(function( dataObj ) {
    //               return (dataObj.lcValue=='500' || dataObj.lcValue=='100') ;
    //               });
    //
    //             } else if (userInfo.role==enums.ROLES_ENUM.ADVISING_BANK) {
    //               dataDoc = data.filter(function( dataObj ) {
    //               return dataObj.lcValue=='200';
    //               });
    //
    //             } else if (userInfo.role==enums.ROLES_ENUM.BENEFICIARY) {
    //                 dataDoc = data.filter(function( dataObj ) {
    //                 return (dataObj.lcValue=='300' && ((dataObj.sellerId.toString())==(userId.toString())));
    //                 });
    //
    //             }else if (userInfo.role==enums.ROLES_ENUM.PRESENTING_BANK) {
    //                 dataDoc = data.filter(function( dataObj ) {
    //                 return (dataObj.lcValue == '400');
    //                 });
    //             }
    //             console.log("final filtered data");
    //             console.log(dataDoc);
    //           res.status(200).json(dataDoc);
    //         }).catch(err => next(err));
    //
    // }


}
