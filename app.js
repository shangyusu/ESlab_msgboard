var httpserver = require('./httpserver.js');

var configs = function (set_port, set_hostname, set_handler) {
  set_port(2015);
  set_hostname('127.0.0.1');
  set_handler('GET /', do_output_html);
  set_handler('GET /index.html', do_output_html);
  set_handler('GET /main.css', do_output_css);
  set_handler('GET /main.js', do_output_js);
  set_handler('GET /favicon.ico', do_output_favicon);
  set_handler('POST /echo', do_echo);
  set_handler('POST /submit', do_submit);
  set_handler('POST /read_all', do_read_all);
};

var do_output_html = function (send_response) {
  require('fs').readFile('static_files/index.html', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/html; charset=utf-8'});
  });
};

var do_output_css = function (send_response) {
  require('fs').readFile('static_files/main.css', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/css; charset=utf-8'});
  });
};

var do_output_js = function (send_response) {
  require('fs').readFile('static_files/main.js', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/javascript; charset=utf-8'});
  });
};

var do_output_favicon = function (send_response) {
  require('fs').readFile('static_files/favicon.ico', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'image/x-icon'});
  });
};

// Echo back every bytes received from the client
var do_echo = function (send_response, request_body, request_headers) {
  var _Jobj = Buffer_to_JSON(request_body);
  //var _RetJobj = JSON.parse(_Jstring);
  var date = new Date();
  _Jobj.time_stp = (date)/1000;
  save_data(_Jobj);
  var _RetJobj = Buffer_to_JSON(request_body);
  _RetJobj.time_stp = timestamp_str(date);
  var _RetJstring = JSON.stringify(_RetJobj);
  request_body = new Buffer(_RetJstring);
  var content_tBuffer_to_JSONype_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};

var do_submit = function (send_response, request_body, request_headers) {
  var _success  = true;
  var _nicError = false;
  var _msgError = false;
  var _Jobj = Buffer_to_JSON(request_body);
  var date = new Date();
  _Jobj.time_stp = (date)/1000;
  if (_Jobj.nickname.length==0)
  {
    _success  = false;
    _nicError = true;
  }
  if (_Jobj.message.length==0)
  {
    _success  = false;
    _msgError = true;
  }
  var _ret;
  if (_success)
  {
    _ret={ok:true}
    save_data(_Jobj);
  }
  else
  {
    var _reason = "";
    if (_nicError)  _reason += " you must provide a valid nickname. ";
    if (_msgError)  _reason += " you must provide a valid message. ";
    _ret={
      ok:false,
      reason:_reason
    }
  }
  request_body = new Buffer(JSON.stringify(_ret));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};


var do_read_all = function(){

};

var Buffer_to_JSON = function(_buffer)
{
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');    
  var _Jstring = myDecoder.write(_buffer);
  return JSON.parse(_Jstring);
};

var save_data = function(_obj)
{
  var fs = require('fs');
  fs.appendFile('data.db',new Buffer(JSON.stringify(_obj)),function(err){
    if (err) throw err;
    console.log('append success!');
  });
};

var timestamp_str = function (date) {
  var ensure_two_digits = function (num) {
    return (num < 10) ? '0' + num : '' + num; };
  //var date   = new Date();
  var year   = date.getFullYear();
  var month  = ensure_two_digits(date.getMonth() + 1);
  var day    = ensure_two_digits(date.getDate());
  var hour   = ensure_two_digits(date.getHours());
  var minute = ensure_two_digits(date.getMinutes());
  var second = ensure_two_digits(date.getSeconds());
  return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
};

httpserver.run(configs);