(function($) {
	$(document).ready(function() {

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
			} else {
				console.log('failure' + data.error);
			}
		});

		socket.emit('listVehicle');
		socket.on('listVehicle', function(data) {
			if (data.success) {
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

		$('#addUBtnCheck').click(function() {
			
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