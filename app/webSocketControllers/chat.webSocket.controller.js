	var Chat = require('mongoose').model('Chat');
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
		socket.on('sendMessage', function(data) {
			name = retrieveName(socket.id);
			data = JSON.parse(data);
			var isValid = true;
			var currentDate = new Date();
			var validation = {
				content: data.content,
				date: currentDate,
				sender: name,
				receiver: data.receiver
			};
			for (var prop in validation) {
				if (!prop) {
					isValid = false;
				}
			}
			if (isValid) {
				var message = new Chat(data);
				message.save(function(err) {
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
		});

		socket.on('requestAllMessage', function(data) {
			data = JSON.parse(data);
			Chat.find({}, function(err, messages) {
				if (err) {
					socket.emit('requestAllMessage', {
						"success": false,
						"error": err
					});

				} else {
					socket.emit('requestAllMessage', {
						"success": true,
						"message": message
					});
				}
			});
		});

		socket.on('requestLastMessage', function(data) {
			name = retrieveName(socket.id);
			data = JSON.parse(data);
			var messages = [];
			Chat.find({
				receiver: name
			}).sort({
				date: -1
			}).exec(function(err, message) {
				if (err) {
					socket.emit('requestAllMessage', {
						"success": false,
						"error": err
					});

				} else {
					var response = [];
					for (var i = 0; i < data.nb; i++) {
						if (message[i]) {
							response.push(message[i]);
						}
					}
					socket.emit('requestLastMessage', {
						"success": true,
						"message": response
					});
				}

			});

		});
	};