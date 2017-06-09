'use strict';

exports.ROLE_WORKFLOW_SIZE_MAP = Object.freeze({
  100 : 0,
  200 : 2,
  201 : 10,
  300 : 4,
  400 : 6,
  500 : 8,
});

exports.ROLE_WORKFLOW_STAGE_MAP = Object.freeze({
  100 : 0,
  200 : 100,
  201 : 500,
  300 : 200,
  400 : 300,
  500 : 400,
});

exports.ROLE_USER_MAP = Object.freeze({
  100 : 'buyerId',
  200 : 'issuingBankId',
  201 : 'acceptLodgment',
  300 : 'advisingBankId',
  400 : 'sellerId',
  500 : 'presentingBankId',
});

exports.ROLES_ENUM = Object.freeze({
    "INITIATOR": 100,
    "ISSUING_BANK": 200,
    "ADVISING_BANK": 300,
    "BENEFICIARY": 400,
    "PRESENTING_BANK": 500
});

exports.PRE_MINING_ENUM = Object.freeze({
    "INITIATOR": 99,
    "ISSUING_BANK": 199,
    "ADVISING_BANK": 299,
    "BENEFICIARY": 399,
    "ADVISING_BANK_LODGEMENT": 499,
    "ISSUING_BANK_LODGEMENT": 599
});

exports.POST_MINING_ENUM = Object.freeze({
    "INITIATOR": 100,
    "ISSUING_BANK": 200,
    "ADVISING_BANK": 300,
    "BENEFICIARY": 400,
    "ADVISING_BANK_LODGEMENT": 500,
    "ISSUING_BANK_LODGEMENT": 600
});

exports.CONTRACT_STATE = Object.freeze({
    "INITIATOR": 0,
    "ISSUING_BANK": 1,
    "ADVISING_BANK": 2,
    "BENEFICIARY": 3,
    "PRESENTING_BANK_LODGEMENT": 4,
    "ISSUING_BANK_LODGEMENT": 5
});
