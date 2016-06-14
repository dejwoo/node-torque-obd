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
		"id": String
		"description" : String,
		"value": {},
	}]
});
var torqueKeys = mongoose.model("keys", keySchema);
var torqueLogs = mongoose.model("logs", logSchema);
torqueKeys.find(function (err, keys) {
  if (err) return console.error(err);
  console.log(keys);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname + '/public/index.html');
app.get('/', function (req, res) {
	res.status(200);
  res.sendfile(__dirname + '/public/index.html');
});
app.all('/upload', function(req,res) {
	let user, torqueId, timestamp, data;
	data = [];
	_.forOwn(req.query, function(value, key) {
		torqueKeys.find({"id":key}, function(err, response) {
			if (response.length > 1) {
				console.error("Duplicit key found");
			} else {
				var resData = response[0];
				switch (resData['Device ID']) {
					case "userEmail":
						user = value;
						break;
					case "Timestamp":
						time = value;
						break;
					case "Torque ID":
						torqueId = value;
						break;
					default:
						let dataObj = {};
						dataObj.id = resData['id'];
						dataObj.description = resData['Device ID'];
						dataObj.value = value;
						data.push(dataObj);
				}
			}
		});
	});
	torqueLogObj = {"user":user, "torqueId":torqueId, "timestamp":timestamp, "data": data};
	console.log(JSON.stringify(torqueLogObj, undefined, 2));
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

