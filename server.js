const fs = require ('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require ('http').Server(app);
const io = require ('socket.io').listen(http);
const logger = require('morgan');
const bodyParser = require('body-parser');
const _ = require('lodash');
var mongoose = require('mongoose');
mongoose.connect('mongodb://torqueLogger:cwY5uP9eUdj2@localhost:27017/torque', function (err) {
	if (err) {
		console.log(err);
	}
});

var keySchema = mongoose.Schema({
	"id" : String,
	"Device ID": String
});
var logSchema = mongoose.Schema({
	"user": String,
	"torqueId": String,
	"timestamp": Number,
	"data": [{
		"id": String,
		"description" : String,
		"value": {},
	}]
});
var torqueKeys = mongoose.model("keys", keySchema);
var torqueLogs = mongoose.model("logs", logSchema);
torqueKeys.find(function (err, keys) {
  if (err) return console.error(err);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
	res.status(200);
  res.sendfile(__dirname + '/public/index.html');
});
app.all('/upload', function(req,res) {
	var user, torqueId, timestamp, data;
	data = [];
	var resLen = _.size(req.query);
	var resIn = 0;
	_.forOwn(req.query, function(value, key) {
		torqueKeys.find({"id":key}, function(err, response) {
			resIn++
			if (_.isEmpty(response)) {
				console.error("Unkown key["+key+"] with value["+value+"] registered");
				return;
			}
			if (response.length > 1) {
				console.error("Duplicit key found");
			} else {
				var resData = response[0];
				switch (resData['Device ID']) {
					case "userEmail":
						user = value;
						break;
					case "Timestamp":
						timestamp = value;
						break;
					case "Torque ID":
						torqueId = value;
						break;
					default:
						var dataObj = {};
						dataObj.id = resData['id'];
						dataObj.description = resData['Device ID'];
						dataObj.value = value;
						data.push(dataObj);
						break;
				}
			}
			if (resIn == resLen) {
				putDataToDB();
			}
		});
	});
	function putDataToDB() {
		torqueLogObj = {"user":user, "torqueId":torqueId, "timestamp":timestamp, "data": data};
		logToSave = new torqueLogs(torqueLogObj);
		logToSave.save(function(err) {
			if (err) {
				console.error(err);
			}
		});
		io.sockets.emit('data', torqueLogObj);
	}
	res.headers = {"conent-type":"text/html; charset=UTF-8"};
	res.status(200);
	res.send('OK!');
});
//error not found
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
//if dev show stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.json({
			message: err.message,
			error: err
		});
	});
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		message: err.message,
		error: {}
	});
});
http.listen(8080, function(){
	console.log('Application running!\nListening on port 8080');
});

io.on ('connection', function (socket) {
  var re_addr = socket.request.connection.remoteAddress+':'+socket.request.connection.remotePort;
  var hndsh = socket.handshake, date = new Date ();
  console.log ('-- Client '+re_addr+' connected ['+socket.nsp.name+'] on '+ date + ' --');
  console.log ('  sockID = '+socket.id+ '  htmlcookie = ', hndsh.headers.cookie);
  console.log ('  Total server clients = '+ socket.conn.server.clientsCount);
  torqueLogs.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function (err, log) {
  	console.log("log");
  	socket.emit('data', log);
  })
  socket.on ('disconnect', function () {
    console.log ('-- Client '+re_addr+' disconnected ['+socket.nsp.name+'] --');
    console.log ('  Total server clients = '+ socket.conn.server.clientsCount);
  });
});
