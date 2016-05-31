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

// console coloration module

var colors = require('colors');
colors.setTheme({
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

var fs = require('fs'),
	// https = require('https'),
	http = require('http'),
	config = require('./config/config'),
	mongoose = require('./config/mongoose'),
	express = require('./config/express');


var db = mongoose(),
	app = express();
var backup = require('mongodb-backup');

// Backup the mongoDB database
backup({
  uri: 'mongodb://localhost/PPE2015', // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
  root: './backup', // write files into this dir
  callback:[confirmBackup()]
});
function confirmBackup () {
	console.log("backup succesfull");
}
/*
	Launching the server on the port defined in the environment configs
 */
var server = require('http').createServer(app);
var io = require('./io')(server);

server.listen(config.port, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log(("//////// " + process.env.NODE_ENV + ' server running at http://localhost:' + config.port).info);
});

/*
	exports app so that it's accessible in the whole application
 */

module.exports = app;