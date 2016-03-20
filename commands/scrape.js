var cli = require('commander');
var scraper = require('../scraper');
var utils = {
	console: require('../utils/console')
};

cli
    .command('scrape <album-url>')
    .action(url => {
		scraper.scrapeAlbum(url)
			.then(() => utils.console.exit())
			.catch(utils.console.exit);
    });

