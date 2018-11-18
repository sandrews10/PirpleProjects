
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

var lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function(dir, file, data, callback){

	fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDesc){
		if(!err && fileDesc){

			var stringData = JSON.stringify(data);

			fs.writeFile(fileDesc, stringData, function(err){
				if(!err){
					fs.close(fileDesc, function(err){
						if(!err){
							callback(false);
						}else{
							callback('Error closing new file.');
						}
					});
				}else{
					callback('Error writing to new file');
				}
			});
		}else{
			callback('Could not create new file, it may already exist.');
		}
	});
};


lib.read = function(dir, file, callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8', function(err, data){

		if(!err && data){
			var parseData = helpers.parseJsonToObject(data);
			callback(false, parseData);
		}else{
			callback(err,data);
		}
	});
}

lib.update = function(dir, file, data, callback){

	fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDesc){
		if(!err && fileDesc){
			var stringData = JSON.stringify(data);

			fs.truncate(fileDesc, function(err){
				if(!err){
					fs.writeFile(fileDesc, stringData, function(){
						if(!err){
							fs.close(fileDesc, function(err){
								if(!err){
									callback(false);
								}else{
									callback('Error closing existing file');
								}
							});
						}else{
							callback('Error writing to file.');
						}
					});
				}else{
					callback('Error truncating file');
				}
			})
		}else{
			callback('Could not open the file for updating, it may not exist yet');
		}
	});
};

lib.delete = function(dir, file, callback){

	fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
		if(!err){
			callback(false)
		}else{
			callback('Error deleting file');
		}
	});
}


module.exports = lib;