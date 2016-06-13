const fs = require ('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require ('http').Server(app);
const io = require ('socket.io').listen(http);
const logger = require('morgan');
const bodyParser = require('body-parser');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname + '/public/index.html');
app.get('/', function (req, res) {
	res.status(200);
  res.sendfile(__dirname + '/public/index.html');
});
app.all('/torque/upload_data.php', function(req,res) {
	console.log(req.method, req.body, req.headers);
	res.headers = {"conent-type":"text/html; charset=UTF-8"};
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
http.listen(4000, function(){
	console.log('Application running!\nListening on port 4000');
});

