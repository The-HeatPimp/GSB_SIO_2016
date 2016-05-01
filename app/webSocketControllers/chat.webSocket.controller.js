////////////////////////////////////////
// WEBSOCKET CONTROLLER : CHAT SYSTEM //
////////////////////////////////////////

var Chat = require('mongoose').model('Chat');
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
	
	// Method : SendMessage :
	// Save a message in the database
	socket.on('sendMessage', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		// Validation process
		var isValid = true;
		var validation = {
			content: data.content,
			sender: name,
			receiver: data.receiver
		};
		for (var prop in validation) {
			if (!prop) {
				isValid = false;
			}
		}
		// legit
		if (isValid) {
			// save the object
			var message = new Chat(data);
			message.save(function(err) {
				// send the response to the client
				if (err) {
					socket.emit('sendMessage', {
						"success": false,
						"error": err
					});

				} else {
					socket.emit('sendMessage', {
						"success": true,
						"message": message
					});
				}
			});
		}
		// Not legit
		else {
			socket.emit('sendMessage', {
				"success": false,
				"error": "incomplete request"
			});
		}
	});

	// Method : requestAllMessages : 
	// request All the messages 
	socket.on('requestAllMessages', function(data) {
		data = JSON.parse(data);
		// DB request : find all
		Chat.find({}, function(err, messages) {
			// send the response to the client
			if (err) {
				socket.emit('requestAllMessages', {
					"success": false,
					"error": err
				});

			} else {
				socket.emit('requestAllMessages', {
					"success": true,
					"message": message
				});
			}
		});
	});

	// Method : requestLastMessage : 
	// request the last [number of items] messages received
	socket.on('requestLastMessage', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		// DB request : find all messages sent to the user, order by date DESC
		Chat.find({
			receiver: name
		}).sort({
			date: -1
		}).exec(function(err, message) {
			// send error to the client
			if (err) {
				socket.emit('requestAllMessage', {
					"success": false,
					"error": err
				});

			} else {
				// cut the result to match the suited number of items
				var response = [];
				for (var i = 0; i < data.nb; i++) {
					if (message[i]) {
						response.push(message[i]);
					}
				}
				// send the response to the client
				socket.emit('requestLastMessage', {
					"success": true,
					"message": response
				});
			}
		});
	});
};