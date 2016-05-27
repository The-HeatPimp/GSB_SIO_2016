/////////////////////////////////
// WEBSOCKET CONTROLLER : USER //
/////////////////////////////////

var User = require('mongoose').model('User');
var AdminHandler = require('../controllers/authorizeAdmin');
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


	socket.on('findUniqueUsername', function(username) {
		var response = "";
		User.findOne({
				username: username
			},
			function(err, user) {
				if (!err) {
					if (!user) {
						// Return the possible Username
						socket.emit('findUniqueUsername', {
							success: true
						});
					} else {
						// Loop the method and search for a possible username with a suffix
						socket.emit('findUniqueUsername', {
							success: false,
							error: "Nom d'utilisateur deja prit"
						});
					}
				} else {
					// return nothing if there are missing parameters
					socket.emit('findUniqueUsername', {
						success: false,
						"error": "bad request"
					});
				}
			}
		);
		console.log(response);
	});


	// Method : CreateUser
	// Allow an admin to create an user
	socket.on('createUser', function(data) {
		name = retrieveName(socket.id);
		// Check for authorization
		if (AdminHandler.accessLevel(name) > 2) {
			// validation process
			var isValid = true;
			data = JSON.parse(data);
			console.log(data);
			var savedUser = new User(data);

			console.log(savedUser);
			// legit
			if (isValid) {
				// save the user

				savedUser.save(function(err) {
					// send the response to the client
					if (err)
						socket.emit('createUser', {
							"success": false,
							"error": err
						});

					else
						socket.emit('createUser', {
							"success": true,
							"user": savedUser
						});

				});

			}
			// not legit
			else
			// send the error to the client
				socket.emit('createUser', {
				"success": false,
				"error": "uncomplete request"
			});
		} else
		// send the authorization error to the client
			socket.emit('createUser', {
			"success": false,
			"error": "unauthorized request"
		});
	});

	// Method : listUser :
	// List all the user
	socket.on('listUser', function() {
		var validated = true;

		// DB request : Find all the users
		User.find({}, function(err, users) {
			// send the error to the client

			if (err)
				socket.emit('listUser', {
					"success": false,
					"error": err
				});
			else if (!users)
				socket.emit('listUser', {
					"success": false,
					"error": "no user found in database"
				});
			else
				socket.emit('listUser', {
					"success": true,
					"users": users
				});
		});
	});

	// Method : GetUser :
	// send a user that matches the giver ID
	socket.on('getUser', function(data) {
		data = JSON.parse(data);
		// DB request : Find a user that matches the given ID
		User.find({
			_id: data.id
		}, function(err, users) {
			// Send the error to the client
			if (err)
				socket.emit('getUser', {
					"success": false,
					"error": err
				});
			else if (!user)
				socket.emit('getUser', {
					"success": false,
					"error": "no user found in database"
				});
			else {
				// Format the reponse
				var sentUser = {
					firstName: users.firstName,
					lastName: users.lastName,
					email: users.email,
					username: users.username,
					address: [{
						street: users.address.street,
						zipCode: users.address.zipCode,
						city: users.address.city
					}],
					tel: users.tel,
					created_at: users.created_at,
					updated_at: users.created_at,
				};
				// send the response to the client
				socket.emit('getUser', {
					"success": true,
					"user": sentUser
				});
			}
		});
	});

	// Method : deleteUser : 
	// Allow a admin to delete an user
	socket.on('deleteUser', function(data) {
		name = retrieveName(socket.id);
		// Check for authorization
		if (AdminHandler.accessLevel(name) > 2) {
			data = JSON.parse(data);
			console.log(data);
			// DB request : find a user matching the given ID
			User.remove({
				_id: data._id
			}, function(err) {
				// send the response to the client
				if (err)
					socket.emit('deleteUser', {
						"success": false,
						"error": err
					});
				else
					socket.emit('deleteUser', {
						"success": true,
						'_id': data._id
					});
			});
		} else
		// send the authorization error to the client
			socket.emit('deleteUser', {
			"success": false,
			"error": "unauthorized request"
		});
	});

	// Method : updateUser : 
	// Update an user with given parameters
	socket.on('updateUser', function(data) {
		name = retrieveName(socket.id);
		// Check for authorization
		if (AdminHandler.accessLevel(name) > 2) {
			data = JSON.parse(data);
			var isValid = false;
			// DB request : find a user matching the given ID
			User.find({
				_id: data.id
			}, function(err, user) {
				// Send theerror to the client
				if (err)
					socket.emit('updateUser', {
						"success": false,
						"error": err
					});
				else if (!user)
					socket.emit('updateUser', {
						"success": false,
						"error": "no user found in database"
					});
				else {
					// Check for wich property to update and update it
					if ("firstName" in data && data.firstname !== undefined) {
						user.firstName = data.firstname;
						isValid = true;
					}
					if ("lastName" in data && data.lastName !== undefined) {
						user.lastName = data.lastName;
						isValid = true;
					}
					if ("email" in data && data.email !== undefined) {
						user.email = data.email;
						isValid = true;
					}
					if ("address" in data) {
						if ("street" in data.address) {
							user.address.street = data.address.street;
							isValid = true;
						}
						if ("zipCode" in data.address) {
							user.address.zipCode = data.address.zipCode;
							isValid = true;
						}
						if ("city" in data.address) {
							user.address.city = data.address.city;
							isValid = true;
						}
					}
					if ("tel" in data && data.tel !== undefined) {
						user.tel = data.tel;
						isValid = true;
					}
					// check for modification
					if (isValid) {
						// save the user
						user.save(function(err) {
							// send the response to the client
							if (err)
								socket.emit('updateUser', {
									"success": false,
									"error": err
								});
							else
								socket.emit('updateUser', {
									"success": true,
								});
						});
					} else {
						// send the error to the client
						socket.emit('updateUser', {
							"success": false,
							"error": "no changes detected"
						});
					}
				}
			});
		} else
		// send the authorization error to the client
			socket.emit('updateUser', {
			"success": false,
			"error": "unauthorized request"
		});
	});
};