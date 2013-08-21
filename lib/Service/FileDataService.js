var fs = require('fs');

var _ = require('lodash');

var IntervalService = require("./IntervalService");

function FileDataService(dashee, config) {
	IntervalService.call(this, dashee, config);
}

_.extend(FileDataService.prototype, IntervalService.prototype);

_.extend(FileDataService.prototype, {
	getData: function (done) {
		fs.readFile(this.config.filePath, function (err, contents) {
			if (err) { return done(err); }

			done(null, contents.toString());
		});
	}
});

module.exports = FileDataService;