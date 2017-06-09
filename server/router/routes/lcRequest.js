var express = require('express');
var router = express.Router();
var lc = require('../../services/lcService.js');
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');

// router.post('/uploadfile', lc.uploadDoc );

router.post('/saveLcForm', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), lc.saveLcForm);
router.get('/getPoNumbers', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), lc.getPoNumbers);
router.get('/validateLcNumber/:lcNumber/:issuingBankId', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), lc.validateLcNumber);
router.get('/retreiveFile/:fileName', lc.getFileFromFileDir);
// router.get('/getIpfsFile/:fileName', lc.getIpfsFile );
router.get('/fetchAdvBank/:poNumber', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), lc.fetchUserWithRole);
module.exports = router;
