/////////////////////////////////////
// WEBSOCKET CONTROLLER : SCHEDULE //
/////////////////////////////////////

// 

var Schedule = require('mongoose').model('Schedule');
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

	// Method : CreateEvent : 
	// Save an event in the database
	socket.on('createEvent', function(data) {
		name = retrieveName(socket.id);
		// validation process
		data = JSON.parse(data);
		console.log(data);
		var now = new Date();
		var date1 = new Date(data.date_start);
		var date2 = new Date(data.date_end);
		console.log(date1 + " " + date2);
		if (date1 < date2 && date2 > now) {
			var isValid = true;

			// Legit
			if (isValid) {
				// save the event
				var savedEvent = {
					date_start: date1,
					date_end: date2,
					title: data.title,
					description: data.description,
					creator: name,
					location: data.location,
					participant: data.participant || []
				};

				var event = new Schedule(savedEvent);
				event.save(function(err) {
					// send the response to the client
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
			}
			// Not Legit
			else {
				// send the error to the client
				socket.emit('createEvent', {
					"success": false,
					"error": "incomplete request"
				});
			}
		} else
			socket.emit('createEvent', {
				"success": false,
				"error": "bad dates"
			});
	});

	// Method : DeleteEvent :
	// Delete an event if the user is the creator
	socket.on('deleteEvent', function(data) {
		data = JSON.parse(data);
		name = retrieveName(socket.id);
		// DB request : find one event with both the id and the creator matching
		Schedule.findOne({
			_id: data._id
		}, function(err, event) {
			// Send the error to the client
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
			else if (event.creator != name)
				socket.emit('deleteEvent', {
					"success": false,
					"error": "Authorization not granted"
				});
			else if (event.idRoute)
				socket.emit('deleteEvent', {
					"success": false,
					"error": "can't delete a Route event"
				});
			else {
				// remove the event
				event.remove(function(err) {
					// send the reponse to the client
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
	// Method : updateEvent : 
	// update an event with the given parameters
	socket.on('updateEvent', function(data) {
		data = JSON.parse(data);
				name = retrieveName(socket.id);

		// DB request : find One by ID
		var isValid = false;
		Schedule.findOne({
			_id: data._id
		}, function(err, event) {
			// Send the error to the client
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
			else if (event.creator != name)
				socket.emit('updateEvent', {
					"success": false,
					"error": "Authorization not granted"
				});
			else if (event.idRoute)
				socket.emit('updateEvent', {
					"success": false,
					"error": "can't delete a Route event"
				});
			else {
				// Check for wich property to update and update it
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
				if ("participant" in data) {
					event.participant = data.participant;
					isValid = true;
				}
				// If an update occured
				if (isValid) {
					// save the event
					event.save(function(err) {
						// send the response to the client
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
					// If nothing happened : send the error to the client
					socket.emit('updateEvent', {
						"success": false,
						"error": "no changes provided"
					});
				}
			}
		});
	});

	// Method : changeParticipant : 
	// Replace the participant array by the one given in the request
	socket.on('changeParticipant', function(data) {
		data = JSON.parse(data);
		var isValid = true;
		// DB request : find One by Id
		Schedule.findOne({
			_id: data.id
		}, function(err, event) {
			// Send the error to the client
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
				// replace the participants
				event.participant = data.participant;
				// validation process
				for (var prop in event) {
					if (!prop) {
						isValid = false;
					}
				}
				// legit
				if (isValid) {
					// save the event
					event.save(function(err) {
						// send the reponse to the client
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
				}
				// Not legit
				else
				// send the error to the client
					socket.emit('changeParticipant', {
					"success": false,
					"error": "incomplete request"
				});
			}
		});
	});
	// Method : acceptEvent : 
	// A participant confirm he is part of the event
	socket.on('acceptEvent', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		// DB request : Find one event by ID
		Schedule.findOne({
			_id: data.id
		}, function(err, event) {
			// send the error to the client
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
				// search for a matching username in the array
				var happened = false;
				for (var item in event.participant)
					if (item.username == name) {
						item.participate = true;
						happened = true;
					}
					// send error if no match
				if (!happened)
					socket.emit('acceptEvent', {
						"success": false,
						"error": "user is not a participant"
					});
				else
				// save the event
					event.save(function(err) {
					// send the response to the client
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
	// Method DenyEvent :
	// allow the user to deny an invitation to the event
	socket.on('denyEvent', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		// DB request : find an event by ID
		Schedule.findOne({
			_id: data.id
		}, function(err, event) {
			// send the error to the client
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
				// Check if the user is in the participant array
				var happened = false;
				for (var index = 0; index < event.participant.length(); i++)
					if (event.participant[index].username == name) {
						event.participant.splice(index, 1);
						happened = true;
					}
				if (!happened)
				// Send the error to the client
					socket.emit('denyEvent', {
					"success": false,
					"error": "user is not a participant"
				});
				else
				// save the event
					event.save(function(err) {
					// send the response to the client
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
	// Method : ListEvent : 
	// list all the events involving the user
	socket.on('listEvent', function() {
		name = retrieveName(socket.id);
		var currentDate = new Date();
		// DB request : find the events in which the user is involved that haven't already happened
		Schedule.find({
				$or: [{
					"creator": name
				}, {
					"participant.username": name
				}]
			},
			function(err, event) {
				// send the error to the client
				console.log(event);
				if (err)
					socket.emit('listEvent', {
						"success": false,
						"error": err
					});
				else if (event.length < 1)
					socket.emit('listEvent', {
						"success": false,
						"event": []
					});
				else {
					// send the response to the client
					console.log("sent");
					socket.emit('listEvent', {
						"success": true,
						"event": event
					});
				}
			});
	});

	// Method : RequestNextEvent
	// Send the next [number of items] event to the client
	socket.on('requestNextEvent', function(data) {
		name = retrieveName(socket.id);
		data = JSON.parse(data);
		var currentDate = new Date();
		// DB request : find all the event created by the user or in wich the user participate that haven't happened yet. Order it by date ASC
		Schedule.find({
			$and: [{
				$or: [{
					"creator": name
				}, {
					participant: {
						$elemMatch: {
							"username": name,
							"participate": true
						}
					}
				}]
			}, {
				"date_end": {
					$gt: currentDate
				}
			}]
		}).sort({
			date_start: 1
		}).exec(function(err, event) {
			// send the error to the client
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
				// format the response so that it only contains the number of items specified
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
				// send the response to the client
				socket.emit('requestNextEvent', {
					"success": true,
					"event": sentEvent
				});
			}
		});

	});

	// Method : getEvent : 
	// send the event matching the given ID
	socket.on('getEvent', function(data) {
		data = JSON.parse(data);
		console.log("data" + data);
		// DB request : findOne event matching the ID
		Schedule.findOne({
				_id: data._id
			},
			function(err, event) {
				console.log('get : ' + event);
				// send the error to the client
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
					console.log('sent');
				// send the response to the client
				socket.emit('getEvent', {
					"success": true,
					"event": event
				});
			}
		);
	});
};