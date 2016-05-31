(function($) {
	$(document).ready(function() {
		chatReq = {
			nb: 3
		};
		ticketReq = {
			nb: 3
		};
		eventReq = {
			nb: 3
		};

		// Insight of the last messages received

		socket.emit('requestLastMessage', JSON.stringify(chatReq));
		socket.on('requestLastMessage', function(data) {
			if (data.success) {
				if (data.message.length > 0) {
					for (var i = 0; i < data.message.length; i++) {
						$('.chat-items').append("<li><span class='chat-from'>" + data.message[i].sender + "</span><span class='chat-date'>" + formatDate(data.message[i].date) + "</span><span class='chat-text'>" + data.message[i].content + "</span></li>");
					}
				} else {
					$('.chat-items').append("<li class='noMessage'>Vous n'avez reçu aucun message</li>");
				}
			} else {
					$('.chat-items').append("<li class='noMessage'>Erreur</li>");
				}
		});

		// Insight of the last answers of ticket received

		socket.emit('requestLastTicket', JSON.stringify(ticketReq));
		socket.on('requestLastTicket', function(data) {
			if (data.success) {
				if (data.ticket.length > 0) {
					for (var i = 0; i < data.ticket.length; i++) {
						$('.ticket-items').append("<li><span class='ticket-from'>" + data.ticket[i].title + "</span><span class='ticket-date'>" + formatDate(data.ticket[i].message.dateMessage) + "</span><span class='ticket-text'>" + data.ticket[i].message.text + "</span></li>");
					}
				} else {
					$('.ticket-items').append("<li class='noMessage'>Vous n'avez reçu aucun message</li>");
				}
			}
		});

		// Insight of the next Event of the user

		socket.emit('requestNextEvent', JSON.stringify(eventReq));
		socket.on('requestNextEvent', function(data) {
			if (data.success) {
				if (data.event.length > 0) {
					for (var i = 0; i < data.event.length; i++) {
						$('.event-items').append("<div class='col-sm-4 col-md-4 col-xs-12 limit-col'><div class='thumbnail'><h2>" + data.event[i].title + "</h2> <p class = 'dateEvent'> " + formatDate(data.event[i].date_start) + " </p><p class = 'locationEvent'> " + data.event[i].location + " </p> </div> </div>");
					}
				} else {
					$('.event-items').append("<div class='col-sm-12 limit-col'><div class='thumbnail noMessage'>Vous n'avez reçu aucun message</div></div>");
				}
			}
		});


		// format a date object to a pretty date String

		formatDate = function(date) {
			var d = new Date(date);
			var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
				d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
			return datestring;
		};
	});
})(jQuery);