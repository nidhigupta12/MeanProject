/**
 *@author hitjoshi@deloitte.com
 * All routes are defined here
 * For further drill down go to respective files
 */
var express = require('express');
var router = express.Router();

var userSchema = require('../models/userSchema.js');



// router.use('/file', require('./routes/file'));
router.use('/user', require('./routes/user'));
// router.use('/eth', require('./routes/eth'));
router.use('/issuingForm', require('./routes/issueform'));
router.use('/dashboard', require('./routes/dashboard'));
router.use('/lcRequest', require('./routes/lcRequest'));
router.use('/advBank', require('./routes/advBank'));
router.use('/beneficiary', require('./routes/beneficiary'));
router.use('/notification', require('./routes/notification'));
router.use('/acceptLodgement', require('./routes/acceptLodgement'));

router.use('/applicant', require('./routes/applicationForm'));
router.use('/presenting', require('./routes/presentingBankApprove'));
router.use('/home', require('./routes/home'));
module.exports = router
