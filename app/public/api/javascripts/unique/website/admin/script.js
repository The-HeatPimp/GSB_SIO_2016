(function($) {
	$(document).ready(function() {

		var UserAddValidU = false;
		var UserAddValidA = false;

		function setValid(newval, type) {
			switch (type) {
				case 1:
					UserAddValidU = newval;
					break;
				case 2:
					UserAddValidA = newval;
					break;
			}
			if (UserAddValidA && UserAddValidU)
				$('#addUBtnAdd').css("display", "block");
			else
				$('#addUBtnAdd').css("display", "none");
		}

		$('#addVehicle').click(function() {
			var valid = true;
			var request = {
				type: $('#VSelectType option:selected').val(),
				seat: $('#VNbPlace').val()
			};
			for (var item in request) {
				if (typeof item === "undefined")
					valid = false;
			}
			socket.emit("addVehicle", JSON.stringify(request));
		});


		socket.on("addVehicle", function(data) {
			if (data.success) {
				console.log('success' + data.vehicle._id);
				$('#addRes').text("ID du véhicule = " + data.vehicle._id);
				var libre = "";
				if (data.vehicle.free === true)
					libre = "Libre";
				else
					libre = "occupé";
				var optHTML = "<hr>" + data.vehicle._id + "<br/>" + data.vehicle.type + "<br/>" + data.vehicle.seat + "<br/>" + libre;
				$('#VSelect').append(
					$('<option></option').val(data.vehicle._id).html(optHTML)
				);
			} else {
				console.log('failure' + data.error);
			}
		});

		socket.emit('listVehicle');
		socket.on('listVehicle', function(data) {
			if (data.success) {
				console.log(data);
				for (i = 0; i < countObj(data.vehicle); i++) {
					var libre = "";
					if (data.vehicle[i].free === true)
						libre = "Libre";
					else
						libre = "occupé";
					var optHTML = "<hr>" + data.vehicle[i]._id + "<br/>" + data.vehicle[i].type + "<br/>" + data.vehicle[i].seat + "<br/>" + libre;
					$('#VSelect').append(
						$('<option></option').val(data.vehicle[i]._id).html(optHTML)
					);
				}
			} else {
				console.log(data.err);
			}
		});

		socket.emit('listUser');
		socket.on('listUser', function(data) {
			if (data.success) {
				console.log(data);
				var acc;

				for (i = 0; i < countObj(data.users); i++) {
					switch (data.users[i].accessLevel) {
						case 1:
							acc = "utilisateur";
							break;
						case 2:
							acc = "support";
							break;
						case 3:
							acc = "administrateur";
							break;
					}
					var optHTML = "<hr>" + data.users[i].username + "  <br/>  " + acc;
					$('#USelect').append(
						$('<option></option').val(data.users[i]._id).html(optHTML)
					);
				}
			} else {
				console.log(data.err);
			}
		});

		$('#delVehicle').click(function() {
			var request = {
				_id: $('#VSelect option:selected').val()
			};
			console.log(request);
			socket.emit('delVehicle', JSON.stringify(request));
		});
		socket.on('delVehicle', function(data) {
			if (data.success) {

				$("#VSelect option[value='" + data._id + "']").remove();
				$('#delRes').text("succés");
				$('#delVehicle').css("display", "none");
			} else {
				if (data.error.message)
					$('#delRes').text("echec : " + JSON.stringify(data.error.message));
				else
					$('#delRes').text("echec : " + JSON.stringify(data.error));
			}
		});

		$('#delUser').click(function() {
			var request = {
				_id: $('#USelect option:selected').val()
			};

			socket.emit('deleteUser', JSON.stringify(request));
		});

		socket.on('deleteUser', function(data) {
			console.log(data);
			if (data.success) {

				$("#USelect option[value='" + data._id + "']").remove();
				$('#delURes').text("succés");
				$('#delUser').css("display", "none");
			} else {
				if (data.error.message)
					$('#delURes').text("echec : " + JSON.stringify(data.error.message));
				else
					$('#delURes').text("echec : " + JSON.stringify(data.error));
			}
		});

		$('#addUBtnCheck').click(function() {
			socket.emit('findUniqueUsername', $('#addUUsername').val());
			socket.on('findUniqueUsername', function(data) {
				if (data.success) {
					setValid(data.success, 1);
					$('#addUPAdd').text('succes');
				} else {
					setValid(data.success, 1);
					$('#addUPAdd').text(data.error);
				}

			});
		});

		$('.AddU input, #AccessSelect option').change(function() {
			var valid = true;
			$('.AddU input').each(function() {
				if ($(this).val() === "")
					valid = false;
			});

			if ($("#AccessSelect option:selected").val() === "")
				valid = false;

			setValid(valid, 2);
		});

		$('#addUBtnAdd').click(function() {
			var request = {};
			var address = {};
			var item;
			var validRequest = true;

			request.firstName = $('#addUName').val();
			request.lastName = $('#addUSurname').val();
			request.email = $('#addUMail').val();
			request.username = $('#addUUsername').val();
			address.street = $('#addUStreet').val();
			address.zipCode = $('#addUZipCode').val();
			address.city = $('#addUCity').val();
			request.address = address;
			request.tel = $('#addUPhone').val();
			request.password = $('#addUPass').val();
			request.accessLevel = $('#AccessSelect option:selected').val();

			for (item in request) {
				if (typeof item === "undefined" || item.trim() === "" || !item)
					validRequest = false;
			}
			for (item in request) {
				if (typeof item === "undefined" || item.trim() === "" || !item)
					validRequest = false;
			}
			if (validRequest) {
				socket.emit("createUser", JSON.stringify(request));
			}

		});

		socket.on("createUser", function(data) {
			if (data.success) {
				console.log(data);
				$('#addUUsername').val('');
				$('#addUPAdd').text('');
				setValid(false, 1);
				var acc;


				switch (data.user.accessLevel) {
					case 1:
						acc = "utilisateur";
						break;
					case 2:
						acc = "support";
						break;
					case 3:
						acc = "administrateur";
						break;
				}
				var optHTML = "<hr>" + data.user.username + "  <br/>  " + acc;
				$('#USelect').append(
					$('<option></option').val(data.user._id).html(optHTML)
				);
			}
		});


		countObj = function(obj) {
			var count = 0;
			for (var k in obj) {
				// if the object has this property and it isn't a property
				// further up the prototype chain
				if (obj.hasOwnProperty(k)) count++;
			}
			return count;
		};


	});
})(jQuery);