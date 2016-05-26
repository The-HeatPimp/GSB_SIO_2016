///////////////////////////////////////
// CONTROLLER : ACCESS LEVEL CHECKER //
///////////////////////////////////////

	var conUsers = require('../../io.js').connectedUsers;

		// return the accessLevel of the user
		exports.accessLevel = function(user) {
			var connectedUsers = conUsers();
			for (var i = 0; i < connectedUsers.length; i++) {
				console.log(connectedUsers[i].user);
				if(user == connectedUsers[i].user) {
					return connectedUsers[i].accessLevel;
				}
			}
			return false;
		};

