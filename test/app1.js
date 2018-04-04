var hprop = require('./../middleware.js');

// Required to be executed first, before any other library imports the request module into module cache.
hprop.init_hprop();

var express = require('express');

var MongoClient = require('mongodb').MongoClient;

var db = null;
MongoClient.connect('mongodb://localhost:27017/hprop_db', function(err, conn){
  if(err)console.log(err);
  else{
    console.log("connection to mongodb succesful via native client")
    db = conn;
  }
});

var insertDoc = function(collection, doc, callback){
  db.collection(collection).insertOne(doc,function(err,result){
    if(!err)callback(true);
    else{
      console.log("Mongo Error"+err);
      callback(false);
    }
  });
}


var app = express();
var router = express.Router()

router.use(hprop());

app.listen(3000, function () {
	console.log('App 1 listening on port 3000!');
});

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

	insertDoc("hprop_coll", {"hello": "hai"}, function(resp){
		console.log("Doc inserted " + resp);
		request(options, function (error, response, body) {
			if (error) console.log(error);
			else console.log(response.statusCode);
			res.sendStatus(200);
		});
	});
});

router.post("/test1", function(req, res, next){
	var options = { 
		method: 'POST',
		url: 'http://localhost:3001/test'
	};

	var request = require("request");

	setTimeout(function() {
		request(options, function (error, response, body) {
			if (error) console.log(error);
			res.sendStatus(200);
		});
	}, 5000)
});

app.use('/', router);