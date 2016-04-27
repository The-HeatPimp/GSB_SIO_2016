var cookies = cookies || {};
cookies.usage = {
	setCookies: function(key, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
		document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
	},

	getCookies: function(key) {
		var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
		return keyValue ? keyValue[2] : null;
	},

	deleteCookies: function(key) {
		document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
};