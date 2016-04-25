//////////////////////////////////
// EXPRESS MODULE CONFIGURATION //
//////////////////////////////////

/*
    Calling necessary modules
 */
var config = require('./config'),
    env = require('./env/development'),
    express = require('express'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    morgan = require('morgan');



/*
    Adding module's function to the application
 */
module.exports = function() {
    var app = express();
    app.set('superSecret', env.jwtKey); // secret variable

    // Parsing methods
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    app.use(bodyParser.json());

    /*
        Setting up the view engine
     */
    app.set('views', './app/views');
    app.set('view engine', 'ejs');

    /*
        External logs
     */
    var accessLogStream = fs.createWriteStream('./logs/access.log', {
        flags: 'a'
    });
    app.use(morgan('common', {
        stream: accessLogStream
    }));

    /*
        Console logs
     */
    app.use(morgan('dev'));


    /*
        set up the default static route
     */

    app.use(express.static('./app/public'));

    // ---------------------------------------------------------
    // get an instance of the router for api routes
    // ---------------------------------------------------------

    var apiRoutes = express.Router();
    var User = require('mongoose').model('User');

    // ---------------------------------------------------------
    // authentication (no middleware necessary since this isnt authenticated)
    // ---------------------------------------------------------

    app.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }, function(err, user) {

            if (err) throw err;
            //throw error if no users match
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user.username, app.get('superSecret'), {
                        expiresIn: '24h' // expires in 24 hours
                    });
                    // Send the token
                    res.json({
                        success: true,
                        expires: 3600,
                        token: token
                    });
                }

            }

        });
    });

    // ---------------------------------------------------------
    // route middleware to authenticate and check token
    // ---------------------------------------------------------
    apiRoutes.use(function(req, res, next) {

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.params.token || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }

    });

    /*
        Define apiRoutes as the pre middleware for the path /api
     */
    app.use('/api', apiRoutes);

    /*
        call the routers
     */
    require('../app/routes/index.server.routes.js')(app);

    return app;
};