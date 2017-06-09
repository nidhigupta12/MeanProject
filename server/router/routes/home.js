var express = require('express');
var router = express.Router();

//
var homeSrv = require('../../services/homePage');
var auth = require('../../auth/../auth/authentication.js');
var enums = require('../../constants/enums.js');


router.get('/details',auth.isAuthenticated() ,homeSrv.getAll);

module.exports = router;
