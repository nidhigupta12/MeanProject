var express = require('express');
var router = express.Router();
var lc = require('../../services/beneficiaryService.js');
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

// router.get('/getPoNumbers', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), lc.getPoNumbers );
router.get('/getLcNumbers', auth.hasRole(enums.ROLES_ENUM.BENEFICIARY), lc.getLcNumbers);
router.get('/validateBillNumber/:billNumber/:sellerId', auth.hasRole(enums.ROLES_ENUM.BENEFICIARY), lc.validateBillNumber);
router.get('/getPresentingBank/:lcNumber', auth.hasRole(enums.ROLES_ENUM.BENEFICIARY), lc.getPresentingBank);
router.post('/saveLodgementForm', auth.hasRole(enums.ROLES_ENUM.BENEFICIARY), lc.saveLodgementForm);
router.post('/upload', multipartyMiddleware, lc.uploadFile);
// router.post('/uploadLocal', multipartyMiddleware, lc.uploadLocal);
module.exports = router;
