/*global io*/
/*jslint browser: true*/

(function($) {

  $(document).ready(function() {
    // var i;

    var openedC = false;
    var selectedMessage;
    $('#chatModal').on('shown.bs.modal', function() {
      openedC = true;
      console.log(openedC);
    });
    $('#chatModal').on('hidden.bs.modal', function() {
      openedC = false;
      console.log(openedC);
    });

    socket.emit('listUser');
    socket.on('listUser', function(data) {
      var i = 0;
      var j = 0;
      var userInfo = connect.retrieve.userInfo();
      if (data.success) {

        var userArray = [];

        for (i = 0; i < countObj(data.users); i++) {
          {
            userArray[i] = data.users[i].username;
          }
        }
        for (i = 0; i < userArray.length; i++) {
          if (userArray[i] !== userInfo.username)
            $('#userSelect').append($('<option>', {
              value: i,
              text: userArray[i]
            }));
        }
      }
    });



    socket.emit('listActiveUser');
    socket.on('listActiveUser', function(data) {
      var i = 0;
      var j = 0;
      var userInfo = connect.retrieve.userInfo();

      if (data.success) {

        var userArray = [];

        for (i = 0; i < countObj(data.list); i++) {

          userArray[i] = data.list[i].user;


        }
        for (j = 0; j < userArray.length; j++) {
          if (userArray[j] !== userInfo.username)

            $('#activeUserSelect').append($('<option>', {
            value: j,
            text: userArray[j]
          }));

        }
      }
    });



    socket.emit('requestAllMessages');
    socket.on('requestAllMessages', function(data) {
      var i = 0;
      var j = 0;
      if (data.success) {
        var userInfo = connect.retrieve.userInfo();

        if (data.message.length > 0) {
          var orderArray = [];
          var validateCpt = true;
          var temp = {};
          for (i = 0; i < data.message.length; i++) {
            if (data.message[i].sender != userInfo.username) {
              for (j = 0; j < orderArray.length; j++) {
                validateCpt = true;
                if (orderArray[j].key == data.message[i].sender) {
                  orderArray[j].tab.push({
                    index: i,
                    type: 0
                  });
                  validateCpt = false;
                }
              }
              if (validateCpt) {
                temp = [{
                  index: i,
                  type: 0
                }];
                orderArray.push({
                  key: data.message[i].sender,
                  tab: temp
                });
              }
            } else if (data.message[i].receiver != userInfo.username) {
              for (j = 0; j < orderArray.length; j++) {
                validateCpt = true;
                if (orderArray[j].key == data.message[i].receiver) {
                  orderArray[j].tab.push({
                    index: i,
                    type: 1
                  });
                  validateCpt = false;
                }
              }
              if (validateCpt) {
                temp = [{
                  index: i,
                  type: 1
                }];
                orderArray.push({
                  key: data.message[i].receiver,
                  tab: temp
                });
              }
            }
          }
          console.log(orderArray);
          for (i = 0; i < orderArray.length; i++) {
            if (orderArray[i].tab.length > 1) {
              $('.chat-items').append("<li><ul><li value='" + data.message[orderArray[i].tab[0].index]._id + "'class='typed" + orderArray[i].tab[0].type + "'><span class='chat-from'>" + orderArray[i].key + "</span><span class='chat-date'>" + formatDate(data.message[orderArray[i].tab[0].index].date) + "</span><span class='chat-text'>" + data.message[orderArray[i].tab[0].index].content + "</span><button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#message" + i + "\">Voir plus</button><button type=\"button\" class=\"btn btn-info delMessage\" data-toggle=\"modal\" data-target=\"#delModal\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button></li></ul><ul id='message" + i + "' class='collapse'></ul></li></li>");
              for (j = 1; j < orderArray[i].tab.length; j++) {
                $('.chat-items li #message' + i).append("<li  value='" + data.message[orderArray[i].tab[j].index]._id + "' class='typed" + orderArray[i].tab[j].type + "'><span class='chat-from'>" + orderArray[i].key + "</span><span class='chat-date'>" + formatDate(data.message[orderArray[i].tab[j].index].date) + "</span><span class='chat-text'>" + data.message[orderArray[i].tab[j].index].content + "</span><button type=\"button\" class=\"btn btn-info delMessage\" data-toggle=\"modal\" data-target=\"#delModal\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button</li>");
              }
            } else {
              $('.chat-items').append("<li><ul id='message" + i + "'></ul></li>");
              for (j = 0; j < orderArray[i].tab.length; j++) {
                $('.chat-items li #message' + i).append("<li  value='" + data.message[orderArray[i].tab[j].index]._id + "' class='typed" + orderArray[i].tab[j].type + "'><span class='chat-from'>" + orderArray[i].key + "</span><span class='chat-date'>" + formatDate(data.message[orderArray[i].tab[j].index].date) + "</span><span class='chat-text'>" + data.message[orderArray[i].tab[j].index].content + "</span><button type=\"button\" class=\"btn btn-info delMessage\" data-toggle=\"modal\" data-target=\"#delModal\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button</li>");
              }
            }
          }
        } else {
          $('.chat-items').append("<li class='noMessage'>Vous n'avez reçu aucun message</li>");
        }
      } else {
        $('.chat-items').append("<li class='noMessage'>Erreur</li>");
      }
      /*Fonction de regroupemen*/
    });

    $('#sendMessageBtn').click(function() {

      if ($('#contentMessage').val() !== "") {
        var userInfo = connect.retrieve.userInfo();
        var receiver = $("#userSelect option:selected").text();
        var content = $('#contentMessage').val();
        var request = {
          content: content,
          receiver: receiver,
          sender: userInfo.username
        };
        socket.emit('sendMessage', JSON.stringify(request));
      }
    });

    socket.on('sendMessage', function(res) {
      if (!openedC) {
        console.log(res);
        if (res.success === true) {
          $('#confirmSent').text("message Envoyé avec succés");
          $('.chat-items').prepend("<li value='" + res.message._id + "' class=\"typed\" ><ul><li><span class='chat-from'>" + res.message.sender + "</span><span class='chat-date'>" + formatDate(res.message.date) + "</span><span class='chat-text'>" + res.message.content + "</span><button type=\"button\" class=\"btn btn-info delMessage\" res.message-toggle=\"modal\" res.message-target=\"#delModal\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button</li></ul></li>");
        } else
          $('#confirmSent').text("erreur, le message n'a pas pu être envoyé");
      }
    });

    socket.on('receiveMessage', function(data) {
      console.log(data);
      $('.chat-items').prepend("<li value='" + data._id + "' class=\"typed\" ><ul><li><span class='chat-from'>" + data.sender + "</span><span class='chat-date'>" + formatDate(data.date) + "</span><span class='chat-text'>" + data.content + "</span><button type=\"button\" class=\"btn btn-info delMessage\" data-toggle=\"modal\" data-target=\"#delModal\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button</li></ul></li>");
      if (openedC) {
        var curDate = Date.now();
        $('.chat').append("<li class='right clearfix'><span class='chat-img pull-right'><div id='circleB' class='img-circle'></div></span><div class='chat-body clearfix'> <div class='header'> <strong class='primary-font'>" + data.sender + "</strong> <small class='pull-right text-muted'><span></span> " + formatDate(curDate) + "</small> </div> <p> " + data.content + " </p> </div></li>");
      }
    });

    $("#btn-input").keyup(function(event) {
      if (event.keyCode == 13) {
        $("#btn-chat").click();
      }
    });

    $('#btn-chat').click(function() {
      var userInfo = connect.retrieve.userInfo();
      var receiver = $("#activeUserSelect option:selected").text();
      var content = $('#btn-input').val();
      $('#btn-input').val('');
      var request = {
        content: content,
        receiver: receiver,
        sender: userInfo.username
      };
      var valid = true;
      for (var item in request) {
        if (typeof item === "undefined")
          valid = false;
      }
      if (valid) {
        console.log(request);
        var curDate = Date.now();
        socket.emit('sendMessage', JSON.stringify(request));
        $('.chat').append("<li class='left clearfix'><span class='chat-img pull-left'><div id='circleR' class='img-circle'></div></span><div class='chat-body clearfix'> <div class='header'> <strong class='primary-font'>" + request.sender + "</strong> <small class='pull-right text-muted'><span></span> " + formatDate(curDate) + "</small> </div> <p> " + request.content + " </p> </div></li>");
      }
    });

    $('#delModal').on('show.bs.modal', function(event) {
      selectedMessage = event.relatedTarget;
      selectedMessage = $(selectedMessage).parent('li').attr('value');
      console.log(selectedMessage);
    });

    $('#delMsg').click(function() {
      var request = {
        _id: selectedMessage
      };
      console.log(request);
      socket.emit('deleteMessage', JSON.stringify(request));
    });

    socket.on('deleteMessage', function(data) {
      console.log(data);
      if (data.success) {
        $('#confDel').text("succes");
        var elem = $("ul").find("[value='" + data._id + "']");
        console.log(elem);
        if ($(elem).attr('class') == "typed1") {
          var kids = $( elem ).children("span");
          var cross = $( elem ).find('.delMessage');
          $(elem).attr('class', 'typed');
          $(cross).remove();
          $(kids).remove();
        } else {
          $(elem).remove();
        }
      } else {
        $('#confDel').text("echec");
      }
    });

    countObj = function(obj) {
      var count = 0;
      for (var k in obj) {
        // if the object has this property and it isn't a property
        // further up the prototype chain
        if (obj.hasOwnProperty(k)) count++;
      }
      return count;
    };

    formatDate = function(date) {
      var d = new Date(date);
      var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
        d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      return datestring;
    };

  });
})(jQuery);