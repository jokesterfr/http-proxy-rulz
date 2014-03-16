/*
 * @Class Server
 * @author Clément Désiles <main@jokester.fr>
 * @date 2014-03-10
 * @licence MIT
 * Generic HTTP(S) server to use as a proxy
 */
'use strict';

var http = require('http')
  , https = require('https')
  , httpProxy = require('http-proxy');

var Server = function(table, port, tls) {
	this.proxy = httpProxy.createProxyServer();
	this.port = port;

	var handle = (tls) ? https : http;
	this.server = handle.createServer(function (req, res) {
		var opts = table.getBestMatch(req);
		if (!opts) {
			// @TODO: optional funky 404 page
			console.log('not found', req.url);
			res.statusCode = 404;
			res.send('Error 404: Document not found');
		}

		// Proxy-it
		this.proxy.web(req, res, opts);
	});

	this.server.on('error', function (e) {
		switch(e.code) {
			case 'EADDRINUSE':
				console.error('localhost:', port, ' already in use.');
				return process.exit(1);
			case 'EACCES':
				console.error('not allowed to bind on port', port);
				return process.exit(1);
			default:
				console.error('cannot start server:', e.code);
				return process.exit(1);
		}
	});
}

/**
 * Start proxying requests
 * @return none
 */
Server.prototype.start = function() {
	var self = this;
	self.server.listen(self.port, function() {
		console.log('proxy up on port', self.port);
	});
};

/**
 * Stop proxying requests
 * @return none
 */
Server.prototype.stop = function() {
	var self = this;
	self.server.close(function() {
		console.log('proxy down on port', self.port);
	});
};

module.exports = Server;