////////////////////////
// ROUTES FOR TICKETS //
////////////////////////

var tickets = require('../../app/controllers/tickets.server.controller');


module.exports = function(apiRoutes) {

	/*
		Render the ticket list
	 */
	apiRoutes.route('/tickets')
		.get(tickets.renderTicketsList);

	/*
		create ticket
	 */
	apiRoutes.route('/tickets/createTicket')
		// Render the page
		.get(tickets.renderCreateTicket)
		// Catch the operation 
		.post(tickets.createTicket);

};