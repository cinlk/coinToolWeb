var express = require('express');
var app = express();
 
app.use('/', express.static('dist'));
 
app.get('/', function (req, res) {
//    res.send('Hello World');
    res.sendFile( __dirname + "/dist/" + "index.html" );
})
 
var server = app.listen(8001, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
