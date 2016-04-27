

	var Route = require('mongoose').model('Route');
	var Vehicle = require('mongoose').model('Vehicle');
	var AdminHandler = require('../controllers/authorizeAdmin');

	module.exports = function(socket) {

		socket.on('addVehicle', function(data) {
			if (AdminHandler.accessLevel(socket.decoded_token) > 2) {
				data = JSON.parse(data);
				for (var v = 0; v < data.length; v++) {
					var vehicle = new Vehicle(data[v]);
					vehicle.save(function(err) {
						if (err) {
							socket.emit('addVehicle', {
								"success": false,
								"error": err
							});

						} else {
							socket.emit('addVehicle', {
								"success": true,
								"vehicle": vehicle
							});
						}
					});
				}
			} else
				socket.emit('addVehicle', {
					"success": false,
					"error": "unauthorized request"
				});
		});

		socket.on('delVehicle', function(data) {
			if (AdminHandler.accessLevel(socket.decoded_token) > 2) {
				data = JSON.parse(data);
				Vehicle.findOne({
					_id: data.id
				}, function(err, vehicle) {
					if (err)
						socket.emit('delVehicle', {
							"success": false,
							"error": err
						});
					else if (!vehicle)
						socket.emit('delVehicle', {
							"success": false,
							"error": "no vehicle found in database"
						});
					else {
						vehicle.remove(function(err) {
							if (err)
								socket.emit('delVehicle', {
									"success": false,
									"error": err
								});
							else
								socket.emit('delVehicle', {
									"success": true,
								});
						});
					}
				});
			} else
				socket.emit('delVehicle', {
					"success": false,
					"error": "unauthorized request"
				});
		});

		socket.on('findFreeVehicle', function(data) {
			data = JSON.parse(data);
			Vehicle.findOne({
					$and: [{
						"free": true
					}, {
						"location": data.location
					}, {
						"type": data.type
					}]
				},
				function(err, vehicle) {
					if (err)
						socket.emit('findFreeVehicle', {
							"success": false,
							"error": err
						});
					else if (!vehicle)
						socket.emit('findFreeVehicle', {
							"success": false,
							"error": "no vehicle found in database"
						});
					else {

						var sentVehicle = {
							id: vehicle.id,
							location: vehicle.location,
							type: vehicle.type,
							seat: vehicle.seat
						};
						socket.emit('findFreeVehicle', {
							"success": true,
							"vehicle": sentVehicle
						});
					}
				});
		});

		socket.on('findVehicle', function(data) {
			if (AdminHandler.accessLevel(socket.decoded_token) > 2) {
				data = JSON.parse(data);
				Vehicle.findOne({
						$and: [{
							"location": data.location
						}, {
							"type": data.type
						}]
					},
					function(err, vehicle) {
						if (err)
							socket.emit('findVehicle', {
								"success": false,
								"error": err
							});
						else if (!vehicle)
							socket.emit('findVehicle', {
								"success": false,
								"error": "no vehicle found in database"
							});
						else {
							var sentVehicle = {
								id: vehicle.id,
								location: vehicle.location,
								type: vehicle.type,
								seat: vehicle.seat,
								loanStart: vehicle.loanStart,
								loanEnd: vehicle.loanEnd
							};
							socket.emit('findVehicle', {
								"success": true,
								"vehicle": sentVehicle
							});
						}
					});
			}
			socket.emit('findVehicle', {
				"success": false,
				"error": "unauthorized request"
			});
		});

		socket.on('listVehicle', function(data) {
			data = JSON.parse(data);
			Vehicle.find({},
				function(err, vehicle) {
					if (err)
						socket.emit('listVehicle', {
							"success": false,
							"error": err
						});
					else if (!vehicle)
						socket.emit('listVehicle', {
							"success": false,
							"error": "no vehicle found in database"
						});
					else {
						var sentVehicle = [];
						for (var i = 0; i < vehicle.length; i++) {
							sentVehicle.push({
								id: vehicle[i].id,
								location: vehicle[i].location,
								type: vehicle[i].type,
								seat: vehicle[i].seat,
								loanStart: vehicle[i].loanStart,
								loanEnd: vehicle[i].loanEnd
							});
						}
						socket.emit('listVehicle', {
							"success": true,
							"vehicle": sentVehicle
						});
					}
				});
		});

		socket.on('vehicleFindByID', function(data) {
			data = JSON.parse(data);
			Vehicle.findOne({
					_id: data.id
				},
				function(err, vehicle) {
					if (err)
						socket.emit('vehicleFindByID', {
							"success": false,
							"error": err
						});
					else if (!vehicle)
						socket.emit('vehicleFindByID', {
							"success": false,
							"error": "no vehicle found in database"
						});
					else {
						var sentVehicle = {
							id: vehicle.id,
							location: vehicle.location,
							type: vehicle.type,
							seat: vehicle.seat,
							oanStart: vehicle.loanStart,
							loanEnd: vehicle.loanEnd
						};
						socket.emit('vehicleFindByID', {
							"success": true,
							"vehicle": sentVehicle
						});
					}
				});
		});

		socket.on('createRoute', function(data) {
			data = JSON.parse(data);
			Vehicle.find({
					_id: data.id
				},
				function(err, vehicle) {
					if (err)
						socket.emit('createRoute', {
							"success": false,
							"error": err
						});
					else if (!vehicle)
						socket.emit('createRoute', {
							"success": false,
							"error": "no vehicle found in database"
						});
					else {
						if (vehicle.free) {

							var route = new Route(data.route);

							route.vehicle = vehicle.id;
							route.driver = socket.decoded_token;
							route.freeSeat = vehicle.seat - 1;

							vehicle.free = false;
							vehicle.loanStart = route.dateStart;
							vehicle.loanEnd = route.dataEnd;

							route.save(function(err) {
								if (err)
									socket.emit('createRoute', {
										"success": false,
										"error": err
									});
								else {
									socket.emit('createRoute', {
										"success": true,
										"route": route
									});
									vehicle.save(function(err) {
										if (err)
											socket.emit('createRoute', {
												"success": false,
												"error": err
											});
									});
								}

							});
						} else
							socket.emit('createRoute', {
								"success": false,
								"error": "Vehicle is already in a Route"
							});
					}
				});
		});

		socket.on('deleteMyRoute', function(data) {
			data = JSON.parse(data);
			Route.findOne({
				$and: [{
					_id: data.id
				}, {
					"driver": socket.decoded_token
				}]
			}, function(err, route) {
				if (err)
					socket.emit('deleteMyRoute', {
						"success": false,
						"error": err
					});
				else if (!route)
					socket.emit('deleteMyRoute', {
						"success": false,
						"error": "no route found in database"
					});
				else {
					var vehicleID = route.vehicle;
					route.remove(function(err) {
						if (err)
							socket.emit('deleteMyRoute', {
								"success": false,
								"error": err
							});
						else {
							socket.emit('deleteMyRoute', {
								"success": true,
							});
							Vehicle.findOne({
								_id: vehicleID
							}, function(err, vehicle) {
								if (err)
									socket.emit('deleteMyRoute', {
										"success": false,
										"error": err
									});
								else {
									vehicle.free = true;
									vehicle.loanStart = null;
									vehicle.loanEnd = null;

									vehicle.save(function(err) {
										if (err)
											socket.emit('deleteMyRoute', {
												"success": true,
												"error": err
											});
									});
								}

							});
						}
					});
				}
			});
		});
// similar heure depart arrivée +- H lieu place libre
// 
		socket.on('listRoute', function(data) {
			data = JSON.parse(data);
			Route.find({}, function(err, route) {
				if (err)
					socket.emit('listRoute', {
						"success": false,
						"error": err
					});
				else if (!route)
					socket.emit('listRoute', {
						"success": false,
						"error": "no route found in database"
					});
				else
					sentRoute = [];
				for (var i = 0; i < route.length; i++) {
					sentRoute[i] = {
						from: route.from,
						to: route.to,
						vehicule: route.vehicule,
						dateStart: route.dateStart,
						dateEnd: route.dateEnd,
						freeSeat: route.freeSeat,
						driver: route.driver,
						passenger: route.passenger
					};
				}
				socket.emit('listRoute', {
					"success": true,
					"route": sentRoute
				});
			});
		});

		socket.on('listMyRoute', function(data) {
			data = JSON.parse(data);
			Route.find({
				$or: [{
					"driver": socket.decoded_token
				}, {
					"passenger.username": socket.decoded_token
				}]
			}, function(err, route) {
				if (err)
					socket.emit('listRoute', {
						"success": false,
						"error": err
					});
				else if (!route)
					socket.emit('listRoute', {
						"success": false,
						"error": "no route found in database"
					});
				else
					sentRoute = [];
				for (var i = 0; i < route.length; i++) {
					sentRoute[i] = {
						from: route.from,
						to: route.to,
						vehicule: route.vehicule,
						dateStart: route.dateStart,
						dateEnd: route.dateEnd,
						freeSeat: route.freeSeat,
						driver: route.driver,
						passenger: route.passenger
					};
				}
				socket.emit('listRoute', {
					"success": true,
					"route": sentRoute
				});
			});
		});


		socket.on('takeRoute', function(data) {
			data = JSON.parse(data);
			Route.find({
				_id: data.id
			}, function(err, route) {
				if (err)
					socket.emit('takeRoute', {
						"success": false,
						"error": err
					});
				else if (!route)
					socket.emit('takeRoute', {
						"success": false,
						"error": "no route found in database"
					});
				else {
					if (route.freeSeat > 0) {
						route.passenger.push({
							username: socket.decoded_token
						});
						route.freeSeat = route.freeSeat - 1;

						route.save(function(err) {
							if (err)
								socket.emit('takeRoute', {
									"success": false,
									"error": err
								});
							else {
								socket.emit('takeRoute', {
									"success": true,
									"route": route
								});
							}
						});
					}
				}
			});

		});

		socket.on('leaveRoute', function(data) {
			data = JSON.parse(data);
			Route.find({
				_id: data.id
			}, function(err, route) {
				if (err)
					socket.emit('leaveRoute', {
						"success": false,
						"error": err
					});
				else if (!route)
					socket.emit('leaveRoute', {
						"success": false,
						"error": "no route found in database"
					});
				else {
					var happened = false;
					for (var i = 0; i < route.passenger.length(); i++) {
						if (route.passenger[i].username == socket.decoded_token) {
							route.passenger.splice(i, 1);
							route.freeSeat = route.freeSeat + 1;
							happened = true;
						}
					}
					if (happened) {
						route.save(function(err) {
							if (err)
								socket.emit('leaveRoute', {
									"success": false,
									"error": err
								});
							else {
								socket.emit('leaveRoute', {
									"success": true
								});
							}
						});
					} else {
						socket.emit('leaveRoute', {
							"success": false,
							"error": "no user matching"
						});
					}
				}
			});
		});

	};