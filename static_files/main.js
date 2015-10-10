angular.module('msgBoard', ['ngMaterial'])
.controller('msgCtrl', function($scope) {
    
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
        var _JSON_obj = JSON.parse(result);
        console.log(_JSON_obj);
        log_textarea_elm.value +=  username + ' ' + moodValue+ ' : [ ' + msgText + ' ] '+ timestamp_str(_JSON_obj.time_stp)+'\n';
    };
    
     //refresh
    $scope.refresh_sig = function(){
      var _vstr = "";
      http_post('/refresh', _vstr, parse_refresh);
    };

    var parse_refresh = function(_data){
      var _obj = JSON.parse(_data);
      log_textarea_elm.value = "";
      for (i=0; i<_obj.length; i++){
        console.log(_obj[i].emoji);
        moodValueCheck(_obj[i].emoji);
        log_textarea_elm.value +=_obj[i].nickname + moodValue + ' : [ ' + _obj[i].message + ' ] ' + timestamp_str(_obj[i].time_stp) + '\n';
      }
    };
    //end of refresh

    //unix time to timestamp_str
    var timestamp_str = function (unix) {
      var ensure_two_digits = function (num) {
        return (num < 10) ? '0' + num : '' + num; };
      var date   = new Date(unix*1000);
      var year   = date.getFullYear();
      var month  = ensure_two_digits(date.getMonth() + 1);
      var day    = ensure_two_digits(date.getDate());
      var hour   = ensure_two_digits(date.getHours());
      var minute = ensure_two_digits(date.getMinutes());
      var second = ensure_two_digits(date.getSeconds());
      return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    };
    //end of unix time to timestamp_str

    var username="";
    var moodValue="";
    var msgText= "";

    var inputCheck = function ( userInput ) {
        moodValueCheck($scope.userMood);
        console.log("user input: " + userInput);
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
    
    
    var moodValueCheck = function(mood){
        if(mood == 1) moodValue = "😊";
        else if (mood == 2)  moodValue = "😁";
        else if (mood == 3)  moodValue = "😫";
        else if (mood == 4)  moodValue = "😢";
        else if (mood == 5)  moodValue = "😡";        
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
