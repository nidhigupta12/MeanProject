var express = require('express');
var router = express.Router();

//
var acceptLodgementSrv = require('../../services/acceptLodgementService');
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');

router.get('/lcDetails', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), acceptLodgementSrv.getAll);
router.post('/acceptLC', auth.hasRole(enums.ROLES_ENUM.ISSUING_BANK), acceptLodgementSrv.acceptLC);
router.get('/retreiveFile/:contractId/:lodgementDocumentId',acceptLodgementSrv.retrieveFileFromIPFS);

module.exports = router;
