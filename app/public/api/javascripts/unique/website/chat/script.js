/*global io*/
/*jslint browser: true*/
(function($) {
  $(document).ready(function() {
    // var i;



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
          var temp = [];
          for (i = 0; i < data.message.length; i++) {
            if (data.message[i].sender != userInfo.username) {
              for (j = 0; j < orderArray.length; j++) {
                validateCpt = true;
                if (orderArray[j].key == data.message[i].sender) {
                  orderArray[j].tab.push(i);
                  validateCpt = false;
                }
              }
              if (validateCpt) {
                temp = [i];
                orderArray.push({
                  key: data.message[i].sender,
                  tab: temp
                });
              }
            } else if (data.message[i].receiver != userInfo.username) {
              for (j = 0; j < orderArray.length; j++) {
                validateCpt = true;
                if (orderArray[j].key == data.message[i].receiver) {
                  orderArray[j].tab.push(i);
                  validateCpt = false;
                }
              }
              if (validateCpt) {
                temp = [i];
                orderArray.push({
                  key: data.message[i].receiver,
                  tab: temp
                });
              }
            }
          }
       
          for (i = 0; i < orderArray.length; i++) {
            if (orderArray[i].tab.length > 1) {
              $('.chat-items').append("<li><ul><li><span class='chat-from'>" + orderArray[i].key + "</span><span class='chat-date'>" + formatDate(data.message[orderArray[i].tab[0]].date) + "</span><span class='chat-text'>" + data.message[orderArray[i].tab[0]].content + "</span><button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#message" + i + "\">Voir plus</button></li></ul><ul id='message" + i + "' class='collapse'></ul></li></li>");
              for (j = 1; j < orderArray[i].tab.length; j++) {
                $('.chat-items li #message' + i).append("<li><span class='chat-from'>" + orderArray[i].key + "</span><span class='chat-date'>" + formatDate(data.message[orderArray[i].tab[j]].date) + "</span><span class='chat-text'>" + data.message[orderArray[i].tab[j]].content + "</span></li>");
              }
            } else {
              $('.chat-items').append("<li><ul id='message" + i + "'></ul></li>");
              for (j = 0; j < orderArray[i].tab.length; j++) {
                $('.chat-items li #message' + i).append("<li><span class='chat-from'>" + orderArray[i].key + "</span><span class='chat-date'>" + formatDate(data.message[orderArray[i].tab[j]].date) + "</span><span class='chat-text'>" + data.message[orderArray[i].tab[j]].content + "</span></li>");
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