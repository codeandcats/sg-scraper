var fs = require('fs');
var path = require('path');
var expandHomeDir = require('expand-home-dir');

function makeDirectory(directoryPath) {
	return new Promise((resolve, reject) => {
		
		function makeThisDirectory() {
			fs.stat(directoryPath, (err, stats) => {
				if (err || stats.isFile()) {
					fs.mkdir(directoryPath, err => {
						if (err) {
							reject(err);
						}
						else {
							resolve();
						}
					});
				}
				else {
					resolve();
				}
			});
		}
		
		var parentPath = path.dirname(directoryPath);
		
		if (parentPath) {
			fs.stat(parentPath, (err, stats) => {
				if (err || stats.isFile()) {
					makeDirectory(parentPath)
						.then(makeThisDirectory)
						.catch(reject);
				}
				else {
					makeThisDirectory();
				}
			});
		}
		else {
			makeThisDirectory();
		}
	});
}

function expandPath(filePath) {
	if (filePath.substr(0, 1) == '~') {
		filePath = path.join(expandHomeDir('~'), filePath.substr(1));
	}
	return filePath;
}

exports.makeDirectory = makeDirectory;
exports.expandPath = expandPath;
