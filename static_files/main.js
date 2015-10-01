console.log('Hello JavaScript!');

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

var timestamp_str = function () {
  var ensure_two_digits = function (num) {
    return (num < 10) ? '0' + num : '' + num; };
  var date   = new Date();
  console.log(date/1000);  //seconds since epoch
  var year   = date.getFullYear();
  var month  = ensure_two_digits(date.getMonth() + 1);
  var day    = ensure_two_digits(date.getDate());
  var hour   = ensure_two_digits(date.getHours());
  var minute = ensure_two_digits(date.getMinutes());
  var second = ensure_two_digits(date.getSeconds());
  return year+  '/' +month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
};

var input_textarea_elm = document.getElementById('user-input-area');
var log_textarea_elm = document.getElementById('log-area');
var send_button_elm = document.getElementById('user-input-send-btn');


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
  http_post('/echo', text_to_send, data_from_server_callback);
};

var data_from_server_callback = function (result) {
  log_textarea_elm.value += timestamp_str() +'  '+ username + ': [' + result + ']\n' ;
};

var username="";
$('#user-name-set-btn').click(function(){
    username = $('#userName').val();
    console.log(username);
});


//var useremoji="";
