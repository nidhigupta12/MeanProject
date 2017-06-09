var express = require('express');
var router = express.Router();

// 2 level up
var issueService = require('../../services/issueService');


router.get('/issue', issueService.getAll);
router.get('/fetchdetail/:id', issueService.getdetail);

router.post('/submit/', issueService.submit);


module.exports = router;
