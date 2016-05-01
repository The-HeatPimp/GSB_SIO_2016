	var User = require('mongoose').model('User');
	var AdminHandler = require('../controllers/authorizeAdmin');
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

		socket.on('createUser', function(data) {
			name = retrieveName(socket.id);
			if (AdminHandler.accessLevel(name) > 2) {
				var isValid = true;
				data = JSON.parse(data);
				var savedUser = new User();
				if (data.address) {
					savedUser = {
						firstName: data.firstName,
						lastName: data.lastName,
						email: data.email,
						username: data.username,
						address: [{
							street: data.address.street,
							zipCode: data.address.zipCode,
							city: data.address.city
						}],
						tel: data.tel,
						password: data.password
					};
					for (var prop in savedUser) {
						if (!savedUser.prop) {
							isValid = false;
						}
					}
					if (isValid) {
						User.save(function(err) {
							if (err)
								socket.emit('createUser', {
									"success": false,
									"error": err
								});

							else
								socket.emit('createUser', {
									"success": true,
									"user": user
								});

						});

					} else
						socket.emit('createUser', {
							"success": false,
							"error": "uncomplete request"
						});
				} else
					socket.emit('createUser', {
						"success": false,
						"error": "uncomplete request"
					});
			} else
				socket.emit('createUser', {
					"success": false,
					"error": "unauthorized request"
				});
		});

		socket.on('listUser', function(data) {
			data = JSON.parse(data);
			User.find({}, function(err, users) {
				if (err)
					socket.emit('listUser', {
						"success": false,
						"error": err
					});
				else if (!user)
					socket.emit('listUser', {
						"success": false,
						"error": "no user found in database"
					});
				else {
					var sentUser = [];
					for (var i = 0; i < users.length; i++) {
						sentUser[i] = {
							id: users.id,
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
							updated_at: users.updated_at,
						};
					}
					socket.emit('listUser', {
						"success": true,
						"users": sentUser
					});
				}
			});
		});

		socket.on('getUser', function(data) {
			data = JSON.parse(data);
			User.find({
				_id: data.id
			}, function(err, users) {
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
					socket.emit('getUser', {
						"success": true,
						"user": sentUser
					});
				}
			});
		});

		socket.on('deleteUser', function(data) {
			name = retrieveName(socket.id);
			if (AdminHandler.accessLevel(name) > 2) {
				data = JSON.parse(data);
				User.find({
					_id: data.id
				}, function(err, user) {
					if (err)
						socket.emit('deleteUser', {
							"success": false,
							"error": err
						});
					else if (!user)
						socket.emit('deleteUser', {
							"success": false,
							"error": "no user found in database"
						});
					else {
						user.remove(function(err) {
							if (err)
								socket.emit('deleteUser', {
									"success": false,
									"error": err
								});
							else
								socket.emit('deleteUser', {
									"success": true
								});
						});
					}
				});
			} else
				socket.emit('deleteUser', {
					"success": false,
					"error": "unauthorized request"
				});
		});

		socket.on('updateUser', function(data) {
			name = retrieveName(socket.id);
			if (AdminHandler.accessLevel(name)) {
				data = JSON.parse(data);
				var isValid = false;
				User.find({
					_id: data.id
				}, function(err, user) {
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
						if (isValid) {
							user.save(function(err) {
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
							socket.emit('updateUser', {
								"success": false,
								"error": "no changes detected"
							});
						}
					}
				});
			} else
				socket.emit('updateUser', {
					"success": false,
					"error": "unauthorized request"
				});
		});
	};