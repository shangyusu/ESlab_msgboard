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
  //這裡我增加兩個handler，針對read_all submit
  //這樣從terminal 送出這兩種request 我們才有辦法有相對的response
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
// 這邊送進do_echo的request_body是一個buffer，buffer的內容是剛剛被stringify的JSON物件
// 使用Buffer_to_JSON這個我自己寫的function把buffer變成JSON的物件
// 這個剛送進來的物件本身的timestamp是一個空stirng，所以要把正確的timestamp加上去
// save_data timestamp_str 也是function，下面有說明
// 再把已經附上timestamp的JSON物件stringify後轉成buffer送給responder
// (這裡的send_response就是httpserver.js裏面的responder，trace一下code就可以明白)
var do_echo = function (send_response, request_body, request_headers) {
  
  var _Jobj = Buffer_to_JSON(request_body);
  var date = new Date();
  _Jobj.time_stp = (date)/1000; 
  save_data(_Jobj);
  // 因為要儲存data.db的timestamp格式和要再網頁上看到的格式不同，所以會有兩種obj
  // 不過我在想之後如果要能夠從data.db資料庫更新的話應該是要直接送unix time(in second)到前端再轉換會比較方便
  var _RetJobj = Buffer_to_JSON(request_body);
  _RetJobj.time_stp = timestamp_str(date);
  var _RetJstring = JSON.stringify(_RetJobj);
  request_body = new Buffer(_RetJstring);
  
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};


//這是針對submit這個request的function
var do_submit = function (send_response, request_body, request_headers) {
  var _success  = true;   //有沒有成功
  var _nicError = false;  //mickname有沒有error
  var _msgError = false;  //message有沒有error
  var _Jobj = Buffer_to_JSON(request_body);
  var date = new Date();
  _Jobj.time_stp = (date)/1000;
  if (_Jobj.nickname.length==0 || /^[a-z0-9]{3,10}$/.test(_Jobj.nickname))
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

//直接把data.db的東西全部送出去
var do_read_all = function(send_response, request_body, request_headers){
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(new Buffer(JSON.stringify(DataBase)), {'Content-Type': content_type});
};

var Buffer_to_JSON = function(_buffer){
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');    
  var _Jstring = myDecoder.write(_buffer);
  return JSON.parse(_Jstring);
};


var fs = require('fs');

var DataBase;  //用來存data.db的資料
function read_data(callback)
{
  fs.readFile('data.db', function (err, data) {
        if (err) return callback(err);
        callback(null, data);
    })
}
read_data(function(err, data){
  DataBase = Buffer_to_JSON(data);
  //console.log(DataBase.length);
});
//上面這個function就是把資料讀出來

var save_data = function(_obj)
{
  DataBase[DataBase.length] = _obj;
  fs.writeFile('data.db',new Buffer(JSON.stringify(DataBase)),function(err){
    if (err) throw err;
    console.log('append success!');
  });
};

// 將data的物件轉換成 yyyy/mm/dd hh:mm:ss 的string
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