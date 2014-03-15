#!/usr/bin/env node
/*
 * @file proxy-server.js
 * @author Clément Désiles <brain@jokester.fr>
 * @date 2014-03-10
 * @licence MIT
 * Proxy tables rules parsing + proxy server
 */
'use strict';

var fs        = require('fs')
  , prog      = require('commander')
  , http      = require('http')
  , https     = require('https')
  , urlib     = require('url')
  , assert    = require('assert')
  , httpProxy = require('http-proxy')
  , pkg       = require('./package');

var DEFAULT_TABLE = __dirname + '/proxy-rules.json';

// Add infos to help menu
prog.on('--help', function () {
	console.log('	How-to use this proxy\n');
	console.log('		$ ./bin/proxy-server.js\n');
	console.log('	or if you installed it globaly\n');
	console.log('		$ proxy-server\n');
});

// Interprete CLI arguments
prog.version('Version ' + pkg.version + '\t© ' + pkg.author)
	.option('-t, --table <path>', 'proxy table path ', String, DEFAULT_TABLE)
	.option('-p, --port <port>', 'specify the proxy port [80]', Number, 80)
	.parse(process.argv);

/**
 * @class Table
 * Proxy table representation
 */
var Table = function(path) {
	var _path = path;
	var _table = {};

	function checkTable() {
		var exists = fs.existsSync(_path);
		if (!exists) {
			console.error('proxy table file not found');
			process.exit(1);
		}

		var stat = fs.statSync(_path);
		if (!stat.isFile()) {
			console.error('this is not a proxy table file');
			process.exit(1);
		}
	}

	function parseTable() {
		try {
			var table = require(_path);
			for (var id in table) {
				var rule = table[id];
				assert(typeof(id) === 'string', 'rule id must be string');
				assert(typeof(rule) === 'object', 'rule must be object');
				assert(rule.target || rule.forward, 'no target or forward rule');
			}
			_table = table;
		} catch (err) {
			console.error('Proxy table must be JSON formatted.');
			console.error('error report', err);
			process.exit(1);
		}
	}

	function watchTable(evt, file) {
		console.log('watch event:', evt, file);
		_path = file;
		checkTable();
		parseTable();
	}

	function getBestMatch(req, protocol) {
		var tmp;
		var score = 0;
		var url = urlib.parse(req.url);
		
		for (var id in _table) {
			for (var i in id) {
				var sub = id.substring(0, i + 1);
				if (req.url.indexOf(sub) !== 0) {
					break;
				}
			}
			if (i >= score) {
				tmp = id;
			}
		}
		return tmp ? _table[tmp] : null;
	}

	// Check, parse and watch
	checkTable();
	parseTable();
	fs.watch(prog.table, { persistent: true }, watchTable);
}

// Instanciate
var table = new Table(prog.table);

// HTTP Proxy server
var proxy = new httpProxy.createProxyServer();
var server = http.createServer(function (req, res) {
	var opts = table.getBestMatch(req);
	if (!opts) {
		// @TODO: optional funky 404 page
		console.log('not found', req.url);
		res.statusCode = 404;
		res.send('Error 404: Document not found');
	}

	// Proxy-it
	proxy.web(req, res, opts);

});

server.on('error', function (e) {
	switch(e.code){
		case 'EADDRINUSE':
			console.error('localhost:' + prog.port, ' already in use.');
			return process.exit(1);
		case 'EACCES':
			console.error('not allowed to bind on port', prog.port);
			return process.exit(1);
		default:
			console.error('cannot start server:', e.code);
			return process.exit(1);
	}
});

server.listen(prog.port, function() {
	console.log('proxy bound to port', prog.port);
});

