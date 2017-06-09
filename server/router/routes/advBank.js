var express = require('express');
var router = express.Router();

//
var advBankSrv = require('../../services/advBankService');
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');

router.get('/lcDetails', auth.hasRole(enums.ROLES_ENUM.ADVISING_BANK), advBankSrv.getAll);
router.post('/lcAccept', auth.hasRole(enums.ROLES_ENUM.ADVISING_BANK), advBankSrv.acceptLC);
router.post('/ipfs',advBankSrv.getIPFSFile);
router.get('/retreiveFile/:fileName',advBankSrv.getFileFromFileDir);

module.exports = router;
