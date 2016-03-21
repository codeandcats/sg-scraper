var cli = require('commander');
var scraper = require('../scraper');
var utils = {
	console: require('../utils/console')
};
var clipBoard = require('copy-paste');

cli
    .command('scrape [album-url]')
    .action(url => {
		if (!url) {
			clipBoard.paste((err, text) => {
				if (!err && isValidUrl(text)) {
					scrape(text);
				}
				else {
					utils.console.exit('Url required as argument or in clipboard.');
				}
			});
		}
		else {
			scrape(url);
		}
    });

function scrape(url) {
	scraper.scrapeAlbum(url)
		.then(() => utils.console.exit())
		.catch(utils.console.exit);
}

function isValidUrl(url) {
	return (url || '').match(/(https:\/\/){0,1}www.suicidegirls.com\/.*/i);
}