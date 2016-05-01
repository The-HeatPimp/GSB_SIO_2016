////////////////////////////////////////////
// CONTROLLER : PROTECTED PAGES RENDERING //
////////////////////////////////////////////


// Render The Home page
exports.renderHome = function(req, res, next) {
    if (!req.user) {
        res.render('website/home', {
            title: 'Page d\'accueil'
        });
    } else {
        return res.redirect('/');
    }
};