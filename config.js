var jsonFile = require('jsonFile');
var path = require('path');
var pkg = require('./package.json');
var fs = require('fs');
var utils = {
	file: require('./utils/file')	
};

var appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');

var fileName = path.join(appDataPath, pkg.name, 'config.json');

exports.get = () => {
	return new Promise((resolve, reject) => {
		var defaultValue = {
			credentials: {
				username: '',
				password: ''
			},
			destinationPath: ''
		};
		
		fs.stat(fileName, (err, stat) => {
			if (err) {
				return resolve(defaultValue);
			}
			
			jsonFile.readFile(fileName, (err, obj) => {
				if (err) {
					return reject(err);
				}
				
				return resolve(obj);
			});
		});
	});
};

exports.check = () => {
	return new Promise((resolve, reject) => {
		exports.get()
			.then(settings => {
				if (!settings.credentials.username || !settings.credentials.password) {
					return reject('Credentials have not been set yet. See usage to set them up.');
				}
				
				if (!settings.destinationPath) {
					return reject('Destination has not been set yet. See usage to set it.');
				}
				
				resolve(settings);
			})
			.catch(reject);
	});
};

exports.set = obj => {
	return new Promise((resolve, reject) => {
		utils.file.makeDirectory(path.dirname(fileName))
			.then(() => {
				jsonFile.writeFile(fileName, obj, err => {
					if (err) {
						return reject(err);
					}
					
					return resolve();
				});
			})
			.catch(reject);
	});
};
