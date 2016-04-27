//////////////////
// INDEX ROUTES // 			ACCESSIBLE WITHOUT WEBTOKENS
//////////////////

module.exports = function(app) {
	var index = require('../controllers/index.server.controller');


	/*
		Redirect the user to the login page (! To be improved -> redirection if there'is no valid token in the request)
	 */
	app.route('/')
		.get(index.renderLogin);

	app.route('/test')
		.get(index.renderTest);
};