var express = require('express');
var request = require("request");

var app = express();

app.listen(3001, function () {
	console.log('App 2 listening on port 3001!');
});

app.post("/test", function(req, res, next){
	console.log(req.headers);
	res.sendStatus(200);
});