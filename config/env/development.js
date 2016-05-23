//////////////////////////////////////////////
// DEFINTION OF THE ENVIRONMENT DEVELOPMENT //
//////////////////////////////////////////////

/*
	Setting up the environment of work for development phase
 */

var port = 3000;

module.exports = {
	port: port,
	db: 'mongodb://127.0.0.1/PPE2015',
	jwtKey: 'secret'
};