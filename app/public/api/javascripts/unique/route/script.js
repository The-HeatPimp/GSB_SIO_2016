(function($) {

	$(document).ready(function() {
		function trouver_vehicule() {
			var type = $(".liste").val();

			var data = {};
			data.Type = type;

			data = JSON.stringify(data);

			alert(data);

			// socket.emit(findFreeVehicule, data);
			// socket.on(findFreeVehicule, function (reponse)){

			// }
		}

		function list_route() {
			var destination = $(".to").val();
			var date_depart = $(".date_start").val();
			var tolerance = $(".tolerance").val();

			var data = {};

			data.to = destination;
			data.date_depart = date_depart;
			data.tolerance = tolerance;

			data = JSON.stringify(data);

			alert(data);

			// socket.emit("ListRoute", data);
			// socket.on("ListRoute", function (reponse)){

			// };
		}

		function take_route() {
			alert("Bruh");
		}

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

	});
})(jQuery);