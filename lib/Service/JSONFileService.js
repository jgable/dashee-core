
var _ = require("lodash");

var FileDataService = require("./FileDataService");

function JSONFileService(dashee, config) {
	FileDataService.call(this, dashee, config);
}

_.extend(JSONFileService.prototype, FileDataService.prototype);

_.extend(JSONFileService.prototype, {
	getData: function (done) {
		FileDataService.prototype.getData.call(this, function (err, contents) {
			if (err) { return done(err); }

			try {
				contents = JSON.parse(contents);
			} catch (e) {
				return done(e);
			}

			done(null, contents);
		});
	}
});

module.exports = JSONFileService;