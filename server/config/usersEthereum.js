var express = require('express');
var mongoose = require('mongoose');
var config = require('../../property.js').get(process.env.NODE_ENV);
// App runs on 3000 by default
var port = config.port;
var User = require('../../server/models/userSchema.js');
// web3 api
var Web3 = require('web3');
var web3 = new Web3();
var providerEndpoint = config.providerEndpoint;
web3.setProvider(new web3.providers.HttpProvider(providerEndpoint));
var socket = require('socket.io-client')('http://127.0.0.1:3012');

module.exports.updateBalance = function(req, res){
  console.log("----Update Balance Function called!!----");
  User.find({}, 'blockchainAcPwd blockchainAddress _id')
      .then( User =>{
        for( var i=0; i<User.length; ++i){
          var blockchainAddress = User[i].blockchainAddress;
          console.log("blockchainAddress is : ");
          console.log(blockchainAddress);
          // balance return a big Number instance
          var currentBalance = web3.eth.getBalance( blockchainAddress );
          var etherBalance = web3.fromWei(currentBalance , "ether").toString();
          console.log("ether balance is : ");
          console.log(etherBalance);
          console.log("-------------------------------------------");
          var minBalance = 4000;
          if( etherBalance < minBalance ){
            // send some funds to this address
            console.log("-------transferring ether for => " + blockchainAddress);
            var data = {
                userBCAddress: blockchainAddress,
            };
            socket.emit('transferFunds', data);
          }
        }
      })
      .catch(err => next(err));
}
