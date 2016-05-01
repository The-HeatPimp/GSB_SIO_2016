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


	io.use(socketioJwt.authorize({
		secret: jwtKey,
		handshake: true
	}));

	myEvent.on('pushTicket', function(data) {
		io.sockets.emit('pushTicket', data);

	});


	io.sockets.on('connection', function(socket) {
		// Connection confirmed to the user	
		var sessionid = socket.id;
		socket.join("main");
		myEvent.on('pushChat', function(data) {
			for (var f = 0; f < connectedUsers.length; f++) {
				if (connectedUsers[f].user == data.receiver) {
					var clientID = connectedUsers[f].id;
					clientID.emit('receiveMessage', data);
				}
			}

			socket.emit('pushChat', data);
		});
		User.find({
			username: socket.decoded_token
		}, function(err, user) {

			if (err) {
				console.log(("erreur Admission Admin : " + err).warn);
			} else if (!user[0])
				console.log("error: no user found during admission".warn);
			else {
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

		socket.on('disconnect', function() {
			var name = retrieveName(socket.id);
			var i = connectedUsers.indexOf(name);
			connectedUsers.splice(i, 1);
			listUserConnected();
			socket.disconnect();
		});

		socket.on('listActiveUser', function() {
			socket.emit('listActiveUser', {
				"success": true,
				"list": connectedUsers
			});
		});

		var userController = require('./app/webSocketControllers/user.webSocket.controller')(socket);
		var ticketController = require('./app/webSocketControllers/ticket.webSocket.controller')(socket);
		var scheduleController = require('./app/webSocketControllers/schedule.webSocket.controller')(socket);
		var vehicleRouteController = require('./app/webSocketControllers/vehicleRoute.webSocket.controller')(socket);
		var chatController = require('./app/webSocketControllers/chat.webSocket.controller')(socket);


		function retrieveName(sessionID) {
			for (var item = 0; item < connectedUsers.length; item++) {
				if (connectedUsers[item].id === sessionID) {
					return connectedUsers[item].user;
				}
			}
		}

		function listUserConnected() {
			var stringUser = "Connected users :  ".data;
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
			console.log(stringUser);
		}

	});


};
module.exports.connectedUsers = function() {
	return connectedUsers;
};