var assert = require('assert');
var http = require('http');

var DEFAULT_PORT = 2015;
var DEFAULT_HOSTNAME = '127.0.0.1';

var srv = http.createServer();
var port = DEFAULT_PORT;
var hostname = DEFAULT_HOSTNAME;
var reqhandlers = {};

var timestamp_str = function () {
  var ensure_two_digits = function (num) {
    return (num < 10) ? '0' + num : '' + num; };
  var date   = new Date();
  var year   = date.getFullYear();
  var month  = ensure_two_digits(date.getMonth() + 1);
  var day    = ensure_two_digits(date.getDate());
  var hour   = ensure_two_digits(date.getHours());
  var minute = ensure_two_digits(date.getMinutes());
  var second = ensure_two_digits(date.getSeconds());
  return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
};

var port_setter = function (iport) {
  assert(typeof iport === 'number');
  assert(1 <= iport && iport <= 65535);
  port = iport;
};

var hostname_setter = function (ihostname) {
  assert(typeof ihostname === 'string');
  hostname = ihostname;
};

var handler_setter = function (method_and_path, reqhandler) {
  assert(typeof method_and_path === 'string');
  assert(typeof reqhandler === 'function');
  reqhandlers[method_and_path] = reqhandler;
};

var do_respond_to_an_HTTP_request = function (req, res) {
  var reqmethod = req.method;
  var requrl = req.url;
  var reqheaders = req.headers;
  var reqbody = new Buffer(0);
  req.on('data', function (chunk) {
    //var StringDecoder = require('string_decoder').StringDecoder;
    //var myDecoder = new StringDecoder('utf8');
    //console.log(myDecoder.write(chunk));
    assert(chunk instanceof Buffer);
    reqbody = Buffer.concat([reqbody, chunk]);
  });

  req.on('end', function () {

    var pattern = reqmethod + ' ' + requrl;
    
    var responder = function (respbody, respheaders) {
      assert(respbody instanceof Buffer);
      assert(!respheaders || typeof respheaders === 'object');
      if (respheaders)
        for (var header_name of Object.keys(respheaders))
          res.setHeader(header_name, respheaders[header_name]);
      res.write(respbody);
      res.end();
    };
    var responder_echo = function (respbody, respheaders) {
      assert(respbody instanceof Buffer);
      assert(!respheaders || typeof respheaders === 'object');
      if (respheaders)
        for (var header_name of Object.keys(respheaders))
          res.setHeader(header_name, respheaders[header_name]);
      var StringDecoder = require('string_decoder').StringDecoder;
      var myDecoder = new StringDecoder('utf8');
      //var _Jstring = myDecoder.write(respbody);
      //console.log(myDecoder.write(respbody));
      res.write(respbody);
      //res.write(new Buffer('text',"utf8"));
      res.end();
    };
    console.log(req.connection.remoteAddress + ' ' + timestamp_str() +
                ' >>>> "' + pattern + '"');
    if (typeof reqhandlers[pattern] === 'function')
    {
      //if (pattern=='POST /echo')
      //  reqhandlers[pattern](responder_echo, reqbody, reqheaders);
      //else
        reqhandlers[pattern](responder, reqbody, reqheaders);
    }
      
    else {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.write(new Buffer('We cannot handle your request.\n'));
      res.end();
    }

  });
};

var stop_accepting_new_connections = function () {
  console.log('');
  console.log('* SIGINT (CTRL-C) detected.');
  console.log('* The HTTP server will be stopped...');
  srv.close();
};

var stop_this_process = function () {
  console.log('');
  console.log('* SIGINT (CTRL-C) detected more than once.');
  console.log('* Force quit this Node.js program...');
  process.exit(0);
};

var SIGINT_handled = false;

process.on('SIGINT', function () {
  if (SIGINT_handled)
    return stop_this_process();
  SIGINT_handled = true;
  stop_accepting_new_connections();
});

srv.on('request', do_respond_to_an_HTTP_request);

srv.on('listening', function () {
  console.log('* The HTTP server at http://%s:%d/ is up.', hostname, port);
});

srv.on('close', function () {
  console.log('* The HTTP server has been stopped completely.');
});

srv.timeout = 2000;

exports.run = function (configs) {
  configs(port_setter, hostname_setter, handler_setter);
  srv.listen(port, hostname);
};