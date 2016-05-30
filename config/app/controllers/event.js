////////////////////////////////
// CONTROLLER : EVENT HANDLER //
////////////////////////////////

// Handle the event fired within the server

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
module.exports = emitter; 