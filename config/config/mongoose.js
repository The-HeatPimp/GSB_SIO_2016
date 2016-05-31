///////////////////////////////////
// MONGOOSE MODULE CONFIGURATION //
///////////////////////////////////

/*
	Calling necessary modules
 */
var config = require('./config'),
	mongoose = require('mongoose');
/*
	linking mongoose to the database
 */
module.exports = function() {
	var db = mongoose.connect(config.db);
	require('../app/models/model.server.user');
	require('../app/models/model.server.ticket.js');
	require('../app/models/model.server.schedule.js');
	require('../app/models/model.server.vehicleRoute.js');
	require('../app/models/model.server.chat.js');
	console.log("//////// Models loaded ".verbose);
	return db;
};