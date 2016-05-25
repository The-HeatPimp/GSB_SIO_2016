    (function($) {
    	$(document).ready(function() {
    		// class="access-2" class="access-3"
    		var accessLevel = cookies.usage.getCookies("auth-info");
    		accessLevel = accessLevel.accessLevel;
    		switch(accessLevel) {
    			case 1 : $('.access-2').css("display", "none");
    			$('.access-3').css("display", "none");
    			break;
    			case 2 :$('.access-2').css("display", "inline-block");
    			$('.access-3').css("display", "none");
    			break;
    			case 3 :$('.access-2').css("display", "inline-block");
    			$('.access-3').css("display", "inline-block");
    			break;
    		}
    	});
    })(jQuery);