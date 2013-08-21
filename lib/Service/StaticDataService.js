
var _ = require("lodash");

var IntervalService = require("./IntervalService");

function StaticDataService(dashee, config) {
	IntervalService.call(this, dashee, config);
}

_.extend(StaticDataService.prototype, IntervalService.prototype);

_.extend(StaticDataService.prototype, {
	getData: function (done) {
		process.nextTick(function () {
			done(null, _.random(0, 10));
		});
	}
});

module.exports = StaticDataService;