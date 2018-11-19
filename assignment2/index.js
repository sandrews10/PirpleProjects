
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


var server = http.createServer(function(request,response){

	//Get URL and parse it
	var parsedURL = url.parse(request.url, true);

	//Get the path
	var path = parsedURL.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	//Get queryString Object
	var queryStringObj = parsedURL.query;

	//Get Method Used
	var method = request.method.toLowerCase();

	//Get Headers
	var headers = request.headers;

	//Get Payload
	var decoder = new StringDecoder('utf-8');
	var buffer = '';

	request.on('data', function(data){
		buffer += decoder.write(data);
	});

	request.on('end', function(){
		buffer += decoder.end();

		//Choose existing hnndler, else use Not Found Handler if not exist
		var chosenHander = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Data Obj
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObj' : queryStringObj,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)

		};

		//Route request accordingly
		chosenHander(data, function(statusCode, payload){
			//User given Status Code or default to Not Found
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			//Use given payload if available else no payload
			payload = typeof(payload) == 'object' ? payload : {};

			//Convert payload to string
			var payloadString = JSON.stringify(payload);

			//Return response
			response.writeHead(statusCode);
			response.end(payloadString);

			//Log the requested path
			console.log('Returning Response: ', statusCode, payloadString);
		});

	});

});



//Routes
var router = {
	'ping' : handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens
};


server.listen(config.port, function(){
	console.log('Server running on Port: '+ config.port + ' in the '+ config.envName + ' environment');
});
