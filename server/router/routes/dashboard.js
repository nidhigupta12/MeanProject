var express = require('express');
var router = express.Router();

//var auth = require('../../auth/auth.service.js');

//
var dashboardService = require('../../services/dashboardService');

router.get('/LCDetails', dashboardService.getAll);
router.get('/fetchPO/:startDate/:endDate', dashboardService.getByDate);


module.exports = router;
