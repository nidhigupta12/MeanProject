// /**
//  *@author hitjoshi@deloitte.com
//  * Service that deals with Blockchain in general
//  *
//  */
// var utils = require('../helpers/utils');
// var Web3 = require('web3');
// var web3 = new Web3();
// var ContractEntry = require('../models/contractentry');
// var config = getConf('./property.js').get(process.env.NODE_ENV);
// web3.setProvider(new web3.providers.HttpProvider(config.providerEndpoint));
// var eth = web3.eth;
// var socket = require('socket.io-client')('http://127.0.0.1:3012');
// var contractSchema = require('../models/lcContractSchema.js');
//
//
//
// socket.on('error', function() {
//     console.log('---------error occurred in connecting-------------');
// });
//
// // deploy Solidity code
// exports.initiateContract = function(req, res, next) {
//     console.log('================Create LC Agreement  ====================');
//     // hardcoding Now - get it from request
//     var data = {
//         from: web3.eth.accounts[1],
//         to: web3.eth.accounts[2],
//         poNumber: 'XYZ',
//         name: 'Hitesh',
//         hash: utils.hex2ipfshash('QmVTiJWdnRfqZ9rVprpT9YF3GYx8jGnoBb5gGCd5C5hnK8')
//     };
//     socket.emit('createAgreement', data);
//
//     socket.on('contractCreationComplete', function(result) {
//         console.log('========= Contract deployed =======================');
//         // use this data to update contract in MongoDb
//         // save this to MongoDb
//         console.log(result.address);
//         return res.status(200).json({
//             "message": "LC Created",
//             "bcAddress": result.address
//         });
//     });
// }
//
// // Issuing Bank issues LC
// exports.issueLc = function(req, res, next) {
//
//     // uint timestamp, address from, address to,string lcNumber,string poNumber
//     //TODO : Change Hardcoded data frm inputs
//     var data = {
//         from: web3.eth.accounts[1],
//         to: web3.eth.accounts[2],
//         lcNumber: 'LCNUmber',
//         poNumber: 'PO Number',
//         bcContractAddress: '0xc08548f1649a13cb9d3b14b2a361958aa31f6c43'
//     };
//     socket.emit('doIssueLc', data);
//     socket.on('lcIssuedByBank', function(result) {
//         return res.status(200).json({
//             "message": "LC being mined",
//             "bcAddress": result.bcTxHash
//         });
//
//     });
//
// }
//
// // Apparently this is a common function to be used by both banks
// // Accept LC by Advising bank
// // Accept Lodgement by Advising Bank
// // Accept Lodgement by Issuing Bank
// // function accept(uint timestamp, address from, address to, uint new_state,string lcNumber)
// exports.acceptLC = function(req, res, next) {
//     console.log('================ Accept LC ================');
//     var contractID = "58ba55e0266be41aa0b20a31";
//     //TODO : Change Hardcoded data frm inputs
//     // var data = {
//     //     from: web3.eth.accounts[1],
//     //     to: web3.eth.accounts[2],
//     //     state: '1',
//     //     lcNumber: 'lcNumber',
//     //     bcContractAddress: '0x1c7487168eb601a3e5b15f19fe1089a0ca20b4ff'
//     // };
//     contractSchema.findById(contractID).then(function(result) {
//         console.log(result);
//         socket.emit('doAccept', result);
//     }, function(err) {
//         console.log(err);
//     })
//
//     // socket.on('acceptCompleted', function(result) {
//     //     console.log('========= Issue LC Callback on NodeJs ==================');
//     //     // use this data to update contract in MongoDb
//     //     // save this to MongoDb
//     //     console.log(result.bcTxHash);
//     //     return res.status(200).json({
//     //         "message": "LC Issued",
//     //         "bcAddress": result.bcTxHash
//     //     });
//     //
//     // });
//
//
// }
//
// // function createLodgement(uint timestamp, address from, address to,
// // string lcNumber, string name, bytes32 hash,string invoiceNumber)
// exports.createLodgment = function(req, res, next) {
//     console.log('================ Create Lodgement By receiver ================');
//     //TODO : Change Hardcoded data frm inputs
//     var data = {
//         from: web3.eth.accounts[1],
//         to: web3.eth.accounts[2],
//         lcNumber: 'HITESH_Lc_Number',
//         name: 'Name',
//         hash: utils.hex2ipfshash('QmVTiJWdnRfqZ9rVprpT9YF3GYx8jGnoBb5gGCd5C5hnK8'),
//         invoiceNumber: 'invoiceNumber',
//         bcContractAddress: '0xC27B942B4d1c3E9639d6Eccc5c1AE9957c62bcdF'
//     };
//     socket.emit('doLodgement', data);
//     return res.status(200).json({
//         "message": "Lodgement Created",
//
//     });
//     // socket.on('lodgementCreated', function(result) {
//     //     console.log('=======Lodgement Accepted callback on NodeJS===========');
//     //     // use this data to update contract in MongoDb
//     //     // save this to MongoDb
//     //     console.log(result.bcTxHash);
//     //     return res.status(200).json({
//     //         "message": "Lodgement Created",
//     //         "bcAddress": result.bcTxHash
//     //     });
//     //
//     // });
//
// }
//
// // Dummy code to explain Use of Promises
// exports.saveContract = function(req, res, next) {
//     // Contract entry schema
//     var senderEntry = new ContractEntry({
//         po: 1,
//         bc_address: 'contract.address',
//         member_address: 'sender',
//         state: 0
//     });
//     var receiverEntry = new ContractEntry({
//         po: 2,
//         bc_address: 'contract.address',
//         member_address: 'receiver',
//         state: 0
//     });
//     var guarantorEntry = new ContractEntry({
//         po: 3,
//         bc_address: 'contract.address',
//         member_address: 'data.guarantor',
//         state: 0
//     });
//
//
//     senderEntry.save().then(function(sender) {
//             return Promise.resolve(sender.member_address);
//         })
//         .then(function(results) {
//             receiverEntry.save()
//                 .then(function(receiver) {
//                     console.log(receiver);
//                     var results2 = {
//                         'sender': results,
//                         'receiver': receiver.member_address
//                     };
//
//                     return Promise.resolve(results2);
//                 })
//                 .then(function(reslt) {
//                     console.log(reslt);
//                     guarantorEntry.save().then(function(gurantor) {
//                         var results3 = {
//                             'reslt': reslt,
//                             'gurantor': gurantor.member_address
//                         };
//                         return res.status(200).json(results3);
//                     })
//                 })
//                 .catch(function(err) {
//                     console.log(err);
//                     console.log('error occurred');
//                 });
//         });
// }
//
// exports.deposit = function(req, res, next) {
//
//     console.log('Single deposit');
//
//     socket.emit('doDeposit', {
//         test: 'abc',
//         hi: 'there',
//         fileHash: 'hash',
//         bcContractAddress: "0xf3996b463a78e1fb1a483b7ecfda898a4031e912"
//     });
//
//     socket.on('depositComplete', function(data) {
//         console.log('==============Deposit completed====================== ');
//         console.log(data);
//         return res.status(200).json({
//             "message": "LC Created",
//             "bcAddress": data.address
//         });
//     });
// }
// exports.testSocket = function(req, res, next) {
//     //instantiate and emit socket event createConference
//     console.log('================Deploying Conference  ====================');
//     socket.emit('createConference', {
//         test: 'abc',
//         hi: 'there',
//         fileHash: 'hash'
//     });
//
//     socket.on('contractCreationComplete', function(data) {
//         // console.log('========= Firing Deposit event =======================');
//         // socket.emit('doDeposit', {
//         //     contract_bc_address: data.address
//         // });
//         return res.status(200).json({
//             "message": "LC Created",
//             "bcAddress": data.address
//         });
//     });
//
//     // socket.on('depositComplete', function(data) {
//     //     console.log('==============Deposit completed====================== ');
//     //     console.log(data);
//     //     return res.status(200).json({
//     //         "message": "LC Created",
//     //         "bcAddress": data.address
//     //     });
//     // });
// }
//
//
//
//
// exports.getBaseAddress = function(req, res, next) {
//     var coinbase = eth.coinbase;
//     var balance = eth.getBalance(coinbase);
//     var test = {};
//     test.coinbase = coinbase;
//     test.balance = balance;
//     return res.json(test);
// }
//
// exports.getAllAddress = function(req, res, next) {
//     return eth.getAccounts(function(error, result) {
//         if (error) {
//             return res.status(401).end();
//         }
//         return res.json(result);
//     })
// }
//
// exports.getAddressBalance = function(req, res, next) {
//     var addressId = req.params.address;
//     console.log("Here " + addressId);
//     var bal = new BigNumber(web3.fromWei(eth.getBalance(addressId)));
//     console.log('balnace ' + bal);
// }
//
// exports.deployAgreement = function(req, res, next) {
//
//     console.log("test");
//     //Load file into string
//     var agreementSol = utils.getFileStrNoWhitespace('./server/contracts/Agreement.sol');
//     var agreementCompiled = web3.eth.compile.solidity(agreementSol);
//     web3.eth.defaultAccount = web3.eth.coinbase;
//     web3.personal.unlockAccount(web3.eth.defaultAccount, config.coinbasePwd, 100000);
//     var options = {
//         from: web3.eth.defaultAccount,
//         data: agreementCompiled.Agreement.code,
//         gas: 4712000
//     };
//     var transactionHash;
//     var contractHash;
//     web3.eth.contract(agreementCompiled.Agreement.info.abiDefinition)
//         .new(Date.now(), web3.eth.accounts[1], web3.eth.accounts[2], options,
//             function(error, result) {
//                 // if (error) {
//                 //     console.log("Error " + error);
//                 //
//                 // } else {
//                 console.log("<--------------callback CALLED -------------->");
//                 //  if (result) {
//                 if (!result.address) {
//                     console.log("Contract transaction send: TransactionHash: " +
//                         result.transactionHash + " waiting to be mined...");
//                     transactionHash = result.transactionHash;
//
//                 } else {
//                     console.log("Running callbacks for event: " + result.event);
//                     console.log("Contract mined! Address: " + result.address);
//                     console.log(result.address);
//                     contractHash = result.address;
//                     return res.json(contractHash);
//
//                 }
//                 //  }
//                 // } //else
//             } // function
//             // contractCreatedCallback(data, socket, error, result);
//             // return res.json(result.address);
//         );
//
//
// }
//
// // var contractSource = "" +
// //     "contract test {\n" +
// //     "   function multiply(uint a) constant returns(uint d) {\n" +
// //     "       return a * 7;\n" +
// //     "   }\n" +
// //     "}\n";
// // exports.getAllAdressBalance = function(req, res, next) {
// //     var balance = [];
// //     var totalBal = 0;
// //     var count = 0;
// //     for (var acctNum in eth.accounts) {
// //         if (count > 9) {
// //             break;
// //         }
// //         var item = {};
// //         var acct = eth.accounts[acctNum];
// //         var acctBal = web3.fromWei(eth.getBalance(acct), "ether");
// //         totalBal += parseFloat(acctBal);
// //         item["address"] = acct;
// //         item["balance"] = totalBal;
// //         balance.push(item);
// //         count = count + 1;
// //
// //         console.log("  eth.accounts[" + acctNum + "]: \t" + acct + " \tbalance: " + acctBal + " ether");
// //     }
// //     return res.json(balance);
// //
// // }
//
//
// // exports.deploySimpleContract = function(req, res, next) {
// //     var multiplyContract = web3.eth.compile.solidity(contractSource);
// //     web3.eth.defaultAccount = web3.eth.coinbase;
// //     // var addressfrom = eth.Accounts[0];
// //     // var addressto = eth.Accounts[1];
// //     web3.personal.unlockAccount(web3.eth.defaultAccount, 'suraj123', 100000);
// //     // Compile the contract source
// //     // var contractCompiled = web3.eth.compile.solidity(contractSource);
// //     // console.log(contractCompiled) = ;
// //     console.log(multiplyContract.test.info.abiDefinition);
// //     var options = {
// //         from: web3.eth.defaultAccount,
// //         data: multiplyContract.test.code,
// //         gas: 300000
// //     };
// //     console.log(options);
// //     var transactionHash;
// //     var contractHash;
// //     web3.eth.contract(multiplyContract.test.info.abiDefinition).new(options,
// //         function(error, result) {
// //             // console.log("debug1");
// //             console.log("<------------------callback CALLED -------------->");
// //             if (!result.address) {
// //                 console.log("Contract transaction send: TransactionHash: " +
// //                     result.transactionHash + " waiting to be mined...");
// //                 transactionHash = result.transactionHash;
// //
// //             } else {
// //                 console.log("Contract mined! Address: " + result.address);
// //                 console.log(result);
// //                 contractHash = result.address;
// //                 return res.json(contractHash);
// //             }
// //             // contractCreatedCallback(data, socket, error, result);
// //             // return res.json(result.address);
// //         });
// // }
