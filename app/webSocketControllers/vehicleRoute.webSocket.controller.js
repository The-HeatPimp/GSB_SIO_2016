////////////////////////////////////////////
// WEBSOCKET CONTROLLER : VEHICLE & ROUTE //
////////////////////////////////////////////
///
///
// TODO PARIS en dur

var Route = require('mongoose').model('Route');
var Vehicle = require('mongoose').model('Vehicle');
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

	// Method : addVehicle :
	// Allow an admin to add a vehicle
	socket.on('addVehicle', function(data) {
		name = retrieveName(socket.id);

		// Check for authorization
		console.log(AdminHandler.accessLevel(name));
		if (AdminHandler.accessLevel(name) > 2) {
			data = JSON.parse(data);
			// create a new vehicle for each item in the array
			var vehicle = new Vehicle(data);
			console.log(vehicle);
			vehicle.save(function(err) {
				if (err) {
					// send the response to the client
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

		} else
		// send the authorization error to the client
			socket.emit('addVehicle', {
			"success": false,
			"error": "unauthorized request"
		});
	});


	// Method : delVehicle : 
	// Allow an admin to delete a vehicle
	socket.on('delVehicle', function(data) {

		name = retrieveName(socket.id);
		// Check for authorization
		if (AdminHandler.accessLevel(name) > 2) {
			data = JSON.parse(data);
			// DB request : Find a vehicle matching the given ID
			Vehicle.findOne({
				_id: data._id
			}, function(err, vehicle) {
				// Send the error to the client

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
					// remove the vehicle from the database
					vehicle.remove(function(err) {
						// send the respose to the client
						if (err)
							socket.emit('delVehicle', {
								"success": false,
								"error": err
							});
						else
							socket.emit('delVehicle', {
								"success": true,
								"_id": data._id
							});
					});
				}
			});
		} else
		// send the authorization error to the client
			socket.emit('delVehicle', {
			"success": false,
			"error": "unauthorized request"
		});
	});

	// Method : findFreeVehicle :
	// Find a random free vehicle matching the given criterias
	// socket.on('findFreeVehicle', function(data) {
	// 	data = JSON.parse(data);
	// 	// DB request : find a free vehicle with the given type and location
	// 	Vehicle.findOne({
	// 			$and: [{
	// 				"free": true
	// 			}, {
	// 				"type": data.type
	// 			}]
	// 		},
	// 		function(err, vehicle) {
	// 			// send the error to the client 
	// 			if (err)
	// 				socket.emit('findFreeVehicle', {
	// 					"success": false,
	// 					"error": err
	// 				});
	// 			else if (!vehicle)
	// 				socket.emit('findFreeVehicle', {
	// 					"success": false,
	// 					"error": "no vehicle found in database"
	// 				});
	// 			else {
	// 				// format the response
	// 				var sentVehicle = {
	// 					_id: vehicle._id,
	// 					type: vehicle.type,
	// 					seat: vehicle.seat
	// 				};
	// 				// send the response to the client
	// 				socket.emit('findFreeVehicle', {
	// 					"success": true,
	// 					"vehicle": sentVehicle
	// 				});
	// 			}
	// 		});
	// });

	// Method : ListVehicle :
	// List all the vehicles
	socket.on('listVehicle', function() {

		name = retrieveName(socket.id);
		// Check for authorization
		if (AdminHandler.accessLevel(name) > 2) {

			// DB request : find all
			Vehicle.find({},
				function(err, vehicle) {
					// send error to the client

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
						// format the response
						var sentVehicle = [];
						for (var i = 0; i < vehicle.length; i++) {
							sentVehicle.push({
								_id: vehicle[i]._id,
								location: vehicle[i].location,
								type: vehicle[i].type,
								seat: vehicle[i].seat,
								loanStart: vehicle[i].loanStart,
								loanEnd: vehicle[i].loanEnd,
								free: vehicle[i].free
							});
						}

						// send the response to the client
						socket.emit('listVehicle', {
							"success": true,
							"vehicle": sentVehicle
						});
					}
				});
		} else
		// send the authorization error to the client
			socket.emit('delVehicle', {
			"success": false,
			"error": "unauthorized request"
		});
	});

	// Method : VehicleFindByID : 
	// Find a vehicle with the given ID
	socket.on('vehicleFindByID', function(data) {
		data = JSON.parse(data);
		// DB request : Find a vehicle matching the given ID
		Vehicle.findOne({
				_id: data._id
			},
			function(err, vehicle) {
				// send the error to the client
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
					// format the reponse
					var sentVehicle = {
						_id: vehicle._id,
						location: vehicle.location,
						type: vehicle.type,
						seat: vehicle.seat,
						loanStart: vehicle.loanStart,
						loanEnd: vehicle.loanEnd
					};
					// send the response to th client
					socket.emit('vehicleFindByID', {
						"success": true,
						"vehicle": sentVehicle
					});
				}
			});
	});

	// Method : createRoute :
	// Allow a user to create a new route with a given vehicle
	socket.on('createRoute', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		track = data.route;
		Route.findOne({
			$and: [{
				$or: [{
					"passenger.username": name
				}, {
					"driver": name
				}]
			}, {
				$or: [{
					$and: [{
						"dateStart": {
							$lte: data.route.dateStart
						}
					}, {
						"dateEnd": {
							$gte: data.route.dateStart
						}
					}]
				}, {
					$and: [{
						"dateStart": {
							$lte: data.route.dateEnd
						}
					}, {
						"dateEnd": {
							$gte: data.route.dateEnd
						}
					}]
				}]
			}]
		}, function(err, docs) {
			if (err)
				socket.emit('createRoute', {
					"success": false,
					"error": err
				});
			else if (docs)
				socket.emit('createRoute', {
					"success": false,
					"error": "a route already exist a that time"
				});
			else {

				// DB request : Find a vehicle with the given ID
				Vehicle.findOne({
						$and: [{
							"free": true
						}, {
							"type": data.type
						}]
					},
					function(err, vehicle) {
						// send the error to the client 
						if (err)
							socket.emit('createRoute', {
								"success": false,
								"error": err
							});
						else if (!vehicle || vehicle.length < 1)
							socket.emit('createRoute', {
								"success": false,
								"error": "no vehicle found in database"
							});
						else {
							console.log(data);
							// If the vehicle is free
							// Create a new route
							var route = new Route(track);
							route.vehicle = vehicle._id;
							route.driver = name;
							route.freeSeat = vehicle.seat - 1;
							// update the vehicle
							vehicle.free = false;
							vehicle.loanStart = route.dateStart;
							vehicle.loanEnd = route.dataEnd;
							// save the route
							route.save(function(err) {
								// send the error to the client
								if (err)
									socket.emit('createRoute', {
										"success": false,
										"error": err
									});
								else {
									// save the vehicle
									vehicle.save(function(err) {
										// send error to the user
										if (err) {
											console.log("error : Database integrity compromised".error);
											socket.emit('createRoute', {
												"success": false,
												"error": err
											});
										} else {
											// send response to the user
											route.vehicle = vehicle;
											socket.emit('createRoute', {
												"success": true,
												"route": route

											});
										}
									});
								}

							});
						}
					});
			}
		});
	});

	// Method : deleteMyRoute
	// Allow the user to delete his route
	socket.on('deleteMyRoute', function(data) {
		name = retrieveName(socket.id);
		console.log(data);
		data = JSON.parse(data);
		// DB request : Find a route with a given ID and driver
		Route.findOne({
			$and: [{
				_id: data._id
			}, {
				"driver": name
			}]
		}, function(err, route) {

			// send error to the client
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
				console.log(route);
				route.remove(
					function(err) {
						if (err)
							socket.emit('deleteMyRoute', {
								"success": false,
								"error": err
							});
						else {
							Vehicle.findOneAndUpdate({
								_id: route.vehicle
							}, {
								$set: {
									free: true
								}
							}, {
								new: true
							}, function(err, doc) {
								if (err)
									socket.emit('deleteMyRoute', {
										"success": false,
										"error": err
									});
								else if (!doc)
									socket.emit('deleteMyRoute', {
										"success": false,
										"error": "no vehicule found in database"
									});
								else {
									socket.emit('deleteMyRoute', {
										"success": true,
										"route": route
									});
								}
							});
						}
					});
				// remeber the vehicle ID
			}

		});
	});

	// Method : listRoute
	// List all the existing route that are still to run
	socket.on('listRoute', function() {
		var currentDate = new Date();
		// DB request : find routes still to run
		Route.find({
			"dateStart": {
				$gt: currentDate
			}
		}, function(err, route) {
			// send error to the client
			if (err)
				socket.emit('listRoute', {
					"success": false,
					"error": err
				});
			else if (route.length < 1)
				socket.emit('listRoute', {
					"success": false,
					"error": "no route found in database"
				});
			else {
				// format the response
				// send the response to the user
				socket.emit('listRoute', {
					"success": true,
					"route": route
				});
			}
		});
	});


	// Method : listRoute
	// List all the existing route that are still to run
	socket.on('getRoute', function(data) {
		data = JSON.parse(data);
		// DB request : find routes still to run
		Route.findOne({
			_id: data._id
		}, function(err, route) {
			// send error to the client
			if (err)
				socket.emit('getRoute', {
					"success": false,
					"error": err
				});
			else if (!route)
				socket.emit('getRoute', {
					"success": false,
					"error": "no route found in database"
				});
			else {
				Vehicle.findOne({
					_id: route.vehicle
				}, function(err, vehicle) {
					// send error to the client
					if (err)
						socket.emit('getRoute', {
							"success": false,
							"error": err
						});
					else if (!vehicle)
						socket.emit('getRoute', {
							"success": false,
							"error": "no vehicle found in database"
						});
					else {
						route.vehicle = vehicle;
						// send the response to the user
						socket.emit('getRoute', {
							"success": true,
							"route": route
						});
					}
				});
			}
		});
	});
	// Method : findSimilarRoute :
	// Find a route matching the given criterias
	socket.on('findSimilarRoute', function(data) {

		data = JSON.parse(data);
		var tolerance;
		if (data.tolerance)
			tolerance = data.tolerance;
		else
			tolerance = 180;
		var tempD = new Date(data.dateStart);
		var tempE = new Date(data.dateEnd);


		var dateMin = addMinutes(tempD, -(tolerance));
		var dateMax = addMinutes(tempD, tolerance);

		var dateEMin = addMinutes(tempE, -(tolerance));
		var dateEMax = addMinutes(tempE, tolerance);

		// DB request : find routes still to run
		Route.find({
			"dateStart": {
				$gt: dateMin,
				$lt: dateMax
			},
			"dateEnd": {
				$gt: dateEMin,
				$lt: dateEMax
			},
			"to": data.to,
			"freeSeat": {
				$gt: 0
			}

		}, function(err, route) {
			// send error to the client

			if (err) {
				socket.emit('findSimilarRoute', {
					"success": false,
					"error": err
				});

			} else if (route.length < 1) {
				socket.emit('findSimilarRoute', {
					"success": false,
					"error": "no route found in database"
				});

			} else {
				// format the response
				tempTab = [];
				for (var k = 0; k < route.length; k++) {
					tempTab.push(route[k].vehicle.toString());
				}
				Vehicle.find({
					_id: {
						$in: tempTab
					}
				}, function(err, vehicle) {

					if (err) {
						socket.emit('findSimilarRoute', {
							"success": false,
							"error": err
						});

					} else if (vehicle.length < route.length) {
						socket.emit('findSimilarRoute', {
							"success": false,
							"error": "no vehicle matching"
						});

					} else {
						for (var j = 0; j < vehicle.length; j++) {
							route[j].vehicle = vehicle[j];
						}

						// send the response to the user
						socket.emit('findSimilarRoute', {
							"success": true,
							"route": route
						});
					}
				});
			}
		});
	});

	// Method : listMyRoute
	// List the route in which the user is involved
	socket.on('listMyRoute', function() {
		name = retrieveName(socket.id);
		console.log(name);

		// DB request : find the routes in which the user is either driver or passenger
		Route.find({
			$or: [{
				"driver": name
			}, {
				"passenger.username": name
			}]
		}, function(err, route) {
			// send the error to the client
			console.log(route);
			if (err)
				socket.emit('listRoute', {
					"success": false,
					"error": err
				});
			else if (route.length < 1)
				socket.emit('listMyRoute', {
					"success": false,
					"error": "no route found in database"
				});
			else {
				// send the response to the user
				socket.emit('listMyRoute', {
					"success": true,
					"route": route
				});
			}
		});
	});

	// Method : listMyRoute
	// List the route in which the user is involved
	socket.on('getAllRoute', function() {
		name = retrieveName(socket.id);
		// DB request : find the routes in which the user is either driver or passenger
		Route.find({
			$or: [{
				"driver": name
			}, {
				"passenger.username": name
			}]
		}, function(err, route) {

			// send the error to the client
			if (err)
				socket.emit('getAllRoute', {
					"success": false,
					"error": err
				});
			else if (route.length < 1)
				socket.emit('getAllRoute', {
					"success": false,
					"error": "no route found in database"
				});
			else {
				// Format the reponse
				sentRoute = [];
				for (var i = 0; i < route.length; i++) {
					sentRoute[i] = {
						_id: route[i]._id
					};
				}

				// send the response to the user
				socket.emit('getAllRoute', {
					"success": true,
					"route": sentRoute
				});
			}
		});
	});
	// Method : takeRoute:
	// Add the user as passenger in a given route
	socket.on('takeRoute', function(data) {
		data = JSON.parse(data);
		name = retrieveName(socket.id);
		Route.findOne({
			_id: data._id,
			driver: {
				"$ne": name
			},
			'passenger.username': {
				$ne: name
			}
		}, function(err, route) {

			// send the error to the client
			if (err)
				socket.emit('takeRoute', {
					"success": false,
					"error": err
				});
			else if (!route)
				socket.emit('takeRoute', {
					"success": false,
					"error": "no route found in database or user already in route"
				});
			else {
				// Check if free seats remain
				if (route.freeSeat > 0) {
					// add the user as passenger
					route.passenger.push({
						username: name
					});
					// update the number of free seat
					route.freeSeat = route.freeSeat - 1;
					// save the route
					route.save(function(err) {
						// send response to the client
						if (err)
							socket.emit('takeRoute', {
								"success": false,
								"error": err
							});
						else {

							Vehicle.findOne({
								_id: route.vehicle
							}, function(err, vehicle) {
								if (err) {
									socket.emit('takeRoute', {
										"success": false,
										"error": err
									});

								} else if (route.length < 1) {
									socket.emit('takeRoute', {
										"success": false,
										"error": "no vehicle matching"
									});

								} else {
									route.vehicle = vehicle;
									socket.emit('takeRoute', {
										"success": true,
										"route": route
									});
								}
							});
						}
					});
				}
			}
		});
	});
	// Method : leaveRoute :
	// Allow a passenger to leave a route

	socket.on('leaveRoute', function(data) {
		data = JSON.parse(data);
		name = retrieveName(socket.id);
		// DB request : find a route by ID
		console.log("leave" + data._id);
		Route.findOne({
			_id: data._id
		}, function(err, route) {
			// Send error to the client
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
				console.log(name + " " + route.driver);
				console.log(route);
				if (route.driver == name) {
					var vehicleID = route.vehicle;
					// remove the route
					Route.findOneAndRemove({
						_id: data._id
					}, function(err) {
						// send error to the client
						if (err)
							socket.emit('leaveRoute', {
								"success": false,
								"error": err
							});
						else {
							// DB request : find a vehicle matching the ID
							Vehicle.findOne({
								_id: vehicleID
							}, function(err, vehicle) {
								// send the error to the client
								if (err) {
									console.log("error : Database integrity compromised".error);
									socket.emit('leaveRoute', {
										"success": false,
										"error": err
									});
								} else {
									// update the vehicle
									vehicle.free = true;
									vehicle.loanStart = null;
									vehicle.loanEnd = null;
									// save the vehicle
									vehicle.save(function(err) {
										// send the response to the client
										if (err) {
											console.log("error : Database integrity compromised".error);
											socket.emit('leaveRoute', {
												"success": false,
												"error": err
											});
										} else
											socket.emit('leaveRoute', {
												"success": true,
												"_id": data._id
											});
									});
								}

							});
						}
					});
				} else {

					// Check if the user is in the passenger array
					var happened = false;
					for (var i = 0; i < route.passenger.length; i++) {
						if (route.passenger[i].username == name) {
							route.passenger.splice(i, 1);
							route.freeSeat = route.freeSeat + 1;
							happened = true;
						}
					}
					if (happened) {
						// Save the route
						route.save(function(err) {
							// send response to the client
							if (err)
								socket.emit('leaveRoute', {
									"success": false,
									"error": err
								});
							else {
								socket.emit('leaveRoute', {
									"success": true,
									"_id": data._id
								});
							}
						});
					} else {
						// send error to the client
						socket.emit('leaveRoute', {
							"success": false,
							"error": "no user matching"
						});
					}
				}
			}
		});
	});


	function addMinutes(date, minutes) {
		var response = date.getTime() + minutes * 60000;

		return new Date(response);
	}
};