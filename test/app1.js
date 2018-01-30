var express = require('express');
var hprop = require('./../middleware.js')


var app = express();
var router = express.Router()

app.listen(3000, function () {
	console.log('App 1 listening on port 3000!');
});

router.use(hprop());

var req_path = "";
for(var key in require.cache){
	if(key.includes("request/index.js")) {
		req_path = key;
		break;
	}
}

router.post("/test", function(req, res, next){
	var options = { 
		method: 'POST',
		url: 'http://localhost:3001/test',
		headers : {
			'hprop-cart' : 'v1',
			'hprop-auth' : 'v4'
		}
	};

	var request = require("request");
	request(options, function (error, response, body) {
		if (error) console.log(error);
		res.sendStatus(200);
	});
});

app.use('/', router);