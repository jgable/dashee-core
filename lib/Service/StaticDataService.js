
var _ = require("lodash");

var IntervalService = require("./IntervalService");

var StaticDataService = IntervalService.extend({
	getData: function (done) {
		process.nextTick(function () {
			done(null, _.random(0, 10));
		});
	}
});

module.exports = StaticDataService;