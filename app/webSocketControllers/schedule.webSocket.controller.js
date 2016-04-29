	var Schedule = require('mongoose').model('Schedule');
	var myEvent = require('../controllers/event');


	module.exports = function(socket) {

		myEvent.on('pushRoute', function(data) {
			var isValid = true;
			console.log(data);
			var savedEvent = {};
			tomorrow.setDate(dateStart + 1);
			savedEvent = {
				participant: data.passenger,
				date_start: data.dateStart,
				date_end: data.tomorrow,
				title: "Location d'un véhicule",
				description: "trajet vers" + data.to,
				creator: data.driver,
				location: data.to
			};
			participant.push(data.driver);
			for (var prop in savedEvent) {
				if (!prop) {
					isValid = false;
				}
			}
			if (isValid) {
				var event = new Schedule(savedEvent);
				event.save(function(err) {
					if (err) {
						socket.emit('createRouteEvent', {
							"success": false,
							"error": err
						});

					} else {
						socket.emit('createRouteEvent', {
							"success": true,
							"event": event
						});
					}

				});
			} else {
				console.log("Event not saved");
				socket.emit('createRouteEvent', {
					"success": false,
					"error": "incomplete request"
				});
			}
		});

		socket.on('createEvent', function(data) {
			var isValid = true;
			console.log(data);
			data = JSON.parse(data);
			var savedEvent = {};
			savedEvent = {
				participant: data.participant,
				date_start: data.date_start,
				date_end: data.date_end,
				title: data.title,
				description: data.description,
				creator: socket.decoded_token,
				location: data.location
			};
			for (var prop in savedEvent) {
				if (!prop) {
					isValid = false;
				}
			}
			if (isValid) {
				var event = new Schedule(savedEvent);
				event.save(function(err) {
					if (err) {
						socket.emit('createEvent', {
							"success": false,
							"error": err
						});

					} else {
						socket.emit('createEvent', {
							"success": true,
							"event": event
						});
					}

				});
			} else {
				console.log("Event not saved");
				socket.emit('createEvent', {
					"success": false,
					"error": "incomplete request"
				});
			}
		});

		socket.on('deleteEvent', function(data) {
			Schedule.findOne({
				$and: [{
					_id: data.id
				}, {
					"creator": socket.decoded_token
				}]
			}, function(err, event) {
				if (err)
					socket.emit('deleteEvent', {
						"success": false,
						"error": err
					});
				else if (!event)
					socket.emit('deleteEvent', {
						"success": false,
						"error": "no event found in database"
					});
				else {
					event.remove(function(err) {
						if (err)
							socket.emit('deleteEvent', {
								"success": false,
								"error": err
							});
						else
							socket.emit('deleteEvent', {
								"success": true,
							});
					});
				}
			});
		});

		socket.on('updateEvent', function(data) {
			data = JSON.parse(data);
			var isValid = false;
			Schedule.find({
				_id: data.id
			}, function(err, event) {
				if (err)
					socket.emit('updateEvent', {
						"success": false,
						"error": err
					});
				else if (!event)
					socket.emit('updateEvent', {
						"success": false,
						"error": "no event found in database"
					});
				else {

					if ("date_start" in data) {
						event.date_start = data.date_start;
						isValid = true;
					}
					if ("date_end" in data) {
						event.date_end = data.date_end;
						isValid = true;
					}
					if ("title" in data) {
						event.title = data.title;
						isValid = true;
					}
					if ("location" in data) {
						event.location = data.location;
						isValid = true;
					}
					if ("description" in data) {
						event.description = data.description;
						isValid = true;
					}
					if (isValid) {
						event.save(function(err) {
							if (err)
								socket.emit('updateEvent', {
									"success": false,
									"error": err
								});
							else
								socket.emit('updateEvent', {
									"success": true,
									"event": event
								});

						});
					} else {
						socket.emit('updateEvent', {
							"success": false,
							"error": "no changes provided"
						});
					}
				}
			});
		});
		socket.on('changeParticipant', function(data) {
			data = JSON.parse(data);
			var isValid = true;
			Schedule.find({
				_id: data.id
			}, function(err, event) {
				if (err)
					socket.emit('changeParticipant', {
						"success": false,
						"error": err
					});
				else if (!event)
					socket.emit('changeParticipant', {
						"success": false,
						"error": "no event found in database"
					});
				else {
					event.participate = data.participate;
					for (var prop in event) {
						if (!prop) {
							isValid = false;
						}
					}
					if (isValid) {
						event.save(function(err) {
							if (err)
								socket.emit('updateEvent', {
									"success": false,
									"error": err
								});
							else
								socket.emit('updateEvent', {
									"success": true,
									"event": event
								});
						});
					} else
						socket.emit('changeParticipant', {
							"success": false,
							"error": "incomplete request"
						});
				}
			});
		});

		socket.on('acceptEvent', function(data) {
			data = JSON.parse(data);
			Schedule.find({
				_id: data.id
			}, function(err, event) {
				if (err)
					socket.emit('acceptEvent', {
						"success": false,
						"error": err
					});
				else if (!event)
					socket.emit('acceptEvent', {
						"success": false,
						"error": "no event found in database"
					});
				else {
					var happened = false;
					for (var item in event.participant)
						if (item.username == socket.decoded_token) {
							item.participate = true;
							happened = true;
						}
					if (!happened)
						socket.emit('acceptEvent', {
							"success": false,
							"error": "user is not a participant"
						});
					else
						event.save(function(err) {
							if (err)
								socket.emit('acceptEvent', {
									"success": false,
									"error": err
								});
							else
								socket.emit('acceptEvent', {
									"success": true
								});
						});
				}
			});
		});

		socket.on('denyEvent', function(data) {
			data = JSON.parse(data);
			Schedule.find({
				_id: data.id
			}, function(err, event) {
				if (err)
					socket.emit('denyEvent', {
						"success": false,
						"error": err
					});
				else if (!event)
					socket.emit('denyEvent', {
						"success": false,
						"error": "no event found in database"
					});
				else {
					var happened = false;
					for (var index = 0; index < event.participant.length(); i++)
						if (event.participant[index].username == socket.decoded_token) {
							event.participant.splice(index, 1);
							happened = true;
						}
					if (!happened)
						socket.emit('denyEvent', {
							"success": false,
							"error": "user is not a participant"
						});
					else
						event.save(function(err) {
							if (err)
								socket.emit('denyEvent', {
									"success": false,
									"error": err
								});
							else
								socket.emit('denyEvent', {
									"success": true
								});
						});
				}
			});
		});

		socket.on('listEvent', function(data) {
			data = JSON.parse(data);
			var currentDate = new Date();
			Schedule.find({
					$and: [{
						$or: [{
							"creator": socket.decoded_token
						}, {
							"participant.username": socket.decoded_token
						}]
					}, {
						"date_end": {
							$gt: currentDate
						}
					}]
				},
				function(err, event) {

					if (err)
						socket.emit('listEvent', {
							"success": false,
							"error": err
						});
					else if (!event)
						socket.emit('listEvent', {
							"success": false,
							"error": "no event found in database"
						});
					else {
						sentEvent = [];
						for (var i = 0; i < event.length; i++) {
							sentEvent.push({
								title: event[i].title,
								date_start: event[i].date_start,
								date_end: event[i].date_end,
								_id: event[i]._id,
								location: event[i].location
							});
						}
						socket.emit('listEvent', {
							"success": true,
							"event": sentEvent
						});
					}
				});
		});

		socket.on('requestNextEvent', function(data) {
			data = JSON.parse(data);
			var currentDate = new Date();
			Schedule.find({
				$and: [{
					$or: [{
						"creator": socket.decoded_token
					}, {
						"participant.username": socket.decoded_token
					}]
				}, {
					"date_end": {
						$gt: currentDate
					}
				}]
			}).sort({
				date_start: -1
			}).exec(function(err, event) {
				if (err)
					socket.emit('requestNextEvent', {
						"success": false,
						"error": err
					});
				else if (!event)
					socket.emit('requestNextEvent', {
						"success": false,
						"error": "no event found in database"
					});
				else {
					sentEvent = [];
					for (var i = 0; i < data.nb; i++) {
						if (!event[i])
							break;
						sentEvent.push({
							title: event[i].title,
							date_start: event[i].date_start,
							location: event[i].location
						});
					}
					socket.emit('requestNextEvent', {
						"success": true,
						"event": sentEvent
					});
				}
			});

		});

		socket.on('getEvent', function(data) {
			data = JSON.parse(data);
			Schedule.findOne({
					_id: data.id
				},
				function(err, event) {
					if (err)
						socket.emit('getEvent', {
							"success": false,
							"error": err
						});
					else if (!event)
						socket.emit('getEvent', {
							"success": false,
							"error": "no event found in database"
						});
					else
						socket.emit('getEvent', {
							"success": true,
							"ticket": event
						});
				}
			);
		});
	};