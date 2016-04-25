	var connectedUsers = require('../../io.js').connectedUsers;


		exports.accessLevel = function(user) {
			for (var i = 0; i < connectedUsers.length; i++) {
				if(user == connectedUsers[i].user) {
					console.log(user + " access Level " + connectedUsers[i].accessLevel);
					return connectedUsers[i].accessLevel;
				}
			}
			return false;
		};