////////////////////////////////////////////
// CONTROLLER : PROTECTED PAGES RENDERING //
////////////////////////////////////////////


// Render The Home page
exports.renderHome = function(req, res, next) {
    if (req) {
        res.render('website/index', {

        });
    } else {
        return res.redirect('/');
    }
};

// Render The Chat page
exports.renderChat = function(req, res, next) {
    if (req) {
        res.render('website/chat/index', {

        });
    } else {
        return res.redirect('/');
    }
};
exports.renderSchedule = function(req, res, next) {
    if (req) {
        res.render('website/schedule/index', {

        });
    } else {
        return res.redirect('/');
    }
};
exports.renderRoute = function(req, res, next) {
    if (req) {
        res.render('website/route/index', {

        });
    } else {
        return res.redirect('/');
    }
};
exports.renderTicket = function(req, res, next) {
    if (req) {
        res.render('website/ticket/index', {

        });
    } else {
        return res.redirect('/');
    }
};
exports.renderSupport = function(req, res, next) {
    if (req) {
        res.render('website/support/index', {

        });
    } else {
        return res.redirect('/');
    }
};

exports.renderAdmin = function(req, res, next) {
    if (req) {
        res.render('website/admin/index', {

        });
    } else {
        return res.redirect('/');
    }
};