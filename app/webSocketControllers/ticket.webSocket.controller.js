var Ticket = require('mongoose').model('Ticket');
var AdminHandler = require('../controllers/authorizeAdmin');


module.exports = function(socket) {


	socket.on('createTicket', function(data) {
		console.log(data);
		var isValid = true;
		data = JSON.parse(data);
		var savedTicket = {};

		var currentDate = new Date();
		savedTicket = {
			title: data.title,
			typeRequest: data.typeRequest,
			priority: data.priority,
			creator: socket.decoded_token,
			created_at: currentDate,
			message: [{
				text: data.message,
				sender: socket.decoded_token,
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
		Ticket.find({
			"creator": socket.decoded_token
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

	socket.on('listTicketAdmin', function(data) {
		if (AdminHandler.accessLevel(socket.decoded_token)>1) {
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
		if (AdminHandler.accessLevel(socket.decoded_token)>1) {
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
					sender: socket.decoded_token
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