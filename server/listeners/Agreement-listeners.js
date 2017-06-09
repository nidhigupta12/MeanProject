/**
 * @author hitjoshi@deloitte.com
 *
 */
var express = require('express');
var http = require('http');
var fs = require('fs');
var utils = require('../helpers/utils');
var appRoot = require('app-root-path');
var config = getConf('./property.js').get(process.env.NODE_ENV);
var providerEndpoint = config.providerEndpoint;
var port = 3012;
var Web3 = require('web3');
var web3 = new Web3();
var request = require("request");
var lcContracts = require('../models/lcContractSchema.js');
var user = require('../models/userSchema.js');
var workflowSchema = require('../models/workflowSchema.js');
var Promise = require('bluebird');
var enums = require('../constants/enums.js');



module.exports = (function() {
    'use strict';
    var code = '0x606060405234156200000d57fe5b604051620020d6380380620020d6833981016040528080519060200190919080519060200190919080519060200190919080518201919060200180518201919060200180519060200190919050505b62000066620003ea565b60006000600760006101000a81548160ff021916908360058111156200008857fe5b02179055508460059080519060200190620000a592919062000411565b506000600381905550600060028190555086600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555085600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040604051908101604052808581526020018460001916815250915060036000815480929190600101919050559050816009600083815260200190815260200160002060008201518160000190805190602001906200019992919062000498565b50602082015181600101906000191690559050507f67e0f220dcc5e324fc7b6c7a01ab08b877399d123528584cce9aa8b42abfa57388600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900460ff1660058111156200023157fe5b60058989600354604051808981526020018873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001868152602001806020018060200185600019166000191681526020018481526020018381038352878181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156200034d5780601f1062000321576101008083540402835291602001916200034d565b820191906000526020600020905b8154815290600101906020018083116200032f57829003601f168201915b505083810382528681815181526020019150805190602001908083836000831462000399575b805182526020831115620003995760208201915060208101905060208303925062000373565b505050905090810190601f168015620003c65780820380516001836020036101000a031916815260200191505b509a505050505050505050505060405180910390a15b50505050505050506200055b565b604060405190810160405280620004006200051f565b815260200160006000191681525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200045457805160ff191683800117855562000485565b8280016001018555821562000485579182015b828111156200048457825182559160200191906001019062000467565b5b50905062000494919062000533565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620004db57805160ff19168380011785556200050c565b828001600101855582156200050c579182015b828111156200050b578251825591602001919060010190620004ee565b5b5090506200051b919062000533565b5090565b602060405190810160405280600081525090565b6200055891905b80821115620005545760008160009055506001016200053a565b5090565b90565b611b6b806200056b6000396000f300606060405236156100ce576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632659375c146100d05780632ac445cb146101695780633d15790514610213578063439535191461034757806356833b4d1461036d5780635f3d8f4a1461045157806367e404ce14610477578063689214f6146104c9578063828dddc8146105735780639e1a36fc146105d3578063a5e3b2371461067d578063c19d93fb14610716578063d2261ef61461074a578063f7260d3e146107e3575bfe5b34156100d857fe5b6100e0610835565b604051808060200182810382528381815181526020019150805190602001908083836000831461012f575b80518252602083111561012f5760208201915060208101905060208303925061010b565b505050905090810190601f16801561015b5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561017157fe5b610211600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001909190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506108d3565b005b341561021b57fe5b610345600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919080356000191690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610bbc565b005b341561034f57fe5b610357610f3e565b6040518082815260200191505060405180910390f35b341561037557fe5b61044f600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610f44565b005b341561045957fe5b61046161123b565b6040518082815260200191505060405180910390f35b341561047f57fe5b610487611241565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156104d157fe5b610571600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050611267565b005b341561057b57fe5b6105916004808035906020019091905050611550565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156105db57fe5b61067b600480803590602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050611583565b005b341561068557fe5b61068d61186c565b60405180806020018281038252838181518152602001915080519060200190808383600083146106dc575b8051825260208311156106dc576020820191506020810190506020830392506106b8565b505050905090810190601f1680156107085780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561071e57fe5b61072661190a565b6040518082600581111561073657fe5b60ff16815260200191505060405180910390f35b341561075257fe5b61075a61191d565b60405180806020018281038252838181518152602001915080519060200190808383600083146107a9575b8051825260208311156107a957602082019150602081019050602083039250610785565b505050905090810190601f1680156107d55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156107eb57fe5b6107f36119bb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60068054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108cb5780601f106108a0576101008083540402835291602001916108cb565b820191906000526020600020905b8154815290600101906020018083116108ae57829003601f168201915b505050505081565b60008260058111156108e157fe5b600760006101000a81548160ff021916908360058111156108fe57fe5b021790555084600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555083600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060026000815480929190600101919050559050600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166008600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160049080519060200190610a229291906119e1565b507f076e694307cf5cee20cb42b1dfec535568dc8ec085421d1313faea63f325d59a86600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900460ff166005811115610aa657fe5b6004604051808681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818154600181600116156101000203166002900481526020019150805460018160011615610100020316600290048015610ba15780601f10610b7657610100808354040283529160200191610ba1565b820191906000526020600020905b815481529060010190602001808311610b8457829003601f168201915b5050965050505050505060405180910390a15b505050505050565b610bc4611a61565b60006003600760006101000a81548160ff02191690836005811115610be557fe5b021790555087600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555086600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508560049080519060200190610c829291906119e1565b508260069080519060200190610c999291906119e1565b50604060405190810160405280868152602001856000191681525091506003600081548092919060010191905055905081600960008381526020019081526020016000206000820151816000019080519060200190610cf9929190611a86565b50602082015181600101906000191690559050507f6b9271d8af6cb9028345fc0bce4b66260f34764096ffdba260f9272ace56e05a89600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900460ff166005811115610d9057fe5b60048a8a600354604051808981526020018873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200186815260200180602001806020018560001916600019168152602001848152602001838103835287818154600181600116156101000203166002900481526020019150805460018160011615610100020316600290048015610ea85780601f10610e7d57610100808354040283529160200191610ea8565b820191906000526020600020905b815481529060010190602001808311610e8b57829003601f168201915b5050838103825286818151815260200191508051906020019080838360008314610ef1575b805182526020831115610ef157602082019150602081019050602083039250610ecd565b505050905090810190601f168015610f1d5780820380516001836020036101000a031916815260200191505b509a505050505050505050505060405180910390a15b505050505050505050565b60035481565b6001600760006101000a81548160ff02191690836005811115610f6357fe5b021790555083600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060059080519060200190610fbf9291906119e1565b5082600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600490805190602001906110179291906119e1565b507ffaa5322bd0fc7f9b0e9999820daa7f114b15b6f3a0abe99096096c87f3f8b44a85600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900460ff16600581111561109b57fe5b60046005604051808781526020018673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001848152602001806020018060200183810383528581815460018160011615610100020316600290048152602001915080546001816001161561010002031660029004801561119c5780601f106111715761010080835404028352916020019161119c565b820191906000526020600020905b81548152906001019060200180831161117f57829003601f168201915b505083810382528481815460018160011615610100020316600290048152602001915080546001816001161561010002031660029004801561121f5780601f106111f45761010080835404028352916020019161121f565b820191906000526020600020905b81548152906001019060200180831161120257829003601f168201915b50509850505050505050505060405180910390a15b5050505050565b60025481565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082600581111561127557fe5b600760006101000a81548160ff0219169083600581111561129257fe5b021790555084600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555083600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060026000815480929190600101919050559050600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166008600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600490805190602001906113b69291906119e1565b507f83383b2dba8170fa3b3247991d73faa52c9793f7b6d4688e4e8a384b6be3637e86600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900460ff16600581111561143a57fe5b6004604051808681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001806020018281038252838181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156115355780601f1061150a57610100808354040283529160200191611535565b820191906000526020600020905b81548152906001019060200180831161151857829003601f168201915b5050965050505050505060405180910390a15b505050505050565b60086020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082600581111561159157fe5b600760006101000a81548160ff021916908360058111156115ae57fe5b021790555084600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555083600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060026000815480929190600101919050559050600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166008600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600490805190602001906116d29291906119e1565b507ffe131d6f99444beced79e4faceb3ac9a51abaa3c31f6427206395ed05660d70b86600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900460ff16600581111561175657fe5b6004604051808681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001806020018281038252838181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156118515780601f1061182657610100808354040283529160200191611851565b820191906000526020600020905b81548152906001019060200180831161183457829003601f168201915b5050965050505050505060405180910390a15b505050505050565b60048054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156119025780601f106118d757610100808354040283529160200191611902565b820191906000526020600020905b8154815290600101906020018083116118e557829003601f168201915b505050505081565b600760009054906101000a900460ff1681565b60058054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156119b35780601f10611988576101008083540402835291602001916119b3565b820191906000526020600020905b81548152906001019060200180831161199657829003601f168201915b505050505081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10611a2257805160ff1916838001178555611a50565b82800160010185558215611a50579182015b82811115611a4f578251825591602001919060010190611a34565b5b509050611a5d9190611b06565b5090565b604060405190810160405280611a75611b2b565b815260200160006000191681525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10611ac757805160ff1916838001178555611af5565b82800160010185558215611af5579182015b82811115611af4578251825591602001919060010190611ad9565b5b509050611b029190611b06565b5090565b611b2891905b80821115611b24576000816000905550600101611b0c565b5090565b90565b6020604051908101604052806000815250905600a165627a7a723058202bc9f410f43899a043e5922db89a9473f829e13318214ee239573d3adc7ba5730029';
    var ABI = [{"constant":true,"inputs":[],"name":"invoiceNumberInContract","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"timestamp","type":"uint256"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"new_state","type":"uint256"},{"name":"lcNumber","type":"string"}],"name":"acceptLodgementByIsuBank","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"timestamp","type":"uint256"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"lcNumber","type":"string"},{"name":"name","type":"string"},{"name":"hash","type":"bytes32"},{"name":"invoiceNumber","type":"string"}],"name":"createLodgement","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"fileCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"timestamp","type":"uint256"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"lcNumber","type":"string"},{"name":"poNumber","type":"string"}],"name":"issuingBankToIssueLc","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"signedCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"sender","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"timestamp","type":"uint256"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"new_state","type":"uint256"},{"name":"lcNumber","type":"string"}],"name":"acceptLodgementByPresBank","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"signedList","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"timestamp","type":"uint256"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"new_state","type":"uint256"},{"name":"lcNumber","type":"string"}],"name":"acceptLCByAdvBank","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"lcNumberinContract","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"state","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"poNumberinContract","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"receiver","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"timestamp","type":"uint256"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"poNumber","type":"string"},{"name":"name","type":"string"},{"name":"hash","type":"bytes32"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"state","type":"uint256"},{"indexed":false,"name":"poNumberinContract","type":"string"},{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"hash","type":"bytes32"},{"indexed":false,"name":"fileCount","type":"uint256"}],"name":"onContractCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"state","type":"uint256"},{"indexed":false,"name":"lcNumberinContract","type":"string"},{"indexed":false,"name":"poNumberinContract","type":"string"}],"name":"onIssueLc","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"state","type":"uint256"},{"indexed":false,"name":"lcNumberinContract","type":"string"}],"name":"onAccept","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"state","type":"uint256"},{"indexed":false,"name":"lcNumberinContract","type":"string"},{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"hash","type":"bytes32"},{"indexed":false,"name":"fileCount","type":"uint256"}],"name":"oncreateLodgement","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"state","type":"uint256"},{"indexed":false,"name":"lcNumberinContract","type":"string"}],"name":"onAcceptLodgementPres","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"state","type":"uint256"},{"indexed":false,"name":"lcNumberinContract","type":"string"}],"name":"onAcceptLodgementIsu","type":"event"}];
    web3.setProvider(new web3.providers.HttpProvider(providerEndpoint));

    //var agreementSol = utils.getFileStrNoWhitespace("./server/contracts/Agreement.sol");
    //Compile file in solidity
    //var contractCompiled = web3.eth.compile.solidity(agreementSol);

    //console.log(contractCompiled.Agreement.info.abiDefinition);

    // create a router
    var app = express.Router();
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    };

    app.use(allowCrossDomain);

    var ioserver = http.createServer(app);
    var io = require('socket.io').listen(ioserver);

    var oncreateLodgement = function(data, socket, error, contract) {

        console.log(contract);
        if (error) {
            console.log('Error ocurred while Contract deployment ');
            console.error(error);
        } else {
            if (!error && contract.address) {
                contract.oncreateLodgement(function(err, event) {
                    if (err) {
                        console.log('Inside error');
                        console.error(err);
                    } else {
                        lcContracts.findById(data.primaryKey).then(function(result) {
                            // Adding workflow
                            var workflows = new workflowSchema();
                            workflows.stage = enums.POST_MINING_ENUM.BENEFICIARY;
                            workflows.transactionHash = event.transactionHash;
                            result.workflows.push(workflows);
                            //end
                            result.save().then(function() {
                                console.log('oncreateLodgement saved on callback----');
                            }, function(error) {
                                console.log('oncreateLodgement failed on call back save');
                                console.log(error);
                            });

                        }, function(error) {
                            console.log('oncreateLodgement Failed');
                        }).catch(function(error) {
                            console.log('oncreateLodgement failed catch block');
                            console.log(error);
                        });
                    }
                });
            }
        }

    };

    var onAcceptLC = function(data, socket, error, contract) {
        if (error) {
            console.log('Error ocurred while Contract deployment ');
            console.error(error);
        } else {
            if (!error && contract.address) {
                contract.onAccept({
                    'state': data.state,
                    'sender': data.from,
                    'receiver': data.to
                }, function(err, event) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("EEEEVVVVVVVVVEEEEEENNNNNNNTTTTTTT");
                        console.log(event);
                        lcContracts.findById(data.primaryKey).then(function(result) {
                            // Adding workflow
                            var workflows = new workflowSchema();
                            console.log("inside agreement=======" + data.state);
                            // if (data.state == enums.CONTRACT_STATE.ADVISING_BANK_LODGEMENT) {
                            //     workflows.stage = enums.POST_MINING_ENUM.ADVISING_BANK_LODGEMENT;
                            //
                            // } else if (data.state == enums.CONTRACT_STATE.ISSUING_BANK_LODGEMENT) {
                            //     workflows.stage = enums.POST_MINING_ENUM.ISSUING_BANK_LODGEMENT;
                            //
                            // } else if (data.state == enums.CONTRACT_STATE.ADVISING_BANK) {
                            workflows.stage = enums.POST_MINING_ENUM.ADVISING_BANK;
                            // }

                            workflows.transactionHash = event.transactionHash;
                            result.workflows.push(workflows);
                            //end
                            result.save().then(function() {
                                console.log('Accept lc saved on callback----');
                            }, function(error) {
                                console.log('Accept Lc failed on call back save');
                                console.log(error);
                            });

                        }, function(error) {
                            console.log('On Accept Failed');
                        }).catch(function(error) {
                            console.log('On Accept failed catch block');
                            console.log(error);
                        });
                    };
                });
            }

        }
    };

    var onAcceptLodgementByPres = function(data, socket, error, contract) {
        if (error) {
            console.log('Error ocurred while Contract deployment ');
            console.error(error);
        } else {
            if (!error && contract.address) {
                contract.onAcceptLodgementPres({
                    'state': data.state,
                    'sender': data.from,
                    'receiver': data.to
                }, function(err, event) {
                    if (err) {
                        console.error(err);
                    } else {
                        lcContracts.findById(data.primaryKey).then(function(result) {
                            // Adding workflow
                            var workflows = new workflowSchema();

                            // if (data.state == enums.CONTRACT_STATE.ADVISING_BANK_LODGEMENT) {
                            workflows.stage = enums.POST_MINING_ENUM.ADVISING_BANK_LODGEMENT;

                            workflows.transactionHash = event.transactionHash;
                            result.workflows.push(workflows);
                            //end
                            result.save().then(function() {
                                console.log('Accept lc saved on callback----');
                            }, function(error) {
                                console.log('Accept Lc failed on call back save');
                                console.log(error);
                            });

                        }, function(error) {
                            console.log('On Accept Failed');
                        }).catch(function(error) {
                            console.log('On Accept failed catch block');
                            console.log(error);
                        });
                    };
                });
            }

        }
    };


    var onAcceptLodgementByIsu = function(data, socket, error, contract) {
        if (error) {
            console.log('Error ocurred while Contract deployment ');
            console.error(error);
        } else {
            if (!error && contract.address) {
                contract.onAcceptLodgementIsu({
                    'state': data.state,
                    'sender': data.from,
                    'receiver': data.to
                }, function(err, event) {
                    if (err) {
                        console.error(err);
                    } else {
                        lcContracts.findById(data.primaryKey).then(function(result) {
                            // Adding workflow
                            var workflows = new workflowSchema();
                            workflows.stage = enums.POST_MINING_ENUM.ISSUING_BANK_LODGEMENT;

                            workflows.transactionHash = event.transactionHash;
                            result.workflows.push(workflows);
                            //end
                            result.save().then(function() {
                                console.log('Accept lc saved on callback----');
                            }, function(error) {
                                console.log('Accept Lc failed on call back save');
                                console.log(error);
                            });

                        }, function(error) {
                            console.log('On Accept Failed');
                        }).catch(function(error) {
                            console.log('On Accept failed catch block');
                            console.log(error);
                        });
                    };
                });
            }

        }
    };


    var onIssueLc = function(data, socket, error, contract) {
        if (error) {
            console.log('Error ocurred while Contract deployment ');
            console.error(error);
        } else {
            if (!error && contract.address) {
                contract.onIssueLc({
                        'poNumber': data.poNumber,
                        'lcNumber': data.lcNumber
                    },
                    function(err, event) {
                        if (err) {
                            console.error(err);
                        } else {
                            var bcAddress = contract.address;
                            lcContracts.findById(data.primaryKey).then(function(result) {
                                // Adding workflow
                                var workflows = new workflowSchema();
                                workflows.stage = enums.POST_MINING_ENUM.ISSUING_BANK;
                                workflows.transactionHash = event.transactionHash;
                                result.workflows.push(workflows);
                                result.save().then(function() {
                                    console.log('Saving Workflow POST ETHEREUM CODE Issuing Bank');
                                });

                            }, function(error) {
                                console.log('On Issue Failed');
                            }).catch(function(error) {
                                console.log('On Issue failed catch block');
                                console.log(error);
                            });
                        }
                    });
            }
        }
    }

    // var onContractCreated = function(data, socket, contract, event) {
    //     var bcAddress = contract.address;
    //     lcContracts.findById(data.primaryKey).then(function(result) {
    //         var workflows = new workflowSchema();
    //         workflows.stage = enums.POST_MINING_ENUM.INITIATOR;
    //         workflows.transactionHash = event.transactionHash;
    //         result.workflows.push(workflows);
    //         result.bcContractAddress = bcAddress;
    //         result.save().then(function() {
    //             console.log('7. THIS CONTRACT IS NOW PROCESSED FOR INITIATOR');
    //             socket.emit('contractCreationComplete', {
    //                 "address": bcAddress,
    //                 "message": 'Contract Submitted',
    //                 "data": data
    //             });
    //         });
    //
    //     }, function(error) {
    //         console.log('Save Failed');
    //     }).catch(function(error) {
    //         console.log('Saving mined contract address failed');
    //         console.log(error);
    //     });
    //
    // };


    // var callbacks = {
    //     'onContractCreated': [onContractCreated],
    //     'onIssueLc': [onIssueLc],
    //     'onAccept': [onAcceptLC],
    //     'oncreateLodgement': [oncreateLodgement]
    // };


  //       var contractCreatedCallback = function(data, socket, contract) {
	// console.log('explicitly calling Contract creation callback------------------------------------');
  //       if (contract.address) {
  //               contract.onContractCreated({
  //                       'poNumber': data.poNumber
  //                     },function(err, event) {
	// 					if (err) {
	// 						console.log(error);
	// 					} else {
  //                       var bcAddress = contract.address;
	// 					console.log("Address ------------------------------>  "+ bcAddress);
  //
  //                       lcContracts.findById(data.primaryKey).then(function(result) {
  //                           var workflows = new workflowSchema();
  //                           workflows.stage = enums.POST_MINING_ENUM.INITIATOR;
  //                           workflows.transactionHash = event.transactionHash;
  //                           result.workflows.push(workflows);
  //                           result.bcContractAddress = bcAddress;
  //                           result.save().then(function() {
  //                               console.log('7. THIS CONTRACT IS NOW PROCESSED FOR INITIATOR');
  //                               socket.emit('contractCreationComplete', {
  //                                   "address": bcAddress,
  //                                   "message": 'Contract Submitted',
  //                                   "data": data
  //                               });
  //                           });
  //
  //                       }, function(error) {
  //                           console.log('Save Failed');
  //                       }).catch(function(error) {
  //                           console.log('Saving mined contract address failed');
  //                           console.log(error);
  //                       });
  //                   }
  //               });
  //
  //             }
  //



