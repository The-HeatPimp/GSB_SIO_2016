$(function() {
	$("a").attr('href', function(i, h) {
		var token = cookies.usage.getCookies("auth-token");
		return h + (h.indexOf('?') != -1 ? "&token=" + token : "?token=" + token);
	});
	var userInfo = connect.retrieve.userInfo();

	// display the user name in the navigation bar

	$('#userInfo').html("<i class='fa fa-power-off' aria-hidden='true'></i>" + userInfo.username);

	// tutorial for the user

	$("#helpButton").click(function() {
		introJs().start();
	});

	$("#disconnect").click(function() {
		disconnect.close.session();
	});
	window.addEventListener('load', function() {
		// Premièrement, vérifions que nous avons la permission de publier des notifications. Si ce n'est pas le cas, demandons la
		if (window.Notification && Notification.permission !== "granted") {
			Notification.requestPermission(function(status) {
				if (Notification.permission !== status) {
					Notification.permission = status;
				}
			});
		}

		var button = document.getElementsByTagName('button')[0];

		button.addEventListener('click', function() {
			// Si l'utilisateur accepte d'être notifié
			if (window.Notification && Notification.permission === "granted") {
				var n = new Notification("Coucou !");
			}

			// Si l'utilisateur n'a pas choisi s'il accepte d'être notifié
			// Note: à cause de Chrome, nous ne sommes pas certains que la propriété permission soit définie, par conséquent il n'est pas sûr de vérifier la valeur par défaut.
			else if (window.Notification && Notification.permission !== "denied") {
				Notification.requestPermission(function(status) {
					if (Notification.permission !== status) {
						Notification.permission = status;
					}

					// Si l'utilisateur est OK
					if (status === "granted") {
						var n = new Notification("Salut!");
						n.onshow = function() {
							setTimeout(n.close.bind(n), 5000);
						};
					}

					// Sinon, revenons en à un mode d'alerte classique
					else {
						alert("Coucou !");
					}
				});
			}

			// Si l'utilisateur refuse d'être notifié
			else {
				// We can fallback to a regular modal alert
				alert("Coucou !");
			}
		});
	});
	var notification;
	socket.on('receiveMessage', function(data) {
		if (window.location.pathname != '/api/chat') {
			var option = {
			tag: "<button>Notify me!</button>",
			body: data.content
			};
			notification = new Notification(data.sender + " vous a envoyé un message", option);
		}
	});



			// notification.onclick = - >
			// 	notification.close()
			// # # chrome only
			// # # If the window is minimized,
			// restore the size of the window
			// window.open().close()
			// window.focus()
			// n.onshow = function() {
			// 	setTimeout(n.close.bind(n), 5000);
			// };

});