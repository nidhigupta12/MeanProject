var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./userSchema.js');
var workflowSchema = require('./workflowSchema.js');
var lodgementSchema = require('./lodgementSchema.js');

var lc_contract = new Schema({
    poNumber: {
        type: String,
        required: "PO Number is required"
    },
    buyerId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    sellerId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    lcNumber: {
        type: String
    },
    poInitDate: {
        type: Date,
        default: Date.now
    },
    poItem: {
        type: String,
        required: "PO Item is required"
    },
    poValue: {
        type: String,
        required: "PO Value is required"
    },
    lcValue: {
        type: String
    },
    lcAmount: {
        type: Number
    },
    poCurrency: {
        type: String
    },
    // poCurrency:{type:String, default:"$"},
    lcDuration: {
        type: Number,
        required: "LC Duration is required"
    },
    tolerancePercent: {
        type: Number,
        default: 0
    },
    usancePeriod: {
        type: Number,
        required: "Usance required"
    },
    lcInitDateUTC: {
        type: Date,
        default: Date.now
    },
    lcInitDate: {
        type: Date
    },
    initiatorIpfcDocHash: {
        type: String,
        required: "Document required"
    },
    initiaterFileName: {
        type: String,
        required: "Documnent required",
        default: "temp.pdf"
    },
    termsCondition: {
        type: String
    },
    bcContractAddress: {
        type: String
    },
    lcCreationFee: {
        type: Number
    },
    advisingBankId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    issuingBankId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    presentingBankId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    workflows: ['workflowSchema'],
    lodgementDocuments: ['lodgementSchema'],
    billNumber: {
        type: String
    },
    billQuantity: {
        type: String
    },
    billAmount: {
        type: String
    },
    poQuantity: {
        type: Number,
        default: 0
    },
    billLading: {
        type: String
    },
    lcDocsRequired: {
        type: String
    },
    lcExpirationDate: {
        type: Date
    },
    usancePeriodFrom: {type: String, enum: ['Lading','Expiry']}  
});

lc_contract.pre('save', function(next) {
    var lcContract = this;
    var lcInitDate = lcContract.lcInitDate;
    var lcDuration = lcContract.lcDuration;
    var usancePeriod = lcContract.usancePeriod;
    var days = lcDuration + usancePeriod;
    console.log("Days   " + days);
    var result = new Date(lcInitDate);
    result.setDate(result.getDate() + days);
    console.log(result);
    lcContract.lcExpirationDate = result;
    next();
});
module.exports = mongoose.model('lcContract', lc_contract);
