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
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');
  //console.log(myDecoder.write(request_body));
  //console.log(request_body instanceof Buffer);
  send_response(request_body, {'Content-Type': content_type});
};

var do_submit = function (send_response, request_body, request_headers) {
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');
  console.log(myDecoder.write(request_body));
  //console.log(request_body instanceof Buffer);
  //send_response(request_body, {'Content-Type': content_type});
};


var do_read_all = function(){

};

var save_data = function(_nickname){         
            //var newMsg={"nickname":_nickname, "emoji":_emoji, "message":_message};
            
            var newMsg=_nickname.value;
            //把data 存回去
            $.ajax({  
                url: "addData.php",  
                type: "POST",
                data: { msg : newMsg },
                success: function(data){
                    if ( data == '1'){
                        alert('哎呀，好像有什麼東西出錯啦，請稍後再試。');
                    } else {
                        // do something if success 
                    }
                    
                } 
            });  
        
};

httpserver.run(configs);
