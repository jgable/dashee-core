var fs = require('fs');

var IntervalService = require("./IntervalService");

var FileDataService = IntervalService.extend({
	getData: function (done) {
		fs.readFile(this.config.filePath, function (err, contents) {
			if (err) { return done(err); }

			done(null, contents.toString());
		});
	}
});

module.exports = FileDataService;