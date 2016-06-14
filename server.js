const fs = require ('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require ('http').Server(app);
const io = require ('socket.io').listen(http);
const logger = require('morgan');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://torque:cwY5uP9eUdj2@localhost:27017/torque');

var keySchema = mongoose.Schema({
	"id" : String,
	"Device ID": String
});
keySchema.methods.isEqual = function(id) {
	return this.id == id;
}
var torqueKeys = mongoose.model("keys", keySchema);

torqueKeys.find(function (err, key) {
  if (err) return console.error(err);
  console.log(key);
})

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
	console.log(JSON.stringify(req.query, undefined, 2));
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

