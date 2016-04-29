(function($) {
	$(document).ready(function() {
		chatReq = {
			nb: 3
		};
		ticketReq = {
			nb: 3
		};

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
			}
		});
		socket.emit('requestLastTicket', JSON.stringify(ticketReq));
		socket.on('requestLastTicket', function(data) {
			if (data.success) {
				if (data.ticket.length > 0) {
					console.log(data);
					for (var i = 0; i < data.ticket.length; i++) {
						$('.ticket-items').append("<li><span class='ticket-from'>" + data.ticket[i].title + "</span><span class='ticket-date'>" + formatDate(data.ticket[i].message.dateMessage) + "</span><span class='ticket-text'>" + data.ticket[i].message.text + "</span></li>");
					}
				} else {
					$('.ticket-items').append("<li class='noMessage'>Vous n'avez reçu aucun message</li>");
				}
			}
		});

		var userInfo = connect.retrieve.userInfo();
		$('#userInfo').html("<span class='deco glyphicon glyphicon-off'></span>" + userInfo.username);
		$("#helpButton").click(function() {
			introJs().start();
		});
		$("#disconnect").click(function() {
			disconnect.close.session();
		});
	});



	formatDate = function(date) {
		var d = new Date(date);
		var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
			d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
		return datestring;
	};
	$.fn.isOverflowWidth = function() {
		return this.each(function() {
			var el = $(this);
			if (el.css("overflow") == "hidden") {
				var text = el.html();
				var t = $(this.cloneNode(true)).hide().css('position', 'absolute').css('overflow', 'visible').width('auto').height(el.height());
				el.after(t);
				return width();
			}

			function width() {
				return t.width() > el.width();
			}
		});
	};


})(jQuery);