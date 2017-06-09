var express = require('express');
var router = express.Router();
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');

// 2 level up
var applicationService = require('../../services/applicationService');

router.get('/onload/', auth.hasRole(enums.ROLES_ENUM.INITIATOR), applicationService.onload);
router.get('/validatePoNumber/:poNumber/:buyerId', auth.hasRole(enums.ROLES_ENUM.INITIATOR), applicationService.validatePoNumber);
router.post('/submit/', auth.hasRole(enums.ROLES_ENUM.INITIATOR), applicationService.submit);
router.post('/upload', multipartyMiddleware, applicationService.uploadFile);
router.post('/uploadLocal', multipartyMiddleware, applicationService.uploadLocal);




module.exports = router;
