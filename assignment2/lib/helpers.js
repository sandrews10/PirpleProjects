var crypto = require('crypto');
var config = require('./config');

var helpers = {};


helpers.hash = function(str){
	if(typeof(str) == 'string' && str.length > 0){
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	}else{
		return false;
	}
};

helpers.parseJsonToObject = function(str){
	try{
		var obj = JSON.parse(str);
		return obj;
	}catch(e){
		return {};
	}
};

helpers.createRandomString = function(strlength){
	var strlength = typeof(strlength) == 'number' && strlength > 0 ? strlength : false;

	if(strlength){
		var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		var str = '';

		for(i = 1; i <= strlength; i++){
			var randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

			str+=randomChar;
		}

		return str;
	}else{	
		return false;
	}
};


module.exports = helpers;