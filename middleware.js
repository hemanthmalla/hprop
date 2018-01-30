'use strict';

var createNamespace = require('continuation-local-storage').createNamespace;
var ns = createNamespace('hprop');
var request = require('request');
var shimmer = require('shimmer');
var util = require('util');

var req_path = "";
for(var key in require.cache){
	console.log(key);
	if(key.includes("request/index.js")) {
		req_path = key;
		break;
	}
}

// Persists all headers that have a prefix of 'hprop-'
var persist_headers = function(req, ns){
	var headers = [];
	for(var header in req.headers){
		if(header.startsWith("hprop-")) headers[header] = req.headers[header];
	}
	ns.set('req_headers', headers);
};

var wrap = function(func, wrapper, ns){
	return wrapper(func, ns);
};

var inject_headers = function(original){
	return function () {
		var arg_0 = arguments['0'];
		var arg_type = typeof(arg_0);

		var options = {};
		if(arg_type == 'string') options['url'] = arg_0;
		else if(arg_type == 'object') options = arg_0;
		else return;

		if(options['headers'] == null) options['headers'] = [];
		var incoming_headers = ns.get('req_headers');

		for(var header in incoming_headers) options['headers'][header] = incoming_headers[header];
		arguments['0'] = options;

		return original.apply(this, arguments);
	}
};

var inject_request_module = function(ns){

	var request_funcs = ['get', 'head', 'options', 'post', 'put', 'patch', 'delete', 'del'];
	shimmer.wrap(require.cache[req_path], 'exports', inject_headers);
	for(var i=0; i<request_funcs.length; i++) shimmer.wrap(request, request_funcs[i], inject_headers);
}

module.exports = function(){

	return function(req, res, next){

		ns.bindEmitter(req);
		ns.bindEmitter(res);

		ns.run(function(){
			persist_headers(req, ns);
			inject_request_module(ns);
			next();
		})
	}
};
