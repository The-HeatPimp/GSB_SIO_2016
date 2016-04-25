///////////////////////
// DB MODEL : TICKET //
///////////////////////

/*
	Calling necessary modules
 */


var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var myEvent = require('../controllers/event');




/*
	Set up the new shema TicketShema
 */


var TicketSchema = new Schema({
  title: {
    type: String
  },
  typeRequest: {
    type: String
  },
  priority: {
    type: Number
  },
  closed: {
    type: Boolean
  },
  created_at: {
    type: Date
  },
  creator: {
    type: String
  },
  message: [{
    text: {
      type: String
    },
    dateMessage: {
      type: Date
    },
    sender: {
      type: String
    },
  }]
});


TicketSchema.pre('save',
  function(next) {
    var currentDate = new Date();
    if (!this.created_at)
      this.created_at = currentDate;
    next();
  });
TicketSchema.post('save',
  function(TicketSchema) {
    console.log('pushing');
    myEvent.emit("pushTicket", {
      id: this._id,
      title: this.title,
      typeRequest: this.typeRequest,
      priority: this.priority,
      created_at: this.created_at,
    });
  });

/*
    Save This schema as the model : User
 */
mongoose.model('Ticket', TicketSchema);