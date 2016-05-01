/////////////////////
// MODEL : VEHICLE //
/////////////////////


var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// schema definition
var VehicleSchema = new Schema({
	type: String,
	seat: Number,
	Location: String,
	loanStart: Date,
	loanEnd: Date,
	free: Boolean
});

///////////////////
// MODEL : ROUTE //
///////////////////

// Schema definition
var RouteSchema = new Schema({
	to: String,
	vehicle: {
		type: Number,
		ref: 'Vehicle'
	},
	dateStart: Date,
	freeSeat: Number,
	dateEnd: Date,
	driver: String,
	passenger: [{
		username: String
	}]

});

// Push the document to the main web-socket controller
RouteSchema.post('save',
  function(RouteShema) {
    myEvent.emit("pushRoute", {
      id: this._id,
      to: this.to,
      vehicule: this.vehicule,
      dateStart: this.dateStart,
      created_at: this.created_at,
      driver: this.driver,
      passenger: this.passenger
    });
  });

// Save the models
mongoose.model('Route', RouteSchema);

mongoose.model('Vehicle', VehicleSchema);