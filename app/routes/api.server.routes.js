//////////////////
// INDEX ROUTES // 			ACCESSIBLE WITHOUT WEBTOKENS
//////////////////

module.exports = function(apiRoutes) {
	var api = require('../controllers/api.server.controller');


	/*
		Redirect the user to the login page (! To be improved -> redirection if there'is no valid token in the request)
	 */

	apiRoutes.route('/home')
		.get(api.renderHome);
};