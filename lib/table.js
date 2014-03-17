/**
 * @class Table
 * @author Clément Désiles <main@jokester.fr>
 * @date 2014-03-10
 * @param {String} path
 * @description
 * Proxy rulz table
 */
'use strict';
var fs     = require('fs')
  , urlib  = require('url')
  , assert = require('assert')
  , Server = require('./server')

var Table = function (path) {
	var _path = path;
	var _table = {};
	var _servers = {};
	var self = this;

	/**
	 * Check the table path
	 * @return none
	 */
	function checkPath() {
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

	/**
	 * Parse the rule table
	 * @return none
	 */
	function parseTable() {
		var table = fs.readFileSync(_path);
		try {
			table = JSON.parse(table);
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

	/**
	 * On table rulz change, check & parse table,
	 * then update proxy servers.
	 * @param {String} evt - fs.Event
	 * @param {String} file - file path to table rulz
	 * @return none
	 */
	function watch(evt, file) {
		console.log('watch event:', evt, file);
		checkPath();
		parseTable();
		updateProxy();
	}

	/**
	 * Set-up / update proxy servers against
	 * requirements we got from the rulz ids.
	 * @return none
	 */
	function updateProxy() {
		// For each required port start a server
		var ports = [];
		var infos, tls, port;
		for (var id in _table) {
			infos = urlib.parse(id);
			tls = (infos.protocol === 'https:') ? true : false;
			port = infos.port || (tls ? '443' : '80');
			if (!_servers.hasOwnProperty(port)) {
				var server = new Server(self, port, tls);
				server.start();
				_servers[port] = server;
			}
			ports.push(port);
		}

		// Stop and remove server if not needed
		for (var port in _servers) {
			if (ports.indexOf(port) === -1) {
				_servers[port].stop();
				delete _servers[port];
			}
		}
	}

	/**
	 * Get the best match for rule
	 * @param {Object} req - HTTP.request
	 * @return {String} best rule to proxify
	 */
	this.getBestMatch = function(req, protocol) {
		var tmp;
		var score = 0;
		var url = protocol + req.headers.host + req.url;
		for (var id in _table) {
			for (var i = 0; i < id.length; i++) {
				var sub = id.substring(0, i + 1);
				if (url.indexOf(sub) !== 0) break;
			}
			if (i >= score) {
				score = i;
				tmp = id;
			}
		}
		return tmp ? _table[tmp] : null;
	}

	/**
	 * Go starting proxy servers
	 * @return none
	 */
	this.rulzit = function() {
		updateProxy();
	}

	// Check, parse and watch
	checkPath();
	parseTable();
	fs.watch(_path, { persistent: true }, watch);
};

module.exports = Table;