//////////////////
// INDEX ROUTES // 			ACCESSIBLE WITHOUT WEBTOKENS
//////////////////

module.exports = function(apiRoutes) {
	var api = require('../controllers/api.server.controller');
	// render the home page
	apiRoutes.route('/home')
		.get(api.renderHome);
};