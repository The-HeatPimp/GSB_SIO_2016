var User = require('mongoose').model('User');
var connectedUsers = [];

module.exports = function(server) {
	console.log("//////// WebSocketControllers loaded".verbose);
	var io = require('socket.io')(server);
	var socketioJwt = require('socketio-jwt');
	var jwt = require('jsonwebtoken');
	var myEvent = require('./app/controllers/event');

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
	myEvent.on('pushTicket', function(data) {
		io.sockets.emit('pushTicket', data);

	});
	// on connection to the socket
	io.sockets.on('connection', function(socket) {
		// Connection confirmed to the user	
		var sessionID = socket.id;
		socket.join("main");
		// push service for Chat
		myEvent.on('pushChat', function(data) {
			for (var f = 0; f < connectedUsers.length; f++) {
				if (connectedUsers[f].user == data.receiver) {
					var clientID = connectedUsers[f].id;
					clientID.emit('receiveMessage', data);
				}
			}
			socket.emit('pushChat', data);
		});
		// find the user in the database
		User.find({
			username: socket.decoded_token
		}, function(err, user) {
			if (err) {
				console.log(("erreur Admission Admin : " + err).warn);
			} else if (!user[0])
				console.log("error: no user found during admission".warn);
			else {
				// add the user to the connectedUser array
				connectedUsers.push({
					user: socket.decoded_token,
					id: socket.id,
					accessLevel: user[0].accessLevel
				});
			}
			listUserConnected();
		});
		socket.emit('main', {
			message: 'Connection au socket main réussie'
		});

		// Send regular event TEST
		function sendTime() {
			io.emit('time', {
				time: new Date().toJSON()
			});
		}
		setInterval(sendTime, 10000);

		// on disconnection
		socket.on('disconnect', function() {
			// remove the user from the connectedUsers array
			var name = retrieveName(sessionID);
			var i = connectedUsers.indexOf(name);
			connectedUsers.splice(i, 1);
			listUserConnected();
			socket.disconnect();
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
		function listUserConnected() {
			var stringUser = "";
			if (connectedUsers.length > 0) {
				stringUser = "Connected users :  ".data;
				for (var j = 0; j < connectedUsers.length; j++) {
					switch (connectedUsers[j].accessLevel) {
						case 1:
							stringUser += ("\n" + (connectedUsers[j].user).yellow);
							break;
						case 2:
							stringUser += ("\n" + (connectedUsers[j].user).orange);
							break;
						case 3:
							stringUser += ("\n" + (connectedUsers[j].user).red);
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