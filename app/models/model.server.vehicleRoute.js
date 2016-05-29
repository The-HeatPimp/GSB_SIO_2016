/////////////////////
// MODEL : VEHICLE //
/////////////////////


var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var myEvent = require('../controllers/event');

// schema definition
var VehicleSchema = new Schema({
	type: String,
	seat: Number,
	Location: {
		type: String,
		default: "Paris"
	},
	loanStart: {
		type: Date,
		default: 0
	},
	loanEnd: {
		type: Date,
		default: 0
	},
	free: {
		type: Boolean,
		default: true
	}
});

///////////////////
// MODEL : ROUTE //
///////////////////

// Schema definition
var RouteSchema = new Schema({
	from: {
		type: String,
		default: "Paris"
	},
	to: String,
	vehicle: {
		type: Schema.Types.ObjectId,
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
			route: this
		});
	});
RouteSchema.pre('remove',
	function(RouteShema) {
		myEvent.emit("pushDelRoute", {
			_id: this._id
		});
	});

// Save the models
mongoose.model('Route', RouteSchema);

mongoose.model('Vehicle', VehicleSchema);