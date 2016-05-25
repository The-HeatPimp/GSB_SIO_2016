//////////////////////////////////
// CONTROLLER OF THE TEST PAGES //
//////////////////////////////////

var User = require('mongoose').model('User');

/*
	Get the List of all users
 */
exports.userList = function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
};

/*
	Check the account you're connected with
 */
exports.check = function(req, res) {
	res.json(req.decoded);
};