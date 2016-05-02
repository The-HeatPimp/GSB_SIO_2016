////////////////////////////////////////////
// CONTROLLER : PROTECTED PAGES RENDERING //
////////////////////////////////////////////


// Render The Home page
exports.renderHome = function(req, res, next) {
    if (req) {
        res.render('website/index', {
            title: "Page d\'accueil"
        });
    } else {
        return res.redirect('/');
    }
};

// Render The Chat page
exports.renderChat = function(req, res, next) {
    if (req) {
        res.render('website/chat/index', {
            title: "Messagerie instantanée"
        });
    } else {
        return res.redirect('/');
    }
};
exports.renderSchedule = function(req, res, next) {
    if (req) {
        res.render('website/schedule/index', {
            title: "Emploi du temps"
        });
    } else {
        return res.redirect('/');
    }
};
exports.renderRoute = function(req, res, next) {
    if (req) {
        res.render('website/route/index', {
            title: "Location de véhicule"
        });
    } else {
        return res.redirect('/');
    }
};
exports.renderTicket = function(req, res, next) {
    if (req) {
        res.render('website/ticket/index', {
            title: "Ticket incident"
        });
    } else {
        return res.redirect('/');
    }
};
exports.renderSupport = function(req, res, next) {
    if (req) {
        res.render('website/support/index', {
            title: "Page de support"
        });
    } else {
        return res.redirect('/');
    }
};

exports.renderAdmin = function(req, res, next) {
    if (req) {
        res.render('website/admin/index', {
            title: "Page d\'administration"
        });
    } else {
        return res.redirect('/');
    }
};