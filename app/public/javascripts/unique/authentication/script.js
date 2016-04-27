(function($) {
	$(document).ready(function() {
		var data = {};
		$('#authentication-submit').click(function(e) {
			e.preventDefault();
			data.password = $('#password').val();
			data.username = $('#username').val();
			if(data.password && data.username) {
			$.ajax({
				url: "authenticate",
				method: "post",
				context: document.body,
				data: {
					username: data.username,
					password: data.password
				},
				dataType: "json",
				success: function(response) {
					cookies.usage.setCookies("auth-token", response.token);
					homerequest(response);
				},
				error: function(xhr, error) {
					alert(xhr.status);
					alert(error);
				}
			});
		}
		});

		function homerequest(response) {

			if (response.success === true) {
				window.location.href = "api/home?token=" + response.token;
			} else {
				console.log(response.message);
			}
		}

	});
})(jQuery);