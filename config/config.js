///////////////////////////////
// ENVIRONMENT CONFIGURATION //
///////////////////////////////

/*group all the environment -- exports the chosen one*/
module.exports = require('./env/' + process.env.NODE_ENV + '.js');