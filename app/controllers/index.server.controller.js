///////////////////////////////////
// CONTROLLER OF THE INDEX PAGE  //
///////////////////////////////////

/*
    Method : Render the page Login
 */
exports.renderLogin = function(req, res, next) {
    if (!req.user) {
        res.render('authentication/login', {
            title: 'Log-in Form',
        });
    } else {
        return res.redirect('/');
    }
};

