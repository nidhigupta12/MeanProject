// /**
//  *@author hitjoshi@deloitte.com
//  * Routes that go affect the blcokchain
//  * TODO Use Better File Naming convention & authentication
//  */
// var express = require('express');
// var router = express.Router();
// var auth = require('../../auth/../auth/authentication.js');
// var enums = require('../../constants/enums.js');
//
//
//
//
// var ethService = require('../../services/ethService');
//
// //main route
// router.get('/createAgreement', ethService.initiateContract);
// // router.get('/createAgreement', auth.hasRole(enums.ROLES_ENUM.INITIATOR),
// //     ethService.initiateContract);
//
// router.get('/issuelc', ethService.issueLc);
//
// router.get('/acceptlc', ethService.acceptLC);
//
// router.get('/createLodgment', ethService.createLodgment);
//
// router.get('/socket', ethService.testSocket);
//
// router.get('/deposit', ethService.deposit);
//
//
// router.get('/coinbase', ethService.getBaseAddress);
//
// router.get('/address', ethService.getAllAddress);
//
// router.get('/address/:address/balance', ethService.getAddressBalance);
//
// // router.get('/deploy', ethService.deploySimpleContract);
//
// // router.get('/address/balance', ethService.getAllAdressBalance);
//
// // router.get('/multiply/:num', ethService.invokeMultiplyBy);
//
// router.get('/deployagreement', ethService.deployAgreement);
//
// router.get('/savecontract', ethService.saveContract);
//
//
//
//
//
// module.exports = router;
