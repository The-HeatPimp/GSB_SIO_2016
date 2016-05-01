var disconnect = disconnect || {};

disconnect.close = {
	session : function() {
			cookies.usage.deleteCookies("auth-token");
			window.location.href = "/";
	}
};