/////////////////////////
// MODEL : CHAT SYSTEM //
/////////////////////////

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var myEvent = require('../controllers/event');

// schema definition
var ChatSchema = new Schema({
	content: String,
	date: Date,
	sender: String,
	receiver: String
});

// set the property date before saving the document
ChatSchema.pre('save',
	function(next) {
		var currentDate = new Date();
		if (!this.date)
			this.date = currentDate;
		next();
	});

// Push the document to the main web-socket controller
ChatSchema.post('save',
	function(ChatSchema) {
		myEvent.emit("pushChat", {
			id: this._id,
			content: this.content,
			date: this.date,
			sender: this.sender,
			receiver: this.receiver
		});
	});
// save the model
mongoose.model('Chat', ChatSchema);