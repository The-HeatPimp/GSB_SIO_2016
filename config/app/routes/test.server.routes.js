/////////////////////////////////////
// ROUTES FOR THE TEST OPERATIONS  //
/////////////////////////////////////

module.exports = function(apiRoutes) {
	var test = require('../controllers/test.server.controller');
/*
	Get the list of all users
 */
	apiRoutes.get('/users', test.userList);
/*
	Check with what account you're connected with
 */
	apiRoutes.get('/check', test.check);
};