
var http = require('http'),
	url = require('url');

var _ = require('lodash');

var IntervalService = require("./IntervalService");

function HTTPService(dashee, config) {
	IntervalService.call(this, dashee, _.defaults(config, HTTPService.DEFAULTS));
}

_.extend(HTTPService.prototype, IntervalService.prototype);

_.extend(HTTPService.prototype, {
	getData: function (done) {
		var self = this;

		this.makeWebRequest(function (err, response, contents) {
			if (err) { return done(err); }

			var result = self.parseRequestContents(response, contents);

			done(null, result);
		});
	},

	makeWebRequest: function (done) {
		if (!this.config.url) {
			return done(new Error("Must provide a url in the configuration"));
		}

		var self = this,
			parsedUrl = url.parse(this.config.url),
			request = http.request({
				method: this.config.method,
				hostname: parsedUrl.hostname,
				port: parsedUrl.port,
				path: parsedUrl.path
			}, function (res) {
				res.setEncoding(self.config.encoding);
				res.on("data", function (chunk) {
					done(null, res, chunk);
				});
			});

		if (this.config.data) {
			if (_.isString(this.config.data)) {
				request.write(this.config.data);
			} else {
				request.write(JSON.stringify(this.config.data));
			}
		}

		request.on('error', function(err) {
			return done(err);
		});

		request.end();
	},

	parseRequestContents: function (response, contents) {
		if (_.isString(contents)) {
			contents = JSON.parse(contents);
		}

		return contents;
	}
});

HTTPService.DEFAULTS = {
	method: "GET",
	encoding: 'utf8'
};

module.exports = HTTPService;