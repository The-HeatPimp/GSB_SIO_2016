var connect = connect || {};
var infoConnection = {
	address : "localhost:3000"
};

connect.retrieve = {
	info: function() {
			return infoConnection;
	}
};