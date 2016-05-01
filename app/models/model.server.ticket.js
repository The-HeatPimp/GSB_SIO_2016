////////////////////
// MODEL : TICKET //
////////////////////

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var myEvent = require('../controllers/event');

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
  updated_at: {
    type: Date
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

// set the property created_at and updated_at before saving the document
TicketSchema.pre('save',
  function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
      this.created_at = currentDate;
    next();
  });

// Push the document to the main web-socket controller
TicketSchema.post('save',
  function(TicketSchema) {
    myEvent.emit("pushTicket", {
      id: this._id,
      title: this.title,
      typeRequest: this.typeRequest,
      priority: this.priority,
      created_at: this.created_at,
      message: this.message
    });
  });

// save the model
mongoose.model('Ticket', TicketSchema);