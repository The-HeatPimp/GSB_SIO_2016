/////////////////////////
// DB MODEL : VEHICULE //
/////////////////////////

// TODO no update trajet, bind schedule route
/*
    Calling necessary modules
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
/*
    Set up the new shema TicketShema
 */
var VehicleSchema = new Schema({
	type: String,
	seat: Number,
	Location: String,
	loanStart: Date,
	loanEnd: Date,
	free: Boolean
});

//////////////////////
// DB MODEL : ROUTE //
//////////////////////


/*
    Calling necessary modules
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
/*
    Set up the new shema TicketShema
 */
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

RouteSchema.post('save',
  function(RouteShema) {
    console.log('pushing');
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

mongoose.model('Route', RouteSchema);

mongoose.model('Vehicle', VehicleSchema);