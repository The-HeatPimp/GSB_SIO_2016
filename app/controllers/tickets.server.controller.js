//////////////////////////////////////////////////
// CONTROLLER RELATED TO THE TICKETS COLLECTION //
//////////////////////////////////////////////////

/*
	require the DB model Ticket
 */
var Ticket = require('mongoose').model('Ticket');

/*
	Method : Render the page ticketsList
 */
exports.renderTicketsList = function(req, res, next) {
	if (req.user) {
		res.render('tickets/ticketsList', {
			title: 'Liste des tickets',
			messages: req.flash('error')
		});
	} else {
		return res.redirect('/');
	}
};

/*
	Method : Render the page Create ticket
 */
exports.renderCreateTicket = function(req, res, next) {
	if (req.user) {
		res.render('tickets/createTicket', {
			title: 'Création de tickets',
			messages: req.flash('error')
		});
	} else {
		return res.redirect('/');
	}
};

/*
	Method : Create a ticket
 */
exports.createTicket = function(req, res, next) {
	if (!req.ticket && req.user) {
		var ticket = new Ticket(req.body),
			user = req.user.username;
		// Print the active user as
		ticket.sender = user;
		ticket.save(function(err) {
			// error handling
			if (err) {
				return next(err);
			} else {
				return res.redirect('/tickets');
			}
		});
	}
};