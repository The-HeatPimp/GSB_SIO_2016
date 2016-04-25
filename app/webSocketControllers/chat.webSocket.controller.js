	var Chat = require('mongoose').model('Chat');
	var connectedUsers = require('../../io.js').connectedUsers;

	module.exports = function(socket) {
		socket.on('sendMessage', function(data) {
			data = JSON.parse(data);
			var isValid = true;
			var currentDate = new Date();
			var validation = {
				content: data.content,
				date: currentDate,
				sender: socket.decoded_token,
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
	};