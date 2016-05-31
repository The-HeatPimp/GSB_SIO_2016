/////////////////////////////////
// CONTROLLER OF THE MAIN PAGE //
/////////////////////////////////

/*
	Render the main page
 */
exports.renderHome = function(req, res) {
	res.render('index', {
		title: 'Page d\'accueil',
		user: req.user ? req.user.username : '',
	});
};