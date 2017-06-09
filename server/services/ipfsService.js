/**
 *@Author hitjoshi@deloitte.com
 *@Date Dec 10, 2016
 */
// request-promise-  http request library with promise support
var rp = require('request-promise');
var config = getConf('./property.js').get(process.env.NODE_ENV);
var ipfsAPI = require('ipfs-api');
var fs = require('fs');
var ipfs = ipfsAPI(config.ipfsIp, config.ipfsPort, {
    protocol: 'http'
});

//Upload  a file
exports.uploadFile = function(req, res) {

    var files = req.files.files;
    var ipfsFiles = [];
    for (var i = 0; i < files.length; i++) {

        ipfs.util.addFromFs(files[i].path, function(err, response) {

            if (err) {
                console.log('addition to ipfs failed');
                var message = {
                    "status": "IPFS add failed"
                };
                return res.status(500).json(message);

            } else {
                console.log(response);
                //store in the Mongo
                return res.status(200).json(response);
            }

        });

    }


}


exports.view = function(req, res, next) {
    var ipfsHash = req.params.hash;
    console.log(ipfsHash);

    var options = {
        uri: '__http://ipfs.io/api/v0/cat', // base uri
        qs: {
            arg: ipfsHash // -> uri + '?access_token=xxxxx%20xxxxx'// query params
        },
        // headers: {     // headers
        //     'User-Agent': 'Request-Promise'
        // },
        json: true // Automatically parses the JSON string in the response
    };

    rp(options)
        .then(function(response) {
            console.log(response);
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(response, 'binary');
            // send it back to Client, may be base 64 encoded
        })
        .catch(function(err) {
            // API call failed...
            console.log('API failed');
        });
}
