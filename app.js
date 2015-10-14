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
  set_handler('POST /refresh', do_refresh);
  set_handler('POST /register', do_register);
  set_handler('POST /query', do_query);
  set_handler('POST /showOnly', showOnly);
  set_handler('POST /list',do_sendList);
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
  _Jobj.time_stp = Math.floor( (date)/1000 ); 
  save_data(_Jobj,'data.db');
  request_body = new Buffer(JSON.stringify(_Jobj));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};


//這是針對submit這個request的function
var do_submit = function (send_response, request_body, request_headers) {
  var _success  = true;   //有沒有成功
  var _nicError = false;  //mickname有沒有error
  var _msgError = false;  //message有沒有error
  var _emjError = false;
  
  var _Jobj = Buffer_to_JSON(request_body);
  if (_Jobj==false){
    _ret={ok:false,reason:"Input syntax isn't in JSON format"};
    request_body = new Buffer(JSON.stringify(_ret)+'\n');
    var content_type_default = 'application/octet-stream';
    var content_type = request_headers['content-type'] || content_type_default;
    send_response(request_body, {'Content-Type': content_type});
    return;
  }
  var date = new Date();
  _Jobj.time_stp = Math.floor( (date)/1000 );
  if ( (_Jobj.nickname.length==0)||(!/^[a-z0-9]{3,10}$/.test(_Jobj.nickname)) ){
    _success  = false;
    _nicError = true;
  }
  if (_Jobj.message.length==0){
    _success  = false;
    _msgError = true;
  }
  if (_Jobj.emoji.length==0||(!/^[0-4]$/.test(_Jobj.emoji)) ){
    _success  = false;
    _emjError = true;
  }
  var _ret;
  if (_success){
    _ret={ok:true};
    save_data(_Jobj,'data.db');
  }
  else{
    var _reason = "";
    if (_nicError)  _reason += " you must provide a valid nickname. ";
    if (_msgError)  _reason += " you must provide a valid message. ";
    if (_emjError)  _reason += " you must provide a valid emoji. ";
    _ret={
      ok:false,
      reason:_reason
    }
  }
  request_body = new Buffer(JSON.stringify(_ret)+'\n');
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

var do_refresh = function(send_response, request_body, request_headers){
  //console.log(DataBase);
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(new Buffer(JSON.stringify(DataBase)), {'Content-Type': content_type});
};

var do_register = function (send_response, request_body, request_headers) {
  /*read_user(function(err, data){
      UserData = Buffer_to_JSON(data);
  });*/
  var _ret;
  var success = true;
  var _usrError = false;
  var _pwdError = false;
  
  var _Jobj = Buffer_to_JSON(request_body);
  if (_Jobj==false){
    _ret={ok:false,reason:"Input syntax isn't in JSON format"};
    request_body = new Buffer(JSON.stringify(_ret)+'\n');
    var content_type_default = 'application/octet-stream';
    var content_type = request_headers['content-type'] || content_type_default;
    send_response(request_body, {'Content-Type': content_type});
    return;
  }
  
  for (i=0; i<UserData.length; i++){
    if ( (UserData[i][0]==_Jobj.nickname)){
        _usrError = true;
        success = false;
    }
  }
  if (typeof(_Jobj.password)!='string'){
    _pwdError = true;
    success   = false;
  }
  
  if(success){
    save_data(_Jobj,'user.db');
    _ret={ok:true};
  }
  else{
    var _reason = "";
    if (_usrError)  _reason += " The username is already exist. " + '\n';
    if (_pwdError)  _reason += " The length of password can't be zero. " + '\n';
    _ret={
      ok:false,
      reason:_reason
    };
  }
  request_body = new Buffer(JSON.stringify(_ret));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};

var do_query = function (send_response, request_body, request_headers) {
  var _Jobj = Buffer_to_JSON(request_body);
  var success   = false;
  var _pwdError = false;
  for (i=0; i<UserData.length; i++){
    if (UserData[i][0]==_Jobj.nickname){
      if(UserData[i][1]==_Jobj.password)
        success = true;
      else{
        _pwdError = true;
        break;
      }
    }
  }
  var _ret={ok:success,reason:""};
  if (_pwdError) _ret.reason += "The password isn't correct! ";
  else if (!success) _ret.reason += "Please sign up first! ";
  request_body = new Buffer(JSON.stringify(_ret));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};

var showOnly = function (send_response, request_body, request_headers) {
  
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');    
  var _specifyName = myDecoder.write(_buffer);
  
  var _ret =[];
  for (i=0; i<DataBase.length; i++)
    if(DataBase[i][0]==_specifyName)
      _ret[_ret.length] = DataBase[i];
  
  request_body = new Buffer(JSON.stringify(_ret));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};

var do_sendList = function(send_response, request_body, request_headers){
  var _ret =[];
  for (i=0; i<UserData.length; i++)
      _ret[_ret.length] = UserData[i][0];
  request_body = new Buffer(JSON.stringify(_ret));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};

var Buffer_to_JSON = function(_buffer){
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');    
  var _Jstring = myDecoder.write(_buffer);
  try {
    var o = JSON.parse(_Jstring);
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  }
  catch (e) { }
  return false;
  //return JSON.parse(_Jstring);
};


var fs = require('fs');

// begin of data.db
var DataBase;  //用來存data.db的資料的
function read_data(callback){
  fs.readFile('data.db', function (err, data) {
        if (err) return callback(err);
        callback(null, data);
    })
};
read_data(function(err, data){
  DataBase = Buffer_to_JSON(data);
  //console.log(DataBase.length);
});
//上面這個function就是把資料讀出來


// end of data.db

//begin register
var UserData;
function read_user(callback){
  fs.readFile('user.db', function (err, data) {
        if (err) return callback(err);
        callback(null, data);
    })
};
read_user(function(err, data){
  UserData = Buffer_to_JSON(data);
  //console.log(DataBase.length);
});

var save_data = function(_obj, target_fileName){
  if (target_fileName=='data.db'){
    var array_obj = [_obj.nickname, _obj.emoji, _obj.message, _obj.time_stp];
    DataBase[DataBase.length] = array_obj;
    fs.writeFile('data.db',new Buffer(JSON.stringify(DataBase)),function(err){
      if (err) throw err;
      console.log('append success!');
    });
    return;
  }
  else if (target_fileName=='user.db'){
    var array_obj = [_obj.nickname, _obj.password];
    UserData[UserData.length] = array_obj;
    fs.writeFile('user.db',new Buffer(JSON.stringify(UserData)),function(err){
      if (err) throw err;
      console.log('register success!');
    });
    return;
  }
  
};

//end register

httpserver.run(configs);