	var connectedUsers = require('../../io.js').connectedUsers;


		exports.accessLevel = function(user) {
			for (var i = 0; i < connectedUsers.length; i++) {
				if(user == connectedUsers[i].user) {
					return connectedUsers[i].accessLevel;
				}
			}
			return false;
		};

