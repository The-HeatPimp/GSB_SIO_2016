 (function($) {

 	$(document).ready(function() {
 		formatNowDate = function(date) {
 			var d = new Date(date);
 			var datestring = (d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
 			return datestring;
 		};


 		var currentDate = new Date();
 		console.log(currentDate);
 		var currentDay = formatNowDate(currentDate);
 		console.log(currentDay);
 		var options = ({
 			events_source: function() {
 				return [{
 					"id": 293,
 					"title": "Event 1",
 					"class": "event-important",

 					"start": currentDate.getTime(), // Milliseconds
 					"end": currentDate.getTime() + 24 * 60 * 60 * 1000 // Milliseconds
 				}];
 			},
 			tmpl_path: "javascripts/assets/bootstrap-calendar-master/tmpls/",
 			language: 'fr-FR',
 			day: currentDay,
 			modal: "#events-modal",
 			modal_type: "template",
 			modal_title: function(e) {
 				return e.title;
 			},
 			display_week_numbers: true,
 			weekbox: true,
 			onAfterEventsLoad: function(events) {
 				if (!events) {
 					return;
 				}
 				var list = $('#eventlist');
 				list.html('');

 				$.each(events, function(key, val) {
 					$(document.createElement('li'))
 						.html('<a href="' + val.url + '">' + val.title + '</a>')
 						.appendTo(list);
 				});
 			},
 			onAfterViewLoad: function(view) {
 				$('.page-header h3').text(this.getTitle());
 				$('.btn-group button').removeClass('active');
 				$('button[data-calendar-view="' + view + '"]').addClass('active');
 			},
 			classes: {
 				months: {
 					general: 'label'
 				}
 			}
 		});
 		var calendar = $('#calendar').calendar(options);



 		$('.btn-group button[data-calendar-nav]').each(function() {
 			var $this = $(this);
 			$this.click(function() {
 				calendar.navigate($this.data('calendar-nav'));
 			});
 		});

 		$('.btn-group button[data-calendar-view]').each(function() {
 			var $this = $(this);
 			$this.click(function() {
 				calendar.view($this.data('calendar-view'));
 			});
 		});


 	});
 })(jQuery);