
var _ = require('lodash'),
	request = require('request');

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

		request({
			method: this.config.method,
			uri: this.config.url,
			json: true
		}, done);
	},

	parseRequestContents: function (response, contents) {
		return contents;
	}
});

HTTPService.DEFAULTS = {
	method: "GET"
};

module.exports = HTTPService;