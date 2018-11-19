//REQUEST HANDLERS


var _data = require('./data');
var helpers = require('./helpers');

//Define Handler
var handlers = {};


//SERVER UP CHECK
handlers.ping = function(data,callback){
	callback(200);
}


//PAGE NOT FOUND NOTIFICATION
handlers.notFound = function(data,callback){
	//Not Found Handler
	callback(404);
};


//USER METHOD ACCEPTS & HANDLERS
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

	var phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
	if(phone){
		_data.read('users', phone, function(err, data){
			if(!err && data){
				delete data.hashedPassword;
				callback(200, data);	
			}else{
				callback(404);
			}
		});
	}else{
		callback(400, {'Error' : 'Missing required field(s)'});
	}
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
							callback(500, {'Error' : 'Missing required field(s)'});
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
		callback(400, {'Error' : 'Missing Required Field(s)'});
	}

};

handlers._users.put = function(data, callback){

	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;


	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	
	if(phone){

		if(firstName || lastName || password){
			_data.read('users', phone, function(err, userData){
				
				if(!err && userData){
					if(firstName){
						userData.firstName = firstName;
					}

					if(lastName){
						userData.lastName = lastName;
					}

					if(password){
						userData.hashedPassword = helpers.hash(password);
					}

					_data.update('users', phone, userData, function(err){
						if(!err){
							callback(200);
						}else{
							console.log(err);
							callback(500, {'Error' : 'Could not update the user'});
						}
					});

				}else{
					callback(400, {'Error' : 'The specified user does not exist'});
				}
			});

		}else{
			callback(400, {'Error' : 'Missing field(s) to update'});
		}

	}else{
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

handlers._users.delete = function(data, callback){
	var phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
	
	if(phone){
		_data.read('users', phone, function(err, data){
			if(!err && data){
				_data.delete('users', phone, function(err){
					if(!err){
						callback(200);
					}else{	
						callback(500, {'Error' : 'Could not delete specified user'});
					}
				});
			}else{
				callback(400, {'Error' : 'Could not find the specified user'});
			}
		});
	}else{
		callback(400, {'Error' : 'Missing required field(s)'});
	}	
};


//TGKENS METHOD ACCEPTS & HANDLERS

handlers.tokens = function(data, callback){
	
	var acceptableMethods = ['get', 'post', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._tokens[data.method](data, callback);
	}else{
		callback(405);
	}
};

handlers._tokens = {};

handlers._tokens.get = function(data, callback){

	var id = typeof(data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
	if(id){
		_data.read('tokens', id, function(err, data){
			if(!err && data){
				delete data.hashedPassword;
				callback(200, data);	
			}else{
				callback(404);
			}
		});
	}else{
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

handlers._tokens.post = function(data, callback){

	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if(phone && password){
		
		_data.read('users', phone, function(err, userData){

			if(!err && userData){

				var hashedPassword = helpers.hash(password);
				if(hashedPassword == userData.hashedPassword){

					var tokenId = helpers.createRandomString(20);
					var expires = Date.now() + 1000 * 60 * 60;

					var tokenObject = {
						'phone' : phone,
						'id': tokenId,
						'expires' : expires
					};

					_data.create('tokens', tokenId, tokenObject, function(err){

						if(!err){
							callback(200, tokenObject);
						}else{
							callback(500, {'Error' : 'Could not create new token'});
						}
					});

				}else{
					callback(400, {'Token denied' : 'Password does not matched the specified user\'s current credentials'});
				}
			}else{
				callback(400, {'Error' : 'Could not field the specified user'});
			}
		});

	}else{
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

handlers._tokens.put = function(data, callback){

};

handlers._tokens.delete = function(data, callback){

};


module.exports = handlers;