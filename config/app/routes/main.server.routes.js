var main = require('../../app/controllers/main.server.controller');

module.exports = function(apiRoutes) {

	apiRoutes.get('/', main.renderHome);
};