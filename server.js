////////////////////
// TOP CONTROLLER // // THE CODE HAS TO BE MINIFIED BEFORE DEPLOYING THE SOLUTION
////////////////////

/*
	Set the environment of work -> to be changed when definitively published
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
	Calling necessary modules
 */
var
	fs = require('fs'),
	// https = require('https'),
	http = require('http'),
	config = require('./config/config'),
	mongoose = require('./config/mongoose'),
	express = require('./config/express');


var db = mongoose(),
	app = express();


/*
	Launching the server on the port defined in the environment configs
 */
var server = require('http').createServer(app); 
var io = require('./io')(server);

server.listen(config.port, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.port);
});

/*
	exports app so that it's accessible in the whole application
 */

module.exports = app;