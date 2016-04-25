////////////////////////
// DB MODEL : SCHEDULE //
////////////////////////

/*
	Calling necessary modules
 */


var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/*
	Set up the new shema TicketShema
 */


var ScheduleSchema = new Schema({
  participant: [{
    username: String,
    participate: {
      type: Boolean,
      default: false
    }
  }],
  date_start: Date,
  date_end: Date,
  title: String,
  description: String,
  creator: String,
  location: String
});




/*
    Save This schema as the model : User
 */
mongoose.model('Schedule', ScheduleSchema);