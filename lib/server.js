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
	var self = this;

	this.port = port;
	this.table = table;
	this.tls = tls;
	this.protocol = (tls) ? 'https://' : 'http://';

	/**
	 * Send a 404 not found error to the client.
	 * @param {Object} req - HTTP.request
	 * @param {Object} res - HTTP.response
	 * @return none
	 */
	function send404(req, res) {
		var url = self.protocol + req.headers.host + req.url;
		res.statusCode = 404;
		res.write('Error 404: Document not found');
		res.end();
	}

	// Setup proxy
	this.proxy = httpProxy.createProxyServer();
	this.proxy.on('error', function (err, req, res) {
		if (err.code === 'ECONNREFUSED') {
			var remote = req.opts.target || req.opts.forward;
			var method = (req.opts.target) ? 'target' : 'forward';
			console.error('[error] unreachable', method + ':', remote);
		} else {
			console.error(err);			
		}
		return send404(req, res);
	});

	// Setup server
	var handle = (tls) ? https : http;
	this.server = handle.createServer(function (req, res) {
		var opts = self.table.getBestMatch(req, self.protocol);
		if (!opts) return send404(req, res);
		req.opts = opts;

		// Proxy-it
		self.proxy.web(req, res, opts);
	});
	this.server.on('error', function (err) {
		switch(err.code) {
			case 'EADDRINUSE':
				console.error('localhost:', port, ' already in use.');
				return process.exit(1);
			case 'EACCES':
				console.error('not allowed to bind on port', port);
				return process.exit(1);
			default:
				console.error('undefined error:', err.code);
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