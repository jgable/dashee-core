
var FileDataService = require("./FileDataService");

var JSONFileService = FileDataService.extend({
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