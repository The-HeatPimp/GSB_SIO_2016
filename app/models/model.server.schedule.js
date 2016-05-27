//////////////////////
// MODEL : SCHEDULE //
//////////////////////

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// schema definition
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
  location: String,
  idRoute: String
});

// save the model
mongoose.model('Schedule', ScheduleSchema);