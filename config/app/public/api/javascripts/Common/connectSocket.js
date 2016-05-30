    (function($) {
            var token = cookies.usage.getCookies("auth-token");
            var info = connect.retrieve.info();
            socket = io.connect({
                'query': 'token=' + token
            });
            socket.on("error", function(error) {
                if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
                    // redirect user to login page perhaps?
                    console.log("User's token has expired");
                }
            });
            socket.on("main", function(message) {
                console.log(message.message);
            });
    })(jQuery);