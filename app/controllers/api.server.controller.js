///////////////////////////////////
// CONTROLLER OF THE INDEX PAGE  //
///////////////////////////////////

/*
    Method : Render the page Login
 */
exports.renderHome = function(req, res, next) {
    if (!req.user) {
        res.render('website/home', {
            title: 'Page d\'accueil'
        });
    } else {
        return res.redirect('/');
    }
};