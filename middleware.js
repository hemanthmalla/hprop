'use strict';

var domain = require('domain');
var request = require('request');
var util = require('util');

// Persists all headers that have a prefix of 'hprop-'
var persist_headers = function(req){
	var headers = [];
	for(var header in req.headers){
		if(header.startsWith("hprop-")) headers[header] = req.headers[header];
	}
	process.domain.req_headers = headers;
};

// Modify the original function in the library.
var wrap = function(lib, func_name, wrapper){
	var original = lib[func_name];
	var wrapped = wrapper(original);

	// Adding the attributes of original function.
	for(var key in original) wrapped[key] = original[key];
	lib[func_name] = wrapped;
	return wrapped;
};

var inject_headers = function(original){
	return function () {
		var arg_0 = arguments['0'];
		var arg_type = typeof(arg_0);

		// Prepare params for outgoing HTTP request
		// Request module supports different first arguments, can be string or object
		var options = {};
		if(arg_type == 'string') options['url'] = arg_0;
		else if(arg_type == 'object') options = arg_0;
		else return;

		if(options['headers'] == null) options['headers'] = [];
		var incoming_headers = process.domain ? process.domain.req_headers : {};

		for(var header in incoming_headers) options['headers'][header] = incoming_headers[header];
		arguments['0'] = options;

		return original.apply(this, arguments);
	}
};

var inject_request_module = function(){

	// Required to get a handle of request module's base object, so that the function
	// exported by default can be shimmed.
	var request_path = require.resolve("request");
	var request_funcs = ['get', 'head', 'options', 'post', 'put', 'patch', 'delete', 'del'];
	wrap(require.cache[request_path], 'exports', inject_headers);
	for(var i=0; i<request_funcs.length; i++) wrap(require.cache[request_path]['exports'], request_funcs[i], inject_headers);
}

module.exports = function(){

	return function(req, res, next){
		var d = domain.create();
		d.add(req);
		d.add(res);

		d.run(() => {
		  persist_headers(req);
		  next();
		});
	}
};

module.exports.init_hprop = inject_request_module
