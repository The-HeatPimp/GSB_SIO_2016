 (function($) {

 	$(document).ready(function() {
 		formatNowDate = function(date) {
 			var d = new Date(date);
 			var datestring = (d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
 			return datestring;
 		};
 		var calendar;
 		var currentDate = new Date();
 		var source = [];
 		var currentDay = formatNowDate(currentDate);
 		var option = ({
 			onAfterModalShown: function(events) {
 				$('#events-modal h3').text(events.title);
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
 		socket.emit('listEvent');
 		socket.on('listEvent', function(data) {
 			if (data.success) {
 				for (var i = 0; i < data.event.length; i++) {
 					var mili = new Date(data.event[i].date_start);
 					mili = mili.getTime();
 					var mili2 = new Date(data.event[i].date_end);
 					mili2 = mili2.getTime();
 					source.push({
 						"id": data.event[i]._id,
 						"title": data.event[i].title,
 						"class": "event-important",
 						"location": data.event[i].location,
 						"description": data.event[i].description,
 						"creator": data.event[i].creator,
 						"start": mili, // Milliseconds
 						"end": mili2,
 						"participant": []
 					});
 					for (var j = 0; j < data.event[i].participant.length; j++) {
 						source[i].participant.push({
 							"username": data.event[i].participant[j].username,
 							"participate": data.event[i].participant[j].participate
 						});
 					}

 				}
 				var options = ({
 					events_source: function() {
 						return source;
 					},
 					tooltip_container: 'body',
 					tmpl_path: "javascripts/assets/bootstrap-calendar-master/tmpls/",
 					language: 'fr-FR',
 					day: currentDay,
 					modal: "#events-modal",
 					modal_type: "template",
 					modal_title: function(event) {
 						return event.title;
 					},
 					display_week_numbers: true,
 					weekbox: true,
 				});
 				options = jQuery.extend(option, options);
 				calendar = $('#calendar').calendar(options);
 			}
 		});

 		$('.btn-group button[data-calendar-nav]').each(function() {
 			var $this = $(this);
 			console.log($this);
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
 		$('#events-modal').on('show.bs.modal', function(e) {
 			$('#events-modal .modal-header h3').text('b');
 		});

 		$('#events-modal').on('click', '#delEvent', function() {
 			var eventId = $(this).attr('value');
 			console.log(eventId);
 			var request = {
 				_id: eventId
 			};
 			socket.emit('deleteEvent', JSON.stringify(request));
 		});
 		socket.on('deleteEvent', function(data) {
 			console.log(data);
 		});
 		var expanded = false;
 		
 		$('.multiselect').on('click', '.selectBox', function() {
 			var checkboxes = document.getElementById("checkboxes");
 			if (!expanded) {
 				checkboxes.style.display = "block";
 				expanded = true;
 			} else {
 				checkboxes.style.display = "none";
 				expanded = false;
 			}
 		});
 		socket.emit("listUser");
 		socket.on('listUser', function(data) {
 			console.log(data);
 			if (data.success) {
 				console.log('success');
 				for (var i = 0; i < data.users.length; i++) {
 					$('#checkboxes').append("<label><input value='" + data.users[i]._id + "' type=\"checkbox\"/> " + data.users[i]
 						.username + " </label>");
 				}
 			}
 		});

 	});
 })(jQuery);