var contractCreatedCallback = function(data, socket, error, contract) {
	console.log('manually calling the callback ---->');
	var x = false;	
    if (error) {
        console.log('Error ocurred while Contract deployment ');
        console.log(error);
    } else {
        console.log('Inside else ....>');
        if (!error && contract.address) {
      contract.onContractCreated({
                  'poNumber': data.poNumber
              }, function(error, event) {
				console.log("logging inside callback for onContractCreated");
				if (error) {
                    console.log(error);
                } else {
                  console.log('Inside actual Callbakc else ---');
                  var bcAddress = contract.address;
		  if(!x){
			x= true;
			lcContracts.findById(data.primaryKey).then(function(result) {

                        var workflows = new workflowSchema();

                        workflows.stage = enums.POST_MINING_ENUM.INITIATOR;

                        workflows.transactionHash = event.transactionHash;

                        result.workflows.push(workflows);

                        result.bcContractAddress = bcAddress;

                        result.save().then(function() {

                            console.log('7. THIS CONTRACT IS NOW PROCESSED FOR INITIATOR');

                            socket.emit('contractCreationComplete', {

                                "address": bcAddress,

                                "message": 'Contract Submitted',

                                "data": data

                            });

                        });

                    }, function(error) {

                        console.log('Save Failed');

                    }).catch(function(error) {

                        console.log('Saving mined contract address failed');

                        console.log(error);

                    });
					}
                }
            });
        }
    }
};

    io.sockets.on('connection', function(socket) {

        // socket.on('createAgreement', function(data) {
        //     var fromObjectId = data.buyerId;
        //     var toObjectId = data.issuingBankId;
        //
        //
        //     Promise.all([user.findById(fromObjectId),
        //             user.findById(toObjectId)
        //         ])
        //         .then(function(result) {
        //
        //             var bcData = {
        //                 from: result[0].blockchainAddress,
        //                 to: result[1].blockchainAddress,
        //                 poNumber: data.poNumber,
        //                 name: data.initiaterFileName,
        //                 hash: utils.hex2ipfshash(data.initiatorIpfcDocHash),
        //                 primaryKey: data._id,
        //                 blockchainPwd: result[0].blockchainAcPwd
        //             };
        //             return Promise.resolve(bcData);
        //
        //         }, function(error) {
        //             console.log(error);
        //         }).then(function(data) {
        //             // console.log('2. Create agreement Called');
        //             console.log(data);
        //             // web3.eth.defaultAccount = web3.eth.coinbase;
        //             // web3.personal.unlockAccount(web3.eth.defaultAccount,
        //             //     config.coinbasePwd, 100000);
        //             web3.personal.unlockAccount(data.from,
        //                 data.blockchainPwd, null);
        //
        //             var options = {
        //                 from: data.from,
        //                 data: code,
        //                 gas: 4712000
        //             };
        //             return new Promise(function(resolve, reject) {
        //             web3.eth.contract(ABI)
        //                 .new(Date.now(), data.from, data.to, data.poNumber, data.name,
        //                     data.hash, options,
        //                     function(error, result) {
        //                         if (error) {
        //                             console.log('Failed ----------------------->');
        //                             console.log(error);
        //                           return  reject(error);
        //                         } else if (!result.address) {
        //                             console.log("Transaction send: TransactionHash: " +
        //                                 result.transactionHash + " waiting to be mined...");
        //                             // console.log('3 Transaction Hash generated');
        //                             var transactionHash =
        //                                 result.transactionHash;
        //                         } else {
        //                             console.log('3 Mined address  generated');
        //                             console.log(result.address);
        //                             var contractHash = result.address;
        //                             return resolve(result);
        //                             // contractCreatedCallback(data, socket, error, result);
        //                         }
        //                         // console.log('4. Calling Callback Registrar---');
        //
        //                     });
        //                   }).then(function(result){
        //                     console.log('Propert Result ----->')
        //                     contractCreatedCallback(data,socket,result);
        //                   }, function(error){
        //                     console.log('Error thrown');
        //                     console.log(error);
        //                    // contractCreatedCallback(data,socket,error,result);
        //                   })
        //
        //         })
        //
        //
        // });

        socket.on('createAgreement', function(data) {
                    var fromObjectId = data.buyerId;
                    var toObjectId = data.issuingBankId;


                    Promise.all([user.findById(fromObjectId),
                            user.findById(toObjectId)
                        ])
                        .then(function(result) {

                            var bcData = {
                                from: result[0].blockchainAddress,
                                to: result[1].blockchainAddress,
                                poNumber: data.poNumber,
                                name: data.initiaterFileName,
                                hash: utils.hex2ipfshash(data.initiatorIpfcDocHash),
                                primaryKey: data._id,
                                blockchainPwd: result[0].blockchainAcPwd
                            };
                            return Promise.resolve(bcData);

                        }, function(error) {
                            console.log(error);
                        }).then(function(data) {
                            // console.log('2. Create agreement Called');
                            console.log(data);
                            // web3.eth.defaultAccount = web3.eth.coinbase;
                            // web3.personal.unlockAccount(web3.eth.defaultAccount,
                            //     config.coinbasePwd, 100000);
                            web3.personal.unlockAccount(data.from,
                                data.blockchainPwd, null);

                            var options = {
                                from: data.from,
                                data: code,
                                gas: 4712000
                            };

                            web3.eth.contract(ABI)
                                .new(Date.now(), data.from, data.to, data.poNumber, data.name,
                                    data.hash, options,
                                    function(error, result) {
                                        if (error) {
                                            console.log('Failed ----------------------->');
                                            console.log(error);
                                        } else if (!result.address) {
                                            console.log("Transaction send: TransactionHash: " +
                                                result.transactionHash + " waiting to be mined...");
                                            // console.log('3 Transaction Hash generated');
                                            var transactionHash =
                                                result.transactionHash;
                                        } else {
                                            console.log('3 Mined address  generated');
                                            console.log(result.address);
                                            var contractHash = result.address;
                                            contractCreatedCallback(data, socket, error, result);
                                        }
                                        // console.log('4. Calling Callback Registrar---');

                                    });
                        })


                });


        // function issuingBankToIssueLc(uint timestamp, address from, address to,string lcNumber,string poNumber)

        socket.on('doIssueLc', function(data) {
            var fromObjectId = data.issuingBankId;
            var toObjectId = data.advisingBankId;

            Promise.all([user.findById(fromObjectId),
                    user.findById(toObjectId)
                ])
                .then(function(result) {
                    console.log('1st user');
                    console.log(result[0]);
                    console.log('2nd user');
                    console.log(result[1]);
                    var bcData = {
                        from: result[0].blockchainAddress,
                        to: result[1].blockchainAddress,
                        poNumber: data.poNumber,
                        lcNumber: data.lcNumber,
                        primaryKey: data._id,
                        address: data.bcContractAddress,
                        blockchainPwd: result[0].blockchainAcPwd
                    };
                    return Promise.resolve(bcData);

                }, function(error) {
                    console.log(error);
                }).then(function(data) {
                    // web3.eth.defaultAccount = web3.eth.coinbase;
                    web3.personal.unlockAccount(data.from,
                        data.blockchainPwd, null);

                    var options = {
                        from: data.from,
                        to: data.to,
                        data: code,
                        gas: 1712000
                    };
                    console.log("Address in issue");
                    console.log(data.address);
                    var contract =
                        web3.eth.contract(ABI)
                        .at(data.address);

                    contract.issuingBankToIssueLc.sendTransaction(Date.now(), data.from,
                        data.to, data.lcNumber, data.poNumber, options,
                        function(error, result) {
                            if (error) {
                                console.log('Error Issuing LC By Bank---------');
                                console.log(error);
                            } else {
                                console.log("Address of Transaction--- ");
                                console.log(result);
                            }
                            // call the callback
                            onIssueLc(data, socket, error, contract);
                        });

                });



        });

        socket.on('doLodgement', function(data) {
            console.log("socket listenting on doLodgement--->");
            var fromObjectId = data.sellerId;
            var toObjectId = data.advisingBankId;

            Promise.all([user.findById(fromObjectId),
                    user.findById(toObjectId)
                ])
                .then(function(result) {
                    var bcData = {
                        from: result[0].blockchainAddress,
                        to: result[1].blockchainAddress,
                        lcNumber: data.lcNumber,
                        // first doc in lodgementDocuments is invoiceFile
                        name: data.lodgementDocuments[0].fileName,
                        hash: utils.ipfs2hex(data.lodgementDocuments[0].ipfsDocHash),
                        invoiceNumber: data.billNumber,
                        primaryKey: data._id,
                        address: data.bcContractAddress,
                        blockchainPwd: result[0].blockchainAcPwd
                    };
                    return Promise.resolve(bcData);

                }, function(error) {
                    console.log(error);
                }).then(function(data) {
                    var contract_address = data.address;
                    // web3.eth.defaultAccount = web3.eth.coinbase;
                    // Remove pwd from code
                    web3.personal.unlockAccount(data.from,
                        data.blockchainPwd, null);
                    var options = {
                        from: data.from,
                        to: data.to,
                        data: code,
                        gas: 1712000
                    };

                    var contract =
                        web3.eth.contract(ABI)
                        .at(data.address);
                    // function createLodgement(uint timestamp, address from, address to,
                    // string lcNumber, string name, bytes32 hash,string invoiceNumber)
                    contract.createLodgement.sendTransaction(Date.now(), data.from,
                        data.to, data.lcNumber, data.name, data.hash,
                        data.invoiceNumber, options,
                        function(error, result) {
                            if (error) {
                                console.log('Error Creating Lodgement By Bank---------');
                            } else {
                                console.log("Transaction mined! Address: ");
                                console.log(result);
                            }
                            // Adding function Callback
                            oncreateLodgement(data, socket, error, contract);
                        });
                });
        });

        // function accept(uint timestamp, address from, address to, uint new_state,string lcNumber)
        socket.on('doAccept', function(data) {

            var fromObjectId = data.fromObjectId;
            var toObjectId = data.toObjectId;
            Promise.all([user.findById(fromObjectId),
                user.findById(toObjectId)
            ]).then(function(result) {
                var bcData = {
                    from: result[0].blockchainAddress,
                    to: result[1].blockchainAddress,
                    state: data.state,
                    lcNumber: data.lcNumber,
                    primaryKey: data.primaryKey,
                    address: data.address,
                    blockchainPwd: result[0].blockchainAcPwd
                };
                return Promise.resolve(bcData);

            }, function(error) {
                console.log(error);
            }).then(function(data) {

                // web3.eth.defaultAccount = web3.eth.coinbase;
                web3.personal.unlockAccount(data.from,
                    data.blockchainPwd, null);
                var options = {
                    from: data.from,
                    to: data.to,
                    data: code,
                    gas: 1712000
                };

                var contract =
                    web3.eth.contract(ABI)
                    .at(data.address);

                contract.acceptLCByAdvBank.sendTransaction(Date.now(), data.from,
                    data.to, data.state, data.lcNumber, options,
                    function(error, result) {
                        if (error) {
                            console.log('Acceptance Failed ---------');
                            console.log(error);
                        } else {
                            console.log(" 100. Transaction mined! Address: ");
                            console.log(result);
                        }
                        //Call the individual callback
                        onAcceptLC(data, socket, error, contract);
                    });
            });

        });


        socket.on('doAcceptLodgementPres', function(data) {

            var fromObjectId = data.fromObjectId;
            var toObjectId = data.toObjectId;
            Promise.all([user.findById(fromObjectId),
                user.findById(toObjectId)
            ]).then(function(result) {
                var bcData = {
                    from: result[0].blockchainAddress,
                    to: result[1].blockchainAddress,
                    state: data.state,
                    lcNumber: data.lcNumber,
                    primaryKey: data.primaryKey,
                    address: data.address,
                    blockchainPwd: result[0].blockchainAcPwd
                };
                return Promise.resolve(bcData);

            }, function(error) {
                console.log(error);
            }).then(function(data) {
                console.log('Data Motherfuc------------>ker Pres');
                console.log(data);
                // web3.eth.defaultAccount = web3.eth.coinbase;
                web3.personal.unlockAccount(data.from,
                    data.blockchainPwd, null);
                var options = {
                    from: data.from,
                    to: data.to,
                    data: code,
                    gas: 1712000
                };

                var contract =
                    web3.eth.contract(ABI)
                    .at(data.address);


                contract.acceptLodgementByPresBank.sendTransaction(Date.now(), data.from,
                    data.to, data.state, data.lcNumber, options,
                    function(error, result) {
                        if (error) {
                            console.log('Acceptance Failed ---------');
                            console.log(error);
                        } else {
                            console.log(" 100. Transaction mined! Address: ");
                            console.log(result);
                        }
                        //Call the individual callback
                        onAcceptLodgementByPres(data, socket, error, contract);
                    });
            });

        });

        socket.on('doAcceptLodgementIsu', function(data) {

            var fromObjectId = data.fromObjectId;
            var toObjectId = data.toObjectId;

            Promise.all([user.findById(fromObjectId),
                user.findById(toObjectId)
            ]).then(function(result) {
                var bcData = {
                    from: result[0].blockchainAddress,
                    to: result[1].blockchainAddress,
                    state: data.state,
                    lcNumber: data.lcNumber,
                    primaryKey: data.primaryKey,
                    address: data.address,
                    blockchainPwd: result[0].blockchainAcPwd
                };
                return Promise.resolve(bcData);

            }, function(error) {
                console.log(error);
            }).then(function(data) {
                 console.log(data);
                // web3.eth.defaultAccount = web3.eth.coinbase;
                web3.personal.unlockAccount(data.from,
                    data.blockchainPwd, null);
                var options = {
                    from: data.from,
                    to: data.to,
                    data: code,
                    gas: 1712000
                };

                var contract =
                    web3.eth.contract(ABI)
                    .at(data.address);


                contract.acceptLodgementByIsuBank.sendTransaction(Date.now(), data.from,
                    data.to, data.state, data.lcNumber, options,
                    function(error, result) {
                        if (error) {
                            console.log('Acceptance Failed ---------');
                            console.log(error);
                        } else {
                            console.log(" 100. Transaction mined! Address: ");
                            console.log(result);
                        }
                        //Call the individual callback
                        onAcceptLodgementByIsu(data, socket, error, contract);
                    });
            });

        });

        socket.on('transferFunds', function(data) {
            var receiver = data.userBCAddress;
            console.log('Inside Transafer funds');
            console.log(receiver);

            web3.personal.unlockAccount(config.coinbaseUser,
                config.coinbasePwd, null, function(error, result){
                  if(error){
                    console.log(error);
                  }
                  else{
                    console.log('Unlock result');
                    console.log(result);
                  }
                });
            // var options = {
            //     from: web3.eth.defaultAccount,
            //     to:receiver,
            //     value:web3.toWei(0.05, "ether")
            // };
            // transfer 1000 ether
            web3.eth.sendTransaction({
                from: config.coinbaseUser,
                to: receiver,
                value: web3.toWei(10000, "ether")
            }, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Result of Money Transfer');
                    console.log(result);
                }
            });
        });




    });
    ioserver.listen(port);

})();
