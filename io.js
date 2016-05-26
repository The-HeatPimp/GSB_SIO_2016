var User = require('mongoose').model('User');
var connectedUsers = [];
var myEvent = require('./app/controllers/event');
var Schedule = require('mongoose').model('Schedule');

module.exports = function(server) {
	console.log("//////// WebSocketControllers loaded".verbose);
	var io = require('socket.io')(server);
	var socketioJwt = require('socketio-jwt');
	var jwt = require('jsonwebtoken');
	var Logger = require('socket.io-logger')();
	var options = {
		stream: {
			write: function(data) {
				console.log(data);
			}
		}
	};



	/*
		Set token syntax
	 */
	var config = require("./config/env/development");
	var jwtKey = config.jwtKey;

	// Token is necessary to set a connection
	io.use(socketioJwt.authorize({
		secret: jwtKey,
		handshake: true
	}));



	// pushService for ticket
	// myEvent.on('pushTicket', function(data) {
	// 	io.to(socketId).emit('pushTicket', data);

	// });
	// 
	myEvent.on('pushTicket', function(data) {
		for (var f = 0; f < connectedUsers.length; f++) {
			if (connectedUsers[f].user == data.creator || connectedUsers[f].accessLevel == 2 || connectedUsers[f].accessLevel == 3) {
				var clientID = connectedUsers[f].id;
				io.to(clientID).emit('pushTicket', data);
			}
		}
	});

	myEvent.on('pushChat', function(data) {
		for (var f = 0; f < connectedUsers.length; f++) {
			if (connectedUsers[f].user == data.receiver) {
				var clientID = connectedUsers[f].id;
				console.log("test" + connectedUsers[f].user);
				io.to(clientID).emit('receiveMessage', data);
			}
		}
	});

	// Binding route-schedule :
	// Add an event when a route is saved
	myEvent.on('pushRoute', function(data) {
		// Validation process
		var isValid = true;
		var savedEvent = {};
		savedEvent = {
			participant: data.passenger,
			date_start: data.dateStart,
			date_end: data.dateEnd,
			title: "Location d'un véhicule",
			description: "trajet vers" + data.to,
			creator: data.driver,
			location: data.to
		};
		participant.push(data.driver);
		for (var prop in savedEvent) {
			if (!prop) {
				isValid = false;
			}
		}
		// Legit
		if (isValid) {
			// save the event
			var event = new Schedule(savedEvent);
			event.save(function(err) {
				// send the response to the client
				var f = 0;
				var g = 0;
				var clientID = "";
				if (err) {
					for (f = 0; f < connectedUsers.length; f++) {
						for (g = 0; g < savedEvent.participant.length; g++) {
							if (connectedUsers[f].user == savedEvent.creator || connectedUsers[f].user == savedEvent.participant[g].username) {
								clientID = connectedUsers[f].id;
								io.to(clientID).emit('pushRoute', {
									"success": true,
									"event": event
								});
							}
						}
					}
				} else {
					for (f = 0; f < connectedUsers.length; f++) {
						for (g = 0; g < savedEvent.participant.length; g++) {
							if (connectedUsers[f].user == savedEvent.creator || connectedUsers[f].user == savedEvent.participant[g].username) {
								clientID = connectedUsers[f].id;
								io.to(clientID).emit('pushRoute', {
									"success": true,
									"event": event
								});

							}
						}
					}
				}
			});
		}
		// Not legit
		else {
			// send the error to the client
			socket.emit('createRouteEvent', {
				"success": false,
				"error": "incomplete request"
			});
		}
	});
	// on connection to the socket
	io.on('connection', function(socket) {
		// Send regular event TEST
		// function sendTime() {
		// 	socket.emit('time', {
		// 		time: new Date().toJSON()
		// 	});
		// }
		// setInterval(sendTime, 1000);
		// Connection confirmed to the user	
		// find the user in the database
		User.findOne({
			username: socket.decoded_token
		}, function(err, user) {
			var validated = true;
			if (err) {
				console.log(("erreur Admission Admin : " + err).warn);
			} else if (!user)
				console.log("error: no user found during admission".warn);
			else {
				for (var k = 0; k < connectedUsers.length; k++) {
					if (connectedUsers[k].id == socket.id) {
						validated = false;
					}
				}
				// add the user to the connectedUser array
				if (validated) {
					connectedUsers.push({
						user: user.username,
						id: socket.id,
						accessLevel: user.accessLevel
					});
					listUserConnected();
				}
			}

		});
		socket.join("main");
		socket.emit('main', {
			message: 'Connection au socket main réussie'
		});

		// on disconnection
		socket.on('disconnect', function() {
			// remove the user from the connectedUsers array
			var i = arrayObjectIndexOf(connectedUsers, socket.decoded_token, "user");

			connectedUsers.splice(i, 1);

		});

		// Method : ListActiveUser
		// Send the active user to the user
		socket.on('listActiveUser', function() {
			socket.emit('listActiveUser', {
				"success": true,
				"list": connectedUsers
			});
			console.log(connectedUsers);
		});

		// call the websocket controller
		var userController = require('./app/webSocketControllers/user.webSocket.controller')(socket);
		var ticketController = require('./app/webSocketControllers/ticket.webSocket.controller')(socket);
		var scheduleController = require('./app/webSocketControllers/schedule.webSocket.controller')(socket);
		var vehicleRouteController = require('./app/webSocketControllers/vehicleRoute.webSocket.controller')(socket);
		var chatController = require('./app/webSocketControllers/chat.webSocket.controller')(socket);

		// retrieve the name of the user by matching his sessionID with his username contained in connectedUsers
		function retrieveName(sessionID) {
			for (var item = 0; item < connectedUsers.length; item++) {
				if (connectedUsers[item].id === sessionID) {
					return connectedUsers[item].user;
				}
			}
		}
		// display the connected User in the consoe
		function arrayObjectIndexOf(myArray, searchTerm, property) {
			for (var i = 0, len = myArray.length; i < len; i++) {
				if (myArray[i][property] === searchTerm) return i;
			}
			return -1;
		}

		function listUserConnected() {

			var stringUser = "";
			if (connectedUsers.length > 0) {
				stringUser = ("Connected users : \n ").bold;
				for (var j = 0; j < connectedUsers.length; j++) {
					switch (connectedUsers[j].accessLevel) {
						case 1:
							stringUser += ((connectedUsers[j].user).bgWhite.black + " ");
							break;
						case 2:
							stringUser += ((connectedUsers[j].user).bgWhite.blue + " ");
							break;
						case 3:
							stringUser += ((connectedUsers[j].user).bgWhite.red + " ");
							break;
					}
				}
			} else {
				stringUser = "no User is connected";
			}
			console.log(stringUser);
		}
	});
};

// exports the connectedUsers Array
module.exports.connectedUsers = function() {
	return connectedUsers;
};