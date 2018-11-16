//REQUEST HANDLERS


var _data = require('./data');
var helpers = require('./helpers');

//Define Handler
var handlers = {};

handlers.ping = function(data,callback){
	callback(200);
}

handlers.notFound = function(data,callback){
	//Not Found Handler
	callback(404);
};

handlers.users = function(data, callback){
	var acceptableMethods = ['get', 'post', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._users[data.method](data, callback);
	}else{
		callback(405);
	}
};


handlers._users = {};

handlers._users.get = function(data, callback){

};

handlers._users.post = function(data, callback){
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if(firstName && lastName && phone && password && tosAgreement){

		_data.read('users', phone, function(err, data){
			if(err){
				var hashedPassword = helpers.hash(password);
				
				if(hashedPassword){
					var userObject = {
						'firstName' : firstName,
						'lastName' : lastName,
						'phone' : phone,
						'hashedPassword' : hashedPassword,
						'tosAgreement' : true
					};

					_data.create('users', phone, userObject, function(err){
						if(!err){
							callback(200);
						}else{
							console.log(err);
							callback(500, {'Error' : 'Could not create the new user'});
						}
					});

				}else{
					callback(500, {'Error': 'Could not hash the user\'s password'});
				}

			}else{
				callback(400, {'Error' : 'A user with that phone number already exist'});
			}
		});

	}else{
		callback(400, {'Error': 'Missing required fields'});
	}

};

handlers._users.put = function(data, callback){

};

handlers._users.delete = function(data, callback){

};


module.exports = handlers;