var connect = connect || {};
var infoConnection = {
	address: "localhost:3000"
};
var infoUser = {
	username: "",
	accessLevel: ""
};

connect.retrieve = {
	info: function() {
		if (infoUser.username !== "")
			return infoConnection;
		else {
			var temp = cookies.usage.getCookies("auth-info");
			infoUser = {
				username: temp.username,
				accessLevel: temp.accessLevel
			};
			return infoUser;
		}

	},
	userInfo: function() {
		if (infoUser.username !== "")
			return infoUser;
		else
			return false;
	}
};

connect.store = {
	userInfo: function(info) {
		infoUser = {
			username: info.username,
			accessLevel: info.accessLevel
		};
		
		cookies.usage.setCookies("auth-info", infoUser);
	}
};