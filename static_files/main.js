angular.module('msgBoard', ['ngMaterial'])
.controller('msgCtrl', function($scope, $mdToast, $animate, $timeout) {
    
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
        if(userNameCheck() && inputCheck(user_input) && $scope.isQuerySuccess)
            send_to_server(user_input);
    });

    var send_to_server = function (text_to_send) {
      if (typeof text_to_send !== 'string') throw TypeError();
        var _json = {
            nickname:username,
            emoji:parseInt($scope.userMood),
            message:text_to_send,
            time_stp:""
      }
      //http_post('/echo', text_to_send, data_from_server_callback);
      msgText = text_to_send;
      http_post('/echo', JSON.stringify(_json), data_from_server_callback);
 
    };

    var data_from_server_callback = function (result) {
        var _JSON_obj = JSON.parse(result);
        //console.log(_JSON_obj);
        log_textarea_elm.value +=  username + moodValue+ ' : [ ' + msgText + ' ] '+ timestamp_str(_JSON_obj.time_stp)+'\n';
    };
    
     //refresh
    $scope.refresh_sig = function(){
      var _vstr = "";
      http_post('/refresh', _vstr, parse_refresh);
      //showOnly_sig('sam031023');
    };

    var parse_refresh = function(_data){
      var _obj = JSON.parse(_data);
      log_textarea_elm.value = "";
      for (i=0; i<_obj.length; i++){
        //console.log(_obj[i][1]);
        moodValueCheck(_obj[i][1]);
        log_textarea_elm.value +=_obj[i][0] + moodValue + ' : [ ' + _obj[i][2] + ' ] ' + timestamp_str(_obj[i][3]) + '\n';
      }
    };
    //end of refresh
    
    //register and query
    var register_sig = function(_name, _passWord){
      var _json = {
        nickname:_name,
        password:_passWord
      }
      if(userNameCheck(_name)){
          //console.log("!!!!!");
        http_post('/register', JSON.stringify(_json), register_success_or_not);   
      }
    };
    
    var query_sig = function(_name, _passWord){
      var _json = {
        nickname:_name,
        password:_passWord
      }
      http_post('/query', JSON.stringify(_json), query_success_or_not);
    };
    
    $scope.isQuerySuccess = false;
    $scope.isRegisterSuccess = false;
    
    var query_success_or_not = function(_data){
        
      $scope.isQuerySuccess = false;
      var _obj = JSON.parse(_data);
      //console.log(_obj);
      console.log('Query ' + _obj.ok + '!');
      $scope.isQuerySuccess = _obj.ok;
      username = $scope.name;
      if ( !$scope.isQuerySuccess ) 
          alert(_obj.reason);
      else $scope.showLoginSuccessToast();
    };
     
    var register_success_or_not = function(_data){
        
      $scope.isRegisterSuccess = false;
      var _obj = JSON.parse(_data);
      //console.log(_obj);
      console.log('Register ' + _obj.ok + '!');
      $scope.isRegisterSuccess = _obj.ok;
      if ( $scope.isRegisterSuccess ) $scope.showRegisterSuccessToast();
      else alert(_obj.reason);
    };
    $scope.toastPosition = {
        bottom: false,
        top: true,
        left: false,
        right: true
    };
    
      $scope.getToastPosition = function() {
        return Object.keys($scope.toastPosition)
          .filter(function(pos) { return $scope.toastPosition[pos]; })
          .join(' ');
      };
    
    $scope.showLoginSuccessToast = function() {
        $mdToast.show(
          $mdToast.simple()
            .content('Login success!')
            .position($scope.getToastPosition())
            .hideDelay(3000)
        );
    };
    
    $scope.showRegisterSuccessToast = function() {
        $mdToast.show(
          $mdToast.simple()
            .content('You can login now.')
            .position($scope.getToastPosition())
            .hideDelay(3000)
        );
    };  
    //end of register and query

    //showOnly
    $scope.showOnly_sig = function(){
      var _usrname = $scope.userShowOnly;
      //console.log(_usrname);
      if(_usrname!==undefined)
        http_post('/showOnly',_usrname,parse_refresh);
      else alert("Please select an user.");
    };
    //end of showOnly
  
    //get List
    $scope.userlist=[];
    
    var getList = function(_formServer){
        $scope.userlist = JSON.parse(_formServer);
      };
    //http_post('/list',"",getList);
    //end of getList
  
    // load the user list 
    $scope.loadUsers = function (){
        console.log("!!!!");
        http_post('/list',"",getList);
        console.log($scope.userlist);
        $scope.users = $scope.userlist;
    }
    
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
        //console.log($scope.userMood);
        moodValueCheck($scope.userMood);
        //console.log("user input: " + userInput);
        if(!$scope.isQuerySuccess){
            alert("please login.");
            return false;
        }
        else if(userInput=="") {
            alert("please type something.");
            return false;
        }
        else if ($scope.userMood === undefined){
            alert("please choose one emoji.");
            return false;
        }
        else if(userInput!=="" && $scope.isQuerySuccess) return true;
    }
 
    var userNameCheck = function (){
        //console.log("username: " + $scope.name);
        if(/^[a-z0-9]{3,10}$/.test($scope.name) && $scope.name!==undefined){
             console.log("valid name!");
             return true;
        }
        else {
            alert("Invalid user name!");
            return false;
        }
    }
    // set button event
    $('#user-login-btn').click(function(){
        //console.log($scope.userShowOnly);
        //username = $('#userName').val();
        query_sig($scope.name, $scope.password); 
        //console.log("username check: " + userNameCheck());
    });
    
    $('#user-register-btn').click(function(){
        register_sig($scope.name, $scope.password);
        //console.log("nickname: " + $scope.name);
        //console.log("password: " + $scope.password);
    });
    
    var moodValueCheck = function(mood){
        if(mood == 0) moodValue = "😊";
        else if (mood == 1)  moodValue = "😁";
        else if (mood == 2)  moodValue = "😫";
        else if (mood == 3)  moodValue = "😢";
        else if (mood == 4)  moodValue = "😡";        
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