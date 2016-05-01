////////////////
// MODEL USER //
////////////////

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');
	validator = require('validator');
	
// Schema definition
var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	accessLevel: Number,
	email: String,
	username: {
		type: String,
		unique: true,
		trim: true
	},
	address: [{
		street: String,
		zipCode: String,
		city: String
	}],
	tel: String,
	created_at: Date,
	updated_at: Date,
	password: String
});

// Operation before saving the document
UserSchema.pre('save',
	function(next) {
		// Hash the password before sending it to the database
		if (this.password) {
			var md5 = crypto.createHash('md5');
			this.password = md5.update(this.password).digest('hex');
		}
		// Save the Date of creation and updates
		var currentDate = new Date();
		this.updated_at = currentDate;
		if (!this.created_at)
			this.created_at = currentDate;

		next();
	});
// Model method : find a unique username
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	// catch the request prefix
	var _this = this;
	// set possibleUsername 
	// Can take the value of every username in the DB
	var possibleUsername = username + (suffix || '');

	_this.findOne({
			username: possibleUsername
		},
		function(err, user) {
			if (!err) {
				if (!user) {
					// Return the possible Username
					callback(possibleUsername);
				} else {
					// Loop the method and search for a possible username with a suffix
					return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
				}
			} else {
				// return nothing if there are missing parameters
				callback(null);
			}
		}
	);
};
// Save the model
mongoose.model('User', UserSchema);