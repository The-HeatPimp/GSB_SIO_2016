/////////////////////////////////////////////
// CONTROLLER : UNPROTECTED PAGE RENDERING //
/////////////////////////////////////////////

// Render the login page
exports.renderLogin = function(req, res, next) {
    if (!req.user) {
        res.render('authentication/login', {
            title: 'Log-in Form',
        });
    } else {
        return res.redirect('/');
    }
};
