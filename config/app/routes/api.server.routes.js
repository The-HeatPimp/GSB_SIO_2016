//////////////////
// INDEX ROUTES // 			ACCESSIBLE WITHOUT WEBTOKENS
//////////////////

module.exports = function(apiRoutes) {
	var api = require('../controllers/api.server.controller');
	// render the home page
	apiRoutes.route('/home')
		.get(api.renderHome);

	apiRoutes.route('/chat')
		.get(api.renderChat);

			apiRoutes.route('/agenda')
		.get(api.renderSchedule);

			apiRoutes.route('/locationVehicule')
		.get(api.renderRoute);

			apiRoutes.route('/ticket')
		.get(api.renderTicket);

			apiRoutes.route('/support')
		.get(api.renderSupport);

			apiRoutes.route('/admin')
		.get(api.renderAdmin);
};