angular.module('msgBoard', ['ngMaterial'])
.controller('inputCtrl', function($scope) {
    
    var http_post = function (where, text_to_send, callback) {
      if (typeof where !== 'string') throw TypeError();
      if (typeof text_to_send !== 'string') throw TypeError();
      if (typeof callback !== 'function') throw TypeError();

      fetch(where, {method: 'POST', body: text_to_send})
        .then(function (response) {
          return response.text();
        })
        .then(function (server_response_text) {
          callback(server_response_text);
        })
        .catch(function (err) {
          callback(null, err);
        });
    };
    
    var input_textarea_elm = document.getElementById('user-input-area');
    var log_textarea_elm = document.getElementById('log-area');
    var send_button_elm = document.getElementById('user-input-send-btn');
    
    send_button_elm.addEventListener('click', function () {  
        var user_input = input_textarea_elm.value;
        input_textarea_elm.value = '';
        input_textarea_elm.focus();
        if(userNameCheck() && inputCheck(user_input))
            send_to_server(user_input);
        console.log($scope.userMood);
    });

    var send_to_server = function (text_to_send) {
      if (typeof text_to_send !== 'string') throw TypeError();
        var _json = {
            nickname:username,
            emoji:$scope.userMood,
            message:text_to_send,
            time_stp:""
      }
      //http_post('/echo', text_to_send, data_from_server_callback);
      msgText = text_to_send;
      http_post('/echo', JSON.stringify(_json), data_from_server_callback);
 
    };

    var data_from_server_callback = function (result) {
      log_textarea_elm.value += '>>>'+ username + moodValue+ ': [' + msgText + ']\n';
    };

    var username="";
    var moodValue="";
    var msgText= "";

    var inputCheck = function ( userInput ) {
        moodValueCheck();
        if(userInput=="") {
            alert("please type something.");
            return false;
        }
        else return true;
    }

    var userNameCheck = function (){
        console.log("username: " + username);
        if(/^[a-z0-9]{3,10}$/.test(username)){
             console.log("valid name!");
             return true;
        }
        else alert("Invalid user name!");
    }

    $('#user-name-set-btn').click(function(){
        username = $('#userName').val();
        console.log(userNameCheck());
    });
    
    
    var moodValueCheck = function(){
        if($scope.userMood==1) moodValue = "😊";
        else if ($scope.userMood==2)  moodValue = "😁";
        else if ($scope.userMood==3)  moodValue = "😫";
        else if ($scope.userMood==4)  moodValue = "😢";
        else if ($scope.userMood==5)  moodValue = "😡";        
        console.log("user's mood is : " + moodValue); 
                
    //unknown error QQQQQ 
     /*
       console.log($scope.userMood);
        var m = $scope.userMood;
        console.log(m);
       switch (m)
       {
            case 1 :
               moodValue = "😊";
               break;
            case 2 :
               moodValue = "😁";
               break;
            case 3 :
               moodValue = "😫";
               break;
            case 4 :
               moodValue = "😢";
               break;
            case 5 :
               moodValue = "😡";
               break;
           //default:
               //moodValue = "";
               //console.log("!!");
               //break;
       }
        console.log(moodValue);     
      */    
    }
    

});
