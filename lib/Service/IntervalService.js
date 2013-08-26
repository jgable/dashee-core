
var DasheeService = require("./Service");

var IntervalService = DasheeService.extend({
	getData: function (done) {
		// Fake async
		process.nextTick(function () {
			done(null, {});
		});
	},

	getDelay: function () {
		return this.config.interval || IntervalService.DEFAULTS.interval;
	},

	start: function (done) {
		var self = this,
			processData = function () {
				self.getData(function (err, data) {
					if (err) {
						self.emitError("Error trying to get data: " + err.message);
					} else {
						self.emitData(data);
					}

					if (!self.stopped) {
						setTimeout(processData, self.getDelay(data));
					}
				});
			};

		self.stopped = false;
		setTimeout(processData, self.getDelay(null));

		done(null, this);
	},

	stop: function () {
		this.stopped = true;
	}
});

IntervalService.DEFAULTS = {
	// 15 second interval by default
	interval: 15000
};

module.exports = IntervalService;