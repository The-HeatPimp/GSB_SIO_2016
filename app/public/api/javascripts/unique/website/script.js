(function($) {
    $(document).ready(function() {
        $("#helpButton").click(function() {
            introJs().start(".intro-step");
        });
        $("#disconnect").click(function() {
        	disconnect.close.session();
        });

    });
})(jQuery);