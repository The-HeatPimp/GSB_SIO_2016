///////////////////////////////////
// WEBSOCKET CONTROLLER : TICKET //
///////////////////////////////////

var Ticket = require('mongoose').model('Ticket');
var AdminHandler = require('../controllers/authorizeAdmin');
var top = require('../../io.js');
var connectedUsers = top.connectedUsers();

module.exports = function(socket) {

	// retrieve the name of the user by matching his sessionID with his username contained in connectedUsers
	function retrieveName(sessionID) {
		for (var item = 0; item < connectedUsers.length; item++) {
			if (connectedUsers[item].id === sessionID) {
				return connectedUsers[item].user;
			}
		}
	}
	// Method : createTicket :
	// Save a ticket to the database
	socket.on('createTicket', function(data) {
		console.log("creating ticket");
		name = retrieveName(socket.id);	
		var isValid = true;
		data = JSON.parse(data);
		var savedTicket = {};
		var currentDate = new Date();
		// validation process
		savedTicket = {
			title: data.title,
			typeRequest: data.typeRequest,
			priority: data.priority,
			creator: name,
			created_at: currentDate,
			message: [{
				text: data.message,
				sender: name,
				dateMessage: currentDate
			}],
			closed: false
		};
		for (var prop in savedTicket) {
			if (!prop) {
				isValid = false;
			}
		}
		// Legit
		if (isValid) {
			var ticket = new Ticket(savedTicket);
			// Save the ticket
			ticket.save(function(err) {
				if (err) {
					// send the response to the client
					socket.emit('createTicket', {
						"success": false,
						"error": err
					});

				} else {
					socket.emit('createTicket', {
						"success": true,
						"ticket": ticket
					});
				}
			});
		}
		// Not legit
		else {
			// send the eror to the client
			socket.emit('createTicket', {
				"success": false,
				"error": "incomplete request"
			});
		}
	});

	// Method : ListTicketUser :
	// List all the ticket created by the user
	socket.on('listTicketUser', function() {
		name = retrieveName(socket.id);
		// DB request : find all the ticket created by the user
		Ticket.find({
			"creator": name
		}, function(err, ticket) {

			// send the error to the client
			if (err) {
				console.log('err');
				socket.emit('listTicketUser', {
					"success": false,
					"error": err
				});
			} else if (ticket.length < 1) {
				console.log('none');
				socket.emit('listTicketUser', {
					"success": false,
					"error": "no ticket found in database"
				});
			} else {
				console.log('success');
				// send the response to the user
				socket.emit('listTicketUser', {
					"success": true,
					"ticket": ticket
				});
			}
		});
	});


	// Method : ListTicketID :
	// List all the ticket ID created by the user
	socket.on('listTicketID', function() {
		name = retrieveName(socket.id);
		// DB request : find all the ticket created by the user
		Ticket.find({
			"creator": name
		}, function(err, ticket) {
			// send the error to the client
			if (err)
				socket.emit('listTicketID', {
					"success": false,
					"error": err
				});
			else if (!ticket)
				socket.emit('listTicketID', {
					"success": false,
					"error": "no ticket found in database"
				});
			else {
				// format the response
				sentTicket = [];
				for (var i = 0; i < ticket.length; i++) {
					sentTicket[i] = {
						_id: ticket[i]._id,
					};
				}
				// send the response to the user
				socket.emit('listTicketID', {
					"success": true,
					"ticket": sentTicket
				});
			}
		});
	});

	// Method : requestLastTicket
	// Send the [item number] last answer to ticket involving the user
	socket.on('requestLastTicket', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		// DB request : find the tickets created by the user. Order it by last update DESC
		Ticket.find({
			"creator": name
		}).sort({
			updated_at: -1
		}).exec(function(err, ticket) {
			// send the error to the client
			if (err)
				socket.emit('requestLastTicket', {
					"success": false,
					"error": err
				});
			else if (!ticket)
				socket.emit('requestLastTicket', {
					"success": false,
					"error": "no ticket found in database"
				});
			else {
				// format the response in order to contain the given amount of answers
				sentTicket = [];
				for (var i = 0; i < data.nb; i++) {
					if (!ticket[i])
						break;
					if (ticket[i].message[ticket[i].message.length - 1].sender != name) {
						sentTicket[i] = {
							title: ticket[i].title,
							message: ticket[i].message[ticket[i].message.length - 1]
						};
					} else ++data.nb;
				}
				// send the response to the client
				socket.emit('requestLastTicket', {
					"success": true,
					"ticket": sentTicket
				});
			}
		});
	});

	// Method : ListTicketAdmin :
	// List all the existing ticket that are still opened
	socket.on('listTicketAdmin', function(data) {
		name = retrieveName(socket.id);
		// Check if the user has the necessary authorization
		if (AdminHandler.accessLevel(name) > 1) {
			// DB request : find all the tickets that aren't closed
			Ticket.find({
				
			}, function(err, ticket) {
				// send the error to the client
				if (err)
					socket.emit('listTicketAdmin', {
						"success": false,
						"error": err
					});
				else if (!ticket)
					socket.emit('listTicketAdmin', {
						"success": false,
						"error": "no ticket found in database"
					});
				else {
					// format the response
					// send the response to the client
					socket.emit('listTicketAdmin', {
						"success": true,
						"ticket": ticket
					});
				}
			});
		} else
		// send the authorization error to the client
			socket.emit('listTicketAdmin', {
			"success": false,
			"error": "unauthorized request"
		});
	});

	// Method : getTicket : 
	// Retrieve a ticket with an ID
	socket.on('getTicket', function(data) {
		data = JSON.parse(data);
		// DB request : find a ticket matching the given ID
		Ticket.findOne({
				_id: data._id
			},
			function(err, ticket) {
				// send the error to the client
				if (err)
					socket.emit('getTicket', {
						"success": false,
						"error": err
					});
				else if (!ticket)
					socket.emit('getTicket', {
						"success": false,
						"error": "no ticket found in database"
					});
				else
				// send the response to the client
					socket.emit('getTicket', {
					"success": true,
					"ticket": ticket
				});
			}
		);
	});

	// Method : CloseTicket:
	// Allow an admin or support guy to close a ticket
	socket.on('closeTicket', function(data) {
		name = retrieveName(socket.id);
		// Check for authorization
		if (AdminHandler.accessLevel(name) > 1) {
			data = JSON.parse(data);
			// DB request : Find a ticket matching the given ID
			Ticket.findOne({
				_id: data._id
			}, function(err, ticket) {
				// Send the error to the client
				if (err)
					socket.emit('closeTicket', {
						"success": false,
						"error": err
					});
				else if (!ticket)
					socket.emit('closeTicket', {
						"success": false,
						"error": "no ticket found in database"
					});
				else {
					// close and save the ticket
					ticket.closed = true;
					ticket.save(function(err) {
						// send the response to the client
						if (err) {
							socket.emit('closeTicket', {
								"success": false,
								"error": err
							});
						} else {
							socket.emit('closeTicket', {
								"success": true,
								"_id": ticket._id
							});
						}
					});
				}
			});
		} else
		// send the authorization error to the client
			socket.emit('closeTicket', {
			"success": false,
			"error": "unauthorized Request"
		});
	});


	// Method : answerToTicket : 
	// Allow the user to answer a ticket
	socket.on('answerToTicket', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		// DB request : Find a ticket matching the given ID
		Ticket.findOne({
			_id: data._id
		}, function(err, ticket) {
			// Send the response to the client
			if (err)
				socket.emit('answerToTicket', {
					"success": false,
					"error": err
				});
			else if (!ticket)
				socket.emit('answerToTicket', {
					"success": false,
					"error": "no ticket found in database"
				});
			else {
				// Add the answer to the ticket
				var currentDate = new Date();
				ticket.message.push({
					text: data.text,
					dateMessage: currentDate,
					sender: name
				});
				// save the ticket
				ticket.save(function(err) {
					// Send the response to the client
					if (err) {
						socket.emit('answerToTicket', {
							"success": false,
							"error": err
						});
					} else {
						var index = ticket.message.length - 1;
						ticket = {
							parent: ticket._id,
							sender: ticket.message[index].sender,
							dateMessage: ticket.message[index].dateMessage,
							text: ticket.message[index].text
						};
						socket.emit('answerToTicket', {
							"success": true,
							"comment": ticket
						});
					}
				});
			}
		});
	});
};