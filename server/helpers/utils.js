/**
 * Created by shadw on 2016-07-05.
 */
var fs = require('fs');
var bs58 = require('bs58');

// utils.js
var Utils = function() {};

Utils.prototype.getFileStrNoWhitespace = function(pathToFile) {
    return fs.readFileSync(pathToFile, "utf8").replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '').replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/g, ' ');
};

Utils.prototype.hex2ipfshash = function(hash) {
    return bs58.encode(new Buffer("1220" + hash.slice(2), 'hex'))
}

Utils.prototype.ipfs2hex = function(ipfshash) {
    return "0x" + new Buffer(bs58.decode(ipfshash).slice(2)).toString('hex');
}

Utils.prototype.randomString = function(len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = new Utils();
