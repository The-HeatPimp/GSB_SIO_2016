$(function() {
	$("a").attr('href', function(i, h) {
		var token = cookies.usage.getCookies("auth-token");
		return h + (h.indexOf('?') != -1 ? "&token=" + token : "?token=" + token);
	});
});