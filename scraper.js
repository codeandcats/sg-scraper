var request = require('request').defaults({
	jar: true,
	gzip: true,
	'Accept-Language': 'en-US,en;q=0.8',
	headers: {
		'User-Agent': 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
	}
});
var cheerio = require('cheerio');
var constants = require('./constants.json');
var config = require('./config');
var fs = require('fs');
var path = require('path');
var linq = require('linq');
var utils = {
	file: require('./utils/file')
};

exports.scrapeAlbum = url => {
	return new Promise((resolve, reject) => {
		config.check()
			.then(settings => {
				console.log('Getting Home Page...');
				
				request(constants.urls.home, (err, response, body) => {
					if (err) {
						return reject('Error getting home page: ' + err);
					}
					
					console.log(`Success (${response.statusCode})`);
					
					var cookies = response.headers['set-cookie'].map(c => parseResponseCookie(c));
					
					var sessionId = linq.from(cookies).first(c => c.name == 'sessionid').value; 
					
					var $ = cheerio.load(body);
					
					var csrfToken = $('input[name=csrfmiddlewaretoken]').val();
					
					console.log('Logging in...');
					
					var options = {
						url: constants.urls.login,
						method: 'POST',
						formData: {
							csrfmiddlewaretoken: csrfToken,
							username: settings.credentials.username, 
							password: settings.credentials.password
						},
						headers: {
							Host: constants.urls.home.replace(/https{0,1}\:\/\//i, ''),
							Connection: 'keep-alive',
							Origin: constants.urls.home,
							Accept: '*/*',
							'X-Requested-With': 'XMLHttpRequest',
							'X-CSRFToken': csrfToken,
							Referer: constants.urls.home,
							//Cookie: `sessionid="${sessionId}"; csrftoken=${csrfToken}`,
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'Accept-Encoding': 'gzip, deflate',
							'Accept-Language': 'en-US,en;q=0.8'
						}
					};
					
					request(options, (err, response, body) => {
						if (err) {
							return reject('Error logging in: ' + err);
						}
						
						if (response.statusCode != 200 && response.statusCode != 201) {
							return reject(`Problem logging in. Returned ${response.statusCode}`);
						}
						
						console.log(`Success (${response.statusCode})`);
						
						console.log('Getting Album Page...');
					
						request(url, (err, response, body) => {
							if (err) {
								return reject('');
							}
							
							var $ = cheerio.load(body);
							
							var links = $('.album-container li.photo-container > a');
							
							var photoUrls = links.map((i, link) => $(link).attr('href'));
							
							if (!photoUrls.length) {
								return reject();
							}
							
							console.log('Success');
							
							var title = $('title');
							var re = /(.*?)Photo\sAlbum:\s(.*?)\s\|\sSuicideGirls/i; 
							var match = re.exec(title.text());
							
							var modelName = match[1].trim();
							var albumName = match[2].trim();
							
							console.log('Model: ', modelName);
							console.log('Album: ', albumName);
							
							var albumPath = path.join(settings.destinationPath, modelName, albumName);
							albumPath = utils.file.expandPath(albumPath);

							console.log('Saving to: ' + albumPath);
							
							utils.file.makeDirectory(albumPath)
								.then(() => {
									console.log(`Found ${photoUrls.length} Images`);
									
									var imagePromises = [];
									
									var downloadedCount = 0;
									var erroredCount = 0;
									
									for (var index = 0; index < photoUrls.length; index++) {
										var url = photoUrls[index];
										
										var fileName = path.join(albumPath, leadingZeros(index, 3) + ' - ' + path.basename(url));
										
										var imagePromise = saveToFile(url, fileName);
										
										imagePromise
											.then(file => {
												downloadedCount++;
												console.log(`Downloaded Image ${downloadedCount} of ${photoUrls.length}`);
											})
											.catch(err => {
												erroredCount++;
												console.log(`Download failed (${erroredCount} failures)`);
											});
										
										imagePromises.push(imagePromise);
									}
									
									Promise.all(imagePromises)
										.then(() => {
											resolve();
										})
										.catch(reject);
								})
								.catch(reject);
						});
					});
				});
			})
			.catch(reject);
	});
};

function parseResponseCookie(cookieStr) {
	var result = {
		name: '',
		value: ''
	};
	
	var inQuotes = false;
	var inName = true;
	
	for (var index = 0; index < cookieStr.length; index++) {
		var c = cookieStr[index];
		if (inName) {
			if (c == '=') {
				inName = false;
			}
			else {
				result.name += c;
			}
		}
		else {
			if (c == '"') {
				if (inQuotes) {
					break;
				}
				else {
					inQuotes = true;
				}
			}
			else if (c == ';' && !inQuotes) {
				break;
			} 
			else {
				result.value += c;
			}
		}
	}
	
	return result;
}

function saveToFile(url, fileName) {
	return new Promise((resolve, reject) => {
		try {
			var fileTitle = path.basename(fileName);
			
			var stream = request(url)
				.on('error', err => {
					console.error(err);
					reject(err);
				})
				//.on('data', chunk => {
				//	console.log(`Received ${chunk.length} bytes for ${fileTitle}`);
				//})
				//.on('response', response => {
				//	console.log(`Got response for ${fileTitle}`);
				//})
				.pipe(fs.createWriteStream(fileName));
			
			stream.on('finish', () => {
				resolve({
					url: url,
					fileName: fileName
				});
			});
		}
		catch (err) {
			reject(err);
		}
	});
}

function leadingZeros(num, width) {
	num = num.toString();
	return num.length >= width ? num : new Array(width - num.length + 1).join('0') + num;
}
