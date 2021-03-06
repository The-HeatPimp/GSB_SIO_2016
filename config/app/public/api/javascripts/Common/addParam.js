$(function() {
	$("a").attr('href', function(i, h) {
		var token = cookies.usage.getCookies("auth-token");
		return h + (h.indexOf('?') != -1 ? "&token=" + token : "?token=" + token);
	});
	var userInfo = connect.retrieve.userInfo();

	// display the user name in the navigation bar

	$('#userInfo').html("<i class='fa fa-power-off' aria-hidden='true'></i>"
 + userInfo.username);

	// tutorial for the user

	$("#helpButton").click(function() {
		introJs().start();
	});

	$("#disconnect").click(function() {
		disconnect.close.session();
	});	
});