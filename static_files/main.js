console.log('Hello JavaScript!');

var http_post = function (where, text_to_send, callback) {
  if (typeof where !== 'string') throw TypeError();
  if (typeof text_to_send !== 'string') throw TypeError();
  if (typeof callback !== 'function') throw TypeError();
  fetch(where, {
      method: 'POST',
      body: text_to_send
    })
    .then(function (response) {
      return response.text();
    })
    .then(function (server_response_text) {
      //console.log(server_response_text);
      callback(server_response_text);
    })
    .catch(function (err) {
      callback(null, err);
    });
  //這邊我簡單說明一下fetch的功能，fetch基本上就是送出一個request，他的method body url等都是可以設定的參數
};


var input_textarea_elm = document.getElementById('user-input-area');
var log_textarea_elm = document.getElementById('log-area');
var send_button_elm = document.getElementById('user-input-send-btn');

//refresh
var refresh_btu_elm = document.getElementById('refresh');
refresh_btu_elm.addEventListener('click', function(){
  refresh_sig();
});
//refresh

send_button_elm.addEventListener('click', function () {
  var user_input = input_textarea_elm.value;
  if (user_input.length!=0){
    input_textarea_elm.value = '';
    input_textarea_elm.focus();
    send_to_server(user_input);
  }
  else  alert("Error! Message is empty!");
});

var send_to_server = function (text_to_send) {
  if (typeof text_to_send !== 'string') throw TypeError();
  var _json = {
    nickname:username,
    emoji:1,
    message:text_to_send,
    time_stp:"",
  }
  //建立一個JSON物件，之後在用JSON的stringify功能把他轉成string，傳入http_post
  //http_post我沒有做變更，下一個變更再app.js裡面
  http_post('/echo', JSON.stringify(_json), data_from_server_callback);
};

var data_from_server_callback = function (result) {
  //log_textarea_elm.value += timestamp_str() +'  '+ username + ': [' + result + ']\n' ;
  var _JSON_obj = JSON.parse(result);
  log_textarea_elm.value += timestamp_str(_JSON_obj.time_stp) + ' ' +_JSON_obj.nickname + ' : ' + _JSON_obj.message + '\n';
};

//refresh
var refresh_sig = function(){
  var _vstr = "";
  http_post('/refresh', _vstr, parse_refresh);
};

var parse_refresh = function(_data){
  var _obj = JSON.parse(_data);
  log_textarea_elm.value = "";
  for (i=0; i<_obj.length; i++){
    log_textarea_elm.value += timestamp_str(_obj[i].time_stp) + ' '+_obj[i].nickname + ' : ' + _obj[i].message + '\n';
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

$('#user-name-set-btn').click(function(){
    username = $('#userName').val();
    console.log(username);
});

//var myRequest = new Request('test');
//var useremoji="";