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
				io.to(clientID).emit('receiveMessage', data);
			}
		}
	});

	// Binding route-schedule :
	// Add an event when a route is saved
	myEvent.on('pushRoute', function(data) {
		// Validation process

		var event = {};
		var i;
		console.log(data.route + "\n");

		Schedule.findOne({
			idRoute: data.route._id
		}, function(err, Eevent) {
			console.log("event1" + Eevent);
			if (!Eevent) {
				event = new Schedule({
					date_start: data.route.dateStart,
					date_end: data.route.dateEnd,
					title: "Location d'un véhicule",
					description: "trajet vers" + data.route.to,
					creator: data.route.driver,
					location: data.route.to,
					idRoute: data.route.id
				});
				for (i = 0; i < data.route.passenger.length; i++) {
					event.participant.push({
						username: data.route.passenger[i].username,
						participate:true
					});
				}
				console.log("or" + event);
				event.save(function(err) {
					// send the response to the client
					console.log("ok");
					var f = 0;
					var g = 0;
					var clientID = "";
					if (err) {
						console.log(err);
						for (f = 0; f < connectedUsers.length; f++) {
							for (g = 0; g < event.participant.length; g++) {
								if (connectedUsers[f].user == event.creator || connectedUsers[f].user == event.participant[g].username) {
									clientID = connectedUsers[f].id;
									io.to(clientID).emit('pushRoute', {
										"success": false,
										"error": err
									});
								}
							}
						}
					} else {
						console.log("ok123");
						for (f = 0; f < connectedUsers.length; f++) {
							for (g = 0; g < event.participant.length; g++) {
								if (connectedUsers[f].user == event.creator || connectedUsers[f].user == event.participant[g].username) {
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
			} else if (err)
				console.log(err);
			else {
				if (data.route.passenger)
					for (i = 0; i < data.route.passenger.length; i++) {
						Eevent.participant.push({
							username: data.route.passenger[i].username,
							participate: true
						});
					}
				event = new Schedule(Eevent);
				console.log("first" + event);
				Schedule.findOneAndUpdate({_id:event._id}, event, {upsert:true}, function(err, evt){
					// send the response to the client
					console.log(evt);
					var f = 0;
					var g = 0;
					var clientID = "";
					if (err) {
						console.log(err);
						for (f = 0; f < connectedUsers.length; f++) {
							for (g = 0; g < event.participant.length; g++) {
								if (connectedUsers[f].user == event.creator || connectedUsers[f].user == event.participant[g].username) {
									clientID = connectedUsers[f].id;
									io.to(clientID).emit('pushRoute', {
										"success": false,
										"error": err
									});
								}
							}
						}
					} else {
						console.log("ok123456");
						for (f = 0; f < connectedUsers.length; f++) {
							for (g = 0; g < event.participant.length; g++) {
								if (connectedUsers[f].user == event.creator || connectedUsers[f].user == event.participant[g].username) {
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

			// Legit
			console.log("event" + event);
			// save the event

		});
	});

	myEvent.on('pushDelRoute', function(data) {
		Schedule.find({
			idRoute: data._id
		}, function(err, event) {
			Schedule.remove({
				_id: {
					$in: event
				}
			}, function(err) {
				if (err)
					console.log(err);
				else
					console.log("removed event nb= " + event.length);
			}); // and so on
		});

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