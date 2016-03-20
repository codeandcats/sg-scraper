var chalk = require('chalk');

exports.exit = err => {
	if (err) {
		console.error(chalk.red(err.message || err));
		if (err.stack) {
			console.error('');
			console.error(chalk.red(err.stack));
		}
		process.exit(1);
		return;
	}
	process.exit(0);
};
