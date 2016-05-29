(function($) {

	$(document).ready(function() {
		var selectedRoute;
		var nowTemp = new Date();
		var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

		$('#dp3').datepicker({
			onRender: function(date) {
				return date.valueOf() < now.valueOf() ? 'disabled' : '';
			}
		});

		$('#dp3R').datepicker({
			onRender: function(date) {
				return date.valueOf() < now.valueOf() ? 'disabled' : '';
			}
		});

		$('#openFindS').click(function() {
			var destination = $(".to").val();
			var date_depart = $("#dateT").val();
			var time_depart = $("#timeT").val();
			var transform = date_depart.split(/\D/);
			date_depart = transform[2] + "-" + transform[1] + "-" + transform[0];
			var date_end = $("#dateTR").val();
			transform = date_end.split(/\D/);
			date_end = transform[2] + "-" + transform[1] + "-" + transform[0];
			var time_end = $("#timeTR").val();
			var tolerance = $(".tolerance").val();
			var data = {};
			var s = date_depart + " " + time_depart;
			var bits = s.split(/\D/);
			var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4], bits[5]);
			data.dateStart = date;
			s = date_end + " " + time_end;
			bits = s.split(/\D/);
			var date2 = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4], bits[5]);
			data.dateEnd = date2;
			data.to = destination;
			data.tolerance = tolerance;
			console.log(data.dateStart + data.dateEnd);
			data = JSON.stringify(data);
			socket.emit('findSimilarRoute', data);
		});

		socket.on('findSimilarRoute', function(data) {
			console.log(data);
			console.log(data);
			if (data.success === true) {
				$('#infoRoute').text("Des trajets ont été trouvés");
				for (var i = 0; i < data.route.length; i++) {
					$('#foundRoute').prepend("<li value='" + data.route[i]._id + "' class=\"typed\" ><span class='chat-from'>" + formatDate(data.route[i].dateStart) + "</span><span class='chat-date'>" + formatDate(data.route[i].dateEnd) + "</span><span class='chat-text'>" + data.route[i].to + "</span><button type=\"button\" class=\"btn btn-info acceptRoute\" > Accepter le covoiturage </button></li>");
				}
			} else
				$('#foundRoute').text("Aucun trajet n'a été trouvé");
		});

		function take_route() {
			alert("Bruh");
		}
		$('#foundRoute').on('click', '.acceptRoute', function(e) {
			var rep = {
				_id: $(this).parent('li').attr('value')
			};
			console.log(rep);
			socket.emit("takeRoute", JSON.stringify(rep));
		});
		socket.on("takeRoute", function(data) {
			if (data.success) {
				console.log(data);
				var isDriver;
				if (data.route[i].driver == userInfo.username) {
					isDriver = "Conducteur";
				} else {
					isDriver = "passager";
				}
				alert('Trajet réservé avec succés');
				$('.event-items').append("<div class='col-sm-4 col-md-4 col-xs-12 limit-col'><div class='thumbnail'><h2>" + data.route.to + "</h2> <p> " + formatDate(data.route.dateStart) + " </p><p> " + formatDate(data.route.dateEnd) + " </p><p> " + isDriver + "</p> </div> </div>");
			} else {
				alert('erreur lors de la reservation : ' + data.error);
			}
		});
		socket.emit("listRoute");
		socket.on("listRoute", function(data) {
			var userInfo = connect.retrieve.userInfo();
			console.log(data);
			for (var i = 0; i < data.route.length; i++) {
				var isDriver;
				if (data.route.driver == userInfo.username) {
					isDriver = "Conducteur";
				} else {
					isDriver = "passager";
				}
				$('.event-items').append("<div class='col-sm-4 col-md-4 col-xs-12 limit-col'><div value='" + JSON.stringify({
					id: data.route[i]._id,
					driver: data.route[i].driver
				}) + "' class='thumbnail'><h2>" + data.route[i].to + "</h2> <p> " + formatDate(data.route[i].dateStart) + " </p><p> " + formatDate(data.route[i].dateEnd) + " </p><p> " + isDriver + " </p><button type=\"button\" class='leaveRoute' data-toggle='modal' data-target='#leaveRModal' ><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button> </div> </div>");
			}

		});
		$('#leaveRModal').on('show.bs.modal', function(event) {
			selectedRoute = event.relatedTarget;
			selectedRoute = JSON.parse($(selectedRoute).parent('div').attr('value'));
			console.log(selectedRoute);
		});


		$('#leaveRoute').click(function() {
			var request = {
				_id: selectedRoute.id
			};

			if (selectedRoute.driver !== userInfo.username) {
				socket.emit("leaveRoute", JSON.stringify(request));
				console.log("leave");
			} else {
				console.log("delete");
				socket.emit("deleteMyRoute", JSON.stringify(request));
			}
		});
		socket.on("leaveRoute", function(data) {
			console.log(data);
		});

		socket.on("deleteMyRoute", function(data) {
			console.log(data);
		});

		function create_route() {
			var destination = $(".destination").val();
			var date_retour = $(".dr").val();
			var date_depart = $(".dd").val();
			var type = $(".liste").val();
			var data = {};
			data.to = destination;
			data.DateStart = date_depart;
			data.DateEnd = date_retour;
			data.Type = type;
			// data.VehiculeId = idvehicule;

			data = JSON.stringify(data);

			alert(data);
		}
		formatDate = function(date) {
			var d = new Date(date);
			var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
				d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
			return datestring;
		};
	});
})(jQuery);