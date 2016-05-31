(function($) {
	$(document).ready(function() {

		var userT;
		var userInfo = connect.retrieve.userInfo();
		setValid(false);

		function setValid(newval) {
			$("#boutn").prop("disabled", !newval);
		}
		// $(".answerTTicket").click(function() {
		// 	console.log("log");
		// 	// selectedTicket = $(this).parent().find('li').value();
		// 	// console.log(selectedTicket);
		// });
		$('#addTModal').on('show.bs.modal', function(event) {
			selectedTicket = event.relatedTarget;
			selectedTicket = $(selectedTicket).parent('li').attr('value');
			console.log(selectedTicket);
		});

		$('#boutn').click(function() {

			var type = $("#choix").val();
			var titre = $("#tt").val();
			var desc = $("#description").val();
			var etat = $(".select_etat_ticket").val();
			var request = {};
			validRequest = true;
			request.title = titre;
			request.typeRequest = type;
			request.priority = etat;
			request.message = desc;


			for (var item in request) {
				if (typeof item === "undefined" || item.trim() === "" || !item)
					validRequest = false;
			}
			console.log(request);
			if (validRequest)
				socket.emit('createTicket', JSON.stringify(request));
		});

		socket.on('createTicket', function(data) {
			console.log(data);
			if (data.success) {
				if (data.ticket.message[0].sender == userInfo.username)
					userT = "moi";
				else
					userT = data.ticket.message[0].sender;


				$('#listTicket').append("<li class='typed " + classClosed(data.ticket.closed) + "'><span class='chat-date'>" + formatDate(data.ticket.message[0].dateMessage) + "</span><span> " + data.ticket.typeRequest + "</span><span class='chat-from'>" + data.ticket.title + "</span><button type=\"button\" data-toggle='modal' data-target='#addTModal' class='answerTTicket'>Répondre au ticket</button></li>");
				$('#listTicket').append("<li value='" + data.ticket._id + "' class='typed lvl2 " + classClosed(data.ticket.closed) + "'><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + formatDate(data.ticket.message[0].dateMessage) + "</span><span> " + data.ticket.message[0].text + "</li>");


			}
		});

		$('input, #select_etat_ticket option, #choix option').change(function() {
			var valid = true;
			$('input').each(function() {
				if ($(this).val() === "")
					valid = false;
			});

			if ($("#select_etat_ticket option:selected").val() === "")
				valid = false;
			setValid(valid);
		});

		socket.emit('listTicketUser');
		socket.on('listTicketUser', function(data) {

			if (data.success) {
				if (data.ticket.length > 0) {

					console.log(data);
					for (var i = 0; i < data.ticket.length; i++) {
						var MLength = data.ticket[i].message.length - 1;
						var list = document.getElementById('listTicket');
						var listClosed = document.getElementById('listTicketC');
						var j;

						if (!data.ticket[i].closed) {

							list.innerHTML = list.innerHTML + "<li value='" + data.ticket[i]._id + "' class='typed " + classClosed(data.ticket[i].closed) + "'><span class='chat-date'>" + formatDate(data.ticket[i].message[MLength].dateMessage) + "</span><span> " + data.ticket[i].typeRequest + "</span><span class='chat-from'>" + data.ticket[i].title + "</span><button type=\"button\" data-toggle='modal' data-target='#addTModal' class='answerTTicket'>Répondre au ticket</button></li>";
							for (j = 0; j <= MLength; j++) {

								if (data.ticket[i].message[j].sender == userInfo.username)
									userT = "moi";
								else
									userT = data.ticket[i].message[j].sender;
								list.innerHTML = list.innerHTML + "<li class='typed lvl2 " + classClosed(data.ticket[i].closed) + "'><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + formatDate(data.ticket[i].message[j].dateMessage) + "</span><span> " + data.ticket[i].message[j].text + "</li>";
							}
						} else {
							$('#displayClosed').css("display", "block");
							listClosed.innerHTML = listClosed.innerHTML + "<li value='" + data.ticket[i]._id + "' class='typed " + classClosed(data.ticket[i].closed) + "'><span class='chat-date'>" + formatDate(data.ticket[i].message[MLength].dateMessage) + "</span><span> " + data.ticket[i].typeRequest + "</span><span class='chat-from'>" + data.ticket[i].title + "</span></li>";
							for (j = 0; j <= MLength; j++) {

								if (data.ticket[i].message[j].sender == userInfo.username)
									userT = "moi";
								else
									userT = data.ticket[i].message[j].sender;
								listClosed.innerHTML = listClosed.innerHTML + "<li class='typed lvl2 " + classClosed(data.ticket[i].closed) + "'><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + formatDate(data.ticket[i].message[j].dateMessage) + "</span><span> " + data.ticket[i].message[j].text + "</li>";
							}
						}
					}

				} else {
					console.log("no ticket");
				}
			} else
				console.log(data.error);
		});

		$('#sendTextA').click(function() {
			if ($('#textA').val() && $('#textA').val() !== "") {
				var request = {
					_id: selectedTicket,
					text: $('#textA').val()
				};
				console.log(request);
				socket.emit('answerToTicket', JSON.stringify(request));
			}
		});

		socket.on('answerToTicket', function(data) {
			console.log(data);
			if (data.success) {
				$('#confSend').text("succes");
				if (data.sender == userInfo.username)
					userT = "moi";
				else
					userT = data.sender;

				var el = $(".typed").find("[value='" + data.parent + "']");
				$(el).after("<li value='" + data.parent + "' class='typed lvl2 '><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + formatDate(data.message) + "</span><span> " + data.text + "</li>");
			} else
				$('#confSend').text("echec");
		});

		formatDate = function(date) {
			var d = new Date(date);
			var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
				d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
			return datestring;
		};
		classClosed = function(bool) {
			if (bool)
				return "closedT";
			else
				return "openedT";
		};
	});

})(jQuery);