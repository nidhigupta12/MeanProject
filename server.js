/**
 *@author hitjoshi@deloitte.com
 * Node Js initial file with app server
 */

var express = require('express');
var mongoose = require('mongoose');
// Property file not checked in src control
var config = require('./property.js').get(process.env.NODE_ENV);
// App runs on 3000 by default
var port = config.port;
// Config
global.getConf = require('app-root-path').require;
// Logger
var logger = require('morgan');
// pulls information from HTML POST
var bodyParser = require('body-parser');
var path = require('path');
var User = require('./server/models/userSchema.js');
// var conference = require('./server/listeners/Conference-listeners.js');
var agreement = require('./server/listeners/Agreement-listeners.js');
var usersEthereum = require('./server/config/usersEthereum');
// for cron job
var schedule = require('node-schedule');


// Centralized  Server Router File ============================================
var routes = require('./server/router/index');
var http = require('http');
var passport = require('passport');

require('./server/auth/local/passport').setup(User, config);


// configuration ===============================================================

mongoose.connect(config.mongoUri);

mongoose.connection.on('connected', function() {
    console.log('Mongo Db Connection Successful ');
});

mongoose.connection.on('error', function(err) {
    console.error(`MongoDB connection error: ${err}`);
    // process.exit(-1);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose connection disconnected through app termination');
        process.exit(0);
    });
});


// Populate databases with sample data
// In case we pre populate data instead of Creating Users on the fly

if (config.seedDB) {
    require('./server/config/seed');
}

// Creating Express App
var app = express();
app.use('/static', express.static(path.join(__dirname, 'public')));
// Adding Router Middlewares

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

app.use(passport.initialize());
// Make Routes Availaible to App
app.use(routes);

// Creating an HTTP Server
var server = http.createServer(app);
server.listen(port);
console.log("App listening on port " + port);

// what is ejs, why have we required it
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// specifying client folder - Angular code goes here
app.set('views', path.join(__dirname, 'client'));
app.use(express.static(path.join(__dirname, 'client')));

// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(3000, function() {
  //server ready to accept connections
  console.log("-------Express Server has started!-------");
  // var j = schedule.scheduleJob('48 * * * *', function(){
  // runs everday at 4:55 in evening
  var j = schedule.scheduleJob('0 55 16 * * *', function(){
    console.log('The answer to life, the universe, and everything!');
    usersEthereum.updateBalance();
  });
});

exports = module.exports = app;
