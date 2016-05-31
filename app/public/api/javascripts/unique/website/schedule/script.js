 (function($) {

 	$(document).ready(function() {

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
 			
 		});

 		isEmpty = function(str) {
 			return (((!str || 0 === str.length) + (!str || /^\s*$/.test(str))) > 0);
 		};
 		verifyCreateForm = function() {
 			console.log("chg");
 			$('#NcreateR').prop("disabled", (
 				isEmpty($("#NdateD").val()) ||
 				isEmpty($("#NtimeD").val()) ||
 				isEmpty($("#NdateR").val()) ||
 				isEmpty($("#NtimeR").val()) ||
 				isEmpty($("#Ndest").val()) ||
 				isEmpty($("#Nloc").val()) ||
 				isEmpty($("#Ndesc").val())));
 		};
 		$('#createEventModal input, #checkboxes ').change(function(data) {
 			verifyCreateForm();
 		});
 		formatNowDate = function(date) {

 			var d = new Date(date);
 			var datestring = (d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
 			return datestring;
 		};
 		var calendar;
 		var currentDate = new Date();
 		var source = [];
 		var currentDay = formatNowDate(currentDate);

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
 		var globeventId;
 		$('#events-modal').on('click', '#changeEvent', function() {
 			globeventId = $(this).attr('value');
 			$('#events-modal').modal('hide');
 			$('#changeEventModal').modal('show');
 			console.log(globeventId);
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
 		$('.multiselect').on('click', '.selectBox2', function() {
 			var checkboxes2 = document.getElementById("checkboxes2");
 			if (!expanded) {
 				checkboxes2.style.display = "block";
 				expanded = true;
 			} else {
 				checkboxes2.style.display = "none";
 				expanded = false;
 			}
 		});
 		socket.emit("listUser");
 		socket.on('listUser', function(data) {
 			console.log(data);
 			if (data.success) {
 				console.log('success');
 				for (var i = 0; i < data.users.length; i++) {
 					$('#checkboxes').append("<label><input value='" + data.users[i].username + "' type=\"checkbox\"/> " + data.users[i]
 						.username + " </label>");
 					$('#checkboxes2').append("<label><input value='" + data.users[i].username + "' type=\"checkbox\"/> " + data.users[i]
 						.username + " </label>");
 				}
 			}
 		});
 		$('#NcreateR').click(function() {
 			console.log("click");
 			var temp = $("#NdateD").val() + " " + $("#NtimeD").val();
 			var dateD = moment(temp, 'YYYY-MM-DD hh:mm:ss')._d;
 			var dateR = moment($("#NdateR").val() + " " + $("#NtimeR").val(),
 				'YYYY-MM-DD hh:mm:ss')._d;
 			var title = $("#Ndest").val();
 			var description = $("#Ndest").val();
 			var location = $("#Nloc").val();
 			var participant = [];
 			$('#checkboxes input:checked').each(function() {
 				var tempName = $(this).val();
 				participant.push({
 					username: tempName
 				});
 			});
 			var request = {
 				date_start: dateD,
 				date_end: dateR,
 				title: title,
 				description: description,
 				location: location,
 				participant: participant
 			};
 			console.log(JSON.stringify(request));
 			socket.emit('createEvent', JSON.stringify(request));

 		});

 		$('#NchangeR').click(function(data) {
 			var participant = [];
 			$('#checkboxes2 input:checked').each(function() {
 				var tempName = $(this).val();
 				participant.push({
 					username: tempName
 				});
 			});
 			var request = {
 				_id: globeventId,
 				participant: participant
 			};
 			socket.emit('updateEvent', JSON.stringify(request));
 		});
 		socket.on('updateEvent', function(data) {
 			if (data.success)
 				alert('Mise à jour réussie');
 			else
 				alert('echec de la mise à jour :' + data.error);
 		});
 		socket.on('createEvent', function(data) {
 			if (data.success)
 				alert('Création réussie');
 			else
 				alert('echec de la création : ' + data.error);
 		});
 		socket.on('deleteEvent', function(data) {
 			if (data.success)
 				alert('suppression réussie');
 			else
 				alert('echec de la suppression :' + data.error);
 		});
 	});
 })(jQuery);