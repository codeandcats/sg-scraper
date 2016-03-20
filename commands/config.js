var cli = require('commander');
var chalk = require('chalk');
var config = require('../config');
var utils = {
	console: require('../utils/console')
};

cli
    .command('config')
    .option('-u, --username <username>')
    .option('-p, --password <password>')
    .option('-d, --destination <destination-path>')
    .action(command => {
		if (command.username || command.password || command.destination) {
			var newSettings = {
				credentials: {
					username: command.username,
					password: command.password
				},
				destinationPath: command.destination
			};
			
			updateConfig(newSettings)
				.then(() => {
					showConfig()
						.then(() => utils.console.exit())
						.catch(utils.console.exit);
				})
				.catch(utils.console.exit);
		}
		else {
			showConfig()
				.then(() => utils.console.exit())
				.catch(utils.console.exit);
		}
    });

function removeUndefinedValues(settings) {
	for (var name in settings) {
		if (!settings.hasOwnProperty(name)) {
			continue;
		}
		
		var value = settings[name];
		if (value == undefined) {
			delete settings[name];
		}
		else if (typeof value == 'object') {
			removeUndefinedValues(value);
		}
	}
}

function updateConfig(newSettings) {
	return new Promise((resolve, reject) => {
		config.get().then(settings => {
			removeUndefinedValues(newSettings);
			
			settings.credentials.username = newSettings.credentials.username || settings.credentials.username || '';
			settings.credentials.password = newSettings.credentials.password || settings.credentials.password || '';
			settings.destinationPath = newSettings.destinationPath || settings.destinationPath || '';
			
			config.set(settings)
				.then(() => {
					console.log('');
					console.log('Updated Settings');
					resolve();
				})
				.catch(reject);
		})
		.catch(reject);
	});
}

function showConfig(settings) {
	return new Promise((resolve, reject) => {
		function show(settings) {
			console.log('');
			console.log('Settings:\n');		
			console.log('  Username:    ', settings.credentials.username || '');
			console.log('  Password:    ', settings.credentials.password || '');
			console.log('  Destination: ', settings.destinationPath || '');
			console.log('');
			resolve();
		}
		
		if (settings) {
			show(settings);
		}
		else {
			config.get().then(show, reject);
		}
	});
}
