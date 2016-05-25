////////////////
// API ROUTES // 			ACCESSIBLE ONLY WITH WEBTOKENS
////////////////

module.exports = function(app) {
	var index = require('../controllers/index.server.controller');
	// Render the login page on a root request
	app.route('/')
		.get(index.renderLogin);
};