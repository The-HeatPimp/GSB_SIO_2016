///////////////////////////////////////////////
// CONTROLLER RELATED TO THE COLLECTION USER //
///////////////////////////////////////////////

/*
    Calling necessary modules and models
 */
var User = require('mongoose').model('User');

/*
    Method : Render the page Register
 */
exports.renderRegister = function(req, res, next) {
    if (!req.user) {
        res.render('authentication/register', {
            title: 'Register Form',
            // Send the flash error message if it exists
        });
    } else {
        return res.redirect('/');
    }
};

/*
    Method : Register the User
 */
exports.register = function(req, res, next) {
    if (!req.user) {
        var user = new User(req.body);
        var message = null;
        // using the local authentication 
        // (Can be changed to tier services such as facebook)
        user.provider = 'local';
        user.save(function(err) {
            //error handling
            if (err) {
                var message = getErrorMessage(err);
                return res.redirect('/register');
            }
            // If the operation in succesfull -> redirection to the index page (with a session ID)
            req.login(user, function(err) {
                if (err)
                    return next(err);

                return res.redirect('/');
            });
        });
    } else {
        return res.redirect('/');
    }
};
/**
 *   SOME BASIC METHOD NOT 
 *   IMPLEMENTED IN THE ROUTE SERVICE
 **/

exports.create = function(req, res, next) {
    var user = new User(req.body);
    user.save(function(err) {
        if (err) {
            return next(err);
        } else {
            res.json(user);
        }
    });
};

exports.list = function(req, res, next) {
    var variable = "Hello world";
    res.json(variable);
    // User.find({}, function(err, users) {
    //     if (err) {
    //         return next(err);
    //     } else {
    //         res.json(users);
    //     }
    // });
};

exports.read = function(req, res) {
    res.json(req.user);
};

exports.userByID = function(req, res, next, id) {
    User.findOne({
            _id: id
        },
        function(err, user) {
            if (err) {
                return next(err);
            } else {
                req.user = user;
                next();
            }
        }
    );
};

exports.update = function(req, res, next) {
    User.findByIdAndUpdate(req.user.id, req.body, function(err, user) {
        if (err) {
            return next(err);
        } else {
            res.json(user);
        }
    });
};

exports.delete = function(req, res, next) {
    req.user.remove(function(err) {
        if (err) {
            return next(err);
        } else {
            res.json(req.user);
        }
    });
};