///////////////////////
// DB MODEL : TICKET //
///////////////////////

/*
	Calling necessary modules
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
/*
	Set up the new shema TicketShema
 */
var TicketSchema = new Schema({
	sender: String,
	receiver: String,
	location: String,
	typeRequest: String,
	content: [{
		closed: {
			type: Boolean,
			default: 0
		},
		importance: Number,
		text: String
	}],

	created_at: Date,
	updated_at: Date
});

/*
	This operations are done before the DB perform a SAVE with this schema
 */
TicketSchema.pre('save',
	function(next) {
		// Save the Date of creation and updates
		var currentDate = new Date();

		this.updated_at = currentDate;
		if (!this.created_at)
			this.created_at = currentDate;
		next();
	}
);
/*
	Save The schema as the model : Ticket
 */
mongoose.model('Ticket', TicketSchema);