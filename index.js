#!/usr/bin/env node

var cli = require('commander');
var pkg = require('./package.json');
require('./commands/all');

cli
	.version(pkg.version)
	.parse(process.argv);

if (process.argv.length < 3) {
	cli.outputHelp();
	process.exit(0);
}