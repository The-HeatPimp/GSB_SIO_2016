var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var myEvent = require('../controllers/event');

var ChatSchema = new Schema({
	content: String,
	date: Date,
	sender: String,
	receiver: String
});


ChatSchema.pre('save',
	function(next) {
		var currentDate = new Date();
		if (!this.date)
			this.date = currentDate;
		next();
	});
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
mongoose.model('Chat', ChatSchema);