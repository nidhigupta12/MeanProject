var express = require('express');
var router = express.Router();

//var auth = require('../../auth/auth.service.js');

//
var notificationService = require('../../services/notificationService');

router.get('/LCDetails', notificationService.getAll);


module.exports = router;
