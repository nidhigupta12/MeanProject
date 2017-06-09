var express = require('express');
var router = express.Router();
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');


// 2 level up
var presentingService = require('../../services/presentingService');

router.get('/lcDetails/', auth.hasRole(enums.ROLES_ENUM.PRESENTING_BANK), presentingService.getAll);
router.post('/acceptLC', auth.hasRole(enums.ROLES_ENUM.PRESENTING_BANK), presentingService.acceptLC);

router.get('/retreiveFile/:lcId/:fileName', presentingService.retrieveFileFromIPFS);




module.exports = router;
