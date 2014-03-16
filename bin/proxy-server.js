#!/usr/bin/env node
/*
 * @file proxy-server.js
 * @author Clément Désiles <main@jokester.fr>
 * @date 2014-03-10
 * @licence MIT
 * Proxy tables rulz parsing + proxy server
 */
'use strict';

var prog   = require('commander')
  , urlib  = require('url')
  , pkg    = require('../package')
  , Table  = require('../lib/table')

var DEFAULT_TABLE = process.cwd() + '/proxy-rules.json';

// Add infos to help menu
prog.on('--help', function () {
	console.log('   How-to use this proxy\n');
	console.log('       $ ./bin/proxy-server.js\n');
	console.log('   or if you installed it globaly\n');
	console.log('       $ proxy-server\n');
});

// Interprete CLI arguments
prog.version('Version ' + pkg.version + '\t© ' + pkg.author)
	.option('-t, --table <path>', 'proxy table path ', String, DEFAULT_TABLE)
	.parse(process.argv);

// Instanciate rulz table
var table = new Table(prog.table);

console.log('HTTP-PROXY-RULZ...\n\
██████╗ ██╗   ██╗██╗     ███████╗     ██╗████████╗██╗\n\
██╔══██╗██║   ██║██║     ╚══███╔╝     ██║╚══██╔══╝██║\n\
██████╔╝██║   ██║██║       ███╔╝█████╗██║   ██║   ██║\n\
██╔══██╗██║   ██║██║      ███╔╝ ╚════╝██║   ██║   ╚═╝\n\
██║  ██║╚██████╔╝███████╗███████╗     ██║   ██║   ██╗\n\
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝     ╚═╝   ╚═╝   ╚═╝');
console.log('rulz read from:', prog.table);
table.rulzit();