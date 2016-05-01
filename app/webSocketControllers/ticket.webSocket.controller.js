var Ticket = require('mongoose').model('Ticket');
var AdminHandler = require('../controllers/authorizeAdmin');
var top = require('../../io.js');
var connectedUsers = top.connectedUsers();

module.exports = function(socket) {
	function retrieveName(sessionID) {
		for (var item = 0; item < connectedUsers.length; item++) {
			if (connectedUsers[item].id === sessionID) {
				return connectedUsers[item].user;
			}
		}
	}

	socket.on('createTicket', function(data) {
		name = retrieveName(socket.id);
		console.log(data);
		var isValid = true;
		data = JSON.parse(data);
		var savedTicket = {};

		var currentDate = new Date();
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
		if (isValid) {
			var ticket = new Ticket(savedTicket);
			console.log("ticket saved");
			ticket.save(function(err) {
				if (err) {
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
		} else {
			console.log("ticket not saved");
			socket.emit('createTicket', {
				"success": false,
				"error": "incomplete request"
			});
		}
	});

	socket.on('listTicketUser', function(data) {
		name = retrieveName(socket.id);
		Ticket.find({
			"creator": name
		}, function(err, ticket) {
			if (err)
				socket.emit('listTicketUser', {
					"success": false,
					"error": err
				});
			else if (!ticket)
				socket.emit('listTicketUser', {
					"success": false,
					"error": "no ticket found in database"
				});
			else
				sentTicket = [];
			for (var i = 0; i < ticket.length; i++) {
				sentTicket[i] = {
					id: ticket[i].id,
					title: ticket[i].title,
					typeRequest: ticket[i].typeRequest,
					importance: ticket[i].importance,
					created_at: ticket[i].created_at,
					closed: ticket[i].closed
				};
			}
			socket.emit('listTicketUser', {
				"success": true,
				"ticket": sentTicket
			});
		});
	});
	socket.on('requestLastTicket', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		Ticket.find({
			"creator": name
		}).sort({
			updated_at: -1
		}).exec(function(err, ticket) {
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
			else
				sentTicket = [];
			for (var i = 0; i < data.nb; i++) {
				if (!ticket[i])
					break;
				if (ticket[i].message[ticket[i].message.length - 1].sender != name) {
					sentTicket[i] = {
						title: ticket[i].title,
						message: ticket[i].message[ticket[i].message.length - 1]
					};
				} else
					++data.nb;
			}
			socket.emit('requestLastTicket', {
				"success": true,
				"ticket": sentTicket
			});
		});
	});
	socket.on('listTicketAdmin', function(data) {
		name = retrieveName(socket.id);
		if (AdminHandler.accessLevel(name) > 1) {
			Ticket.find({
				"closed": false
			}, function(err, ticket) {
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
				else
					sentTicket = [];
				for (var i = 0; i < ticket.length; i++) {
					sentTicket[i] = {
						id: ticket[i].id,
						title: ticket[i].title,
						typeRequest: ticket[i].typeRequest,
						importance: ticket[i].importance,
						created_at: ticket[i].created_at,
					};
				}
				console.log(sentTicket);
				socket.emit('listTicketAdmin', {
					"success": true,
					"ticket": sentTicket
				});
			});
		} else
			socket.emit('listTicketAdmin', {
				"success": false,
				"error": "unauthorized request"
			});
	});

	socket.on('getTicket', function(data) {
		data = JSON.parse(data);
		Ticket.findOne({
				_id: data.id
			},
			function(err, ticket) {
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
					socket.emit('getTicket', {
						"success": true,
						"ticket": ticket
					});
			}
		);
	});

	socket.on('closeTicket', function(data) {
		name = retrieveName(socket.id);
		if (AdminHandler.accessLevel(name) > 1) {
			data = JSON.parse(data);
			Ticket.findOne({
				_id: data.id
			}, function(err, ticket) {
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
					ticket.closed = true;
					ticket.save(function(err) {
						if (err) {
							socket.emit('closeTicket', {
								"success": false,
								"error": err
							});
						} else {
							socket.emit('closeTicket', {
								"success": true
							});
						}
					});
				}
			});
		} else
			socket.emit('closeTicket', {
				"success": false,
				"error": "unauthorized Request"
			});
	});

	socket.on('answerToTicket', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		Ticket.findOne({
			_id: data.id
		}, function(err, ticket) {
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
				var currentDate = new Date();
				ticket.message.push({
					text: data.text,
					dateMessage: currentDate,
					sender: name
				});
				ticket.save(function(err) {
					if (err) {
						socket.emit('answerToTicket', {
							"success": false,
							"error": err
						});
					} else {
						socket.emit('answerToTicket', {
							"success": true
						});
					}
				});
			}
		});
	});
};