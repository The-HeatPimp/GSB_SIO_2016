(function($) {
	$(document).ready(function() {

		var userT;
		var userInfo = connect.retrieve.userInfo();
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

		$('#closeModal').on('show.bs.modal', function(event) {
			selectedTicket = event.relatedTarget;
			selectedTicket = $(selectedTicket).parent('li').attr('value');
			console.log(selectedTicket);
		});

		$('#closeT').click(function() {
			var request = {
				_id: selectedTicket
			};
			console.log(request);
			socket.emit('closeTicket', JSON.stringify(request));
		});

		socket.on('closeTicket', function(data) {
			console.log(data);
			if (data.success) {
				$('#confClose').text("succes");
				var elem = $("ul").find("[value='" + data._id + "']").each(function(index) {
					if(index<1)
						$(this).find('button').remove();
					$(this).addClass(classClosed(true));
				});



			} else {
				$('#confClose').text("echec");
			}
		});
		socket.emit('listTicketAdmin');
		socket.on('listTicketAdmin', function(data) {

			if (data.success) {
				if (data.ticket.length > 0) {

					console.log(data);
					for (var i = 0; i < data.ticket.length; i++) {
						var MLength = data.ticket[i].message.length - 1;
						var list = document.getElementById('listTicket');
						var priority;
						switch (data.ticket[i].priority) {
							case 1:
								priority = "Peu important";
								break;
							case 2:
								priority = "Important";
								break;
							case 3:
								priority = "Tres important";
								break;
						}
						var listClosed = document.getElementById('listTicketC');
						var j;

						if (!data.ticket[i].closed) {

							list.innerHTML = list.innerHTML + "<li value='" + data.ticket[i]._id + "' class='typed " + classClosed(data.ticket[i].closed) + "'><span class='chat-date'>" + priority + "</span><span class='chat-date'>" + formatDate(data.ticket[i].message[MLength].dateMessage) + "</span><span> " + data.ticket[i].typeRequest + "</span><span class='chat-from'>" + data.ticket[i].title + "</span><button type=\"button\" data-toggle='modal' data-target='#addTModal' class='answerTTicket'>Répondre au ticket</button><button type=\"button\" class=\"btn btn-info delMessage\" data-toggle=\"modal\" data-target=\"#closeModal\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button></li>";
							for (j = 0; j <= MLength; j++) {

								if (data.ticket[i].message[j].sender == userInfo.username)
									userT = "moi";
								else
									userT = data.ticket[i].message[j].sender;
								list.innerHTML = list.innerHTML + "<li value='" + data.ticket[i]._id + "' class='typed lvl2 " + classClosed(data.ticket[i].closed) + "'><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + priority + "</span><span class='chat-date'>" + formatDate(data.ticket[i].message[j].dateMessage) + "</span><span> " + data.ticket[i].message[j].text + "</li>";
							}
						} else {
							$('#displayClosed').css("display", "block");
							listClosed.innerHTML = listClosed.innerHTML + "<li value='" + data.ticket[i]._id + "' class='typed " + classClosed(data.ticket[i].closed) + "'><span class='chat-date'>" + priority + "</span><span class='chat-date'>" + formatDate(data.ticket[i].message[MLength].dateMessage) + "</span><span> " + data.ticket[i].typeRequest + "</span><span class='chat-from'>" + data.ticket[i].title + "</span></li>";
							for (j = 0; j <= MLength; j++) {

								if (data.ticket[i].message[j].sender == userInfo.username)
									userT = "moi";
								else
									userT = data.ticket[i].message[j].sender;
								listClosed.innerHTML = listClosed.innerHTML + "<li value='" + data.ticket[i]._id + "' class='typed lvl2 " + classClosed(data.ticket[i].closed) + "'><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + formatDate(data.ticket[i].message[j].dateMessage) + "</span><span> " + data.ticket[i].message[j].text + "</li>";
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
			var request = {
				_id: selectedTicket,
				text: $('#textA').val()
			};
			console.log(request);
			socket.emit('answerToTicket', JSON.stringify(request));
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
				$(el).after("<li value='" + data.parent + "' class='typed lvl2 " + classClosed(data.ticket[i].closed) + "'><span class='chat-from'>" + userT + "</span><span class='chat-date'>" + formatDate(data.message) + "</span><span> " + data.text + "</li>");
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