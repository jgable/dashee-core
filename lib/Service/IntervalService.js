
var _ = require("lodash");

var DasheeService = require("./Service");

function IntervalService(dashee, config) {
	DasheeService.call(this, dashee, config);
}

_.extend(IntervalService.prototype, DasheeService.prototype);

_.extend(IntervalService.prototype, {
	getData: function (done) {
		// Fake async
		process.nextTick(function () {
			done(null, {});
		});
	},

	getDelay: function () {
		return this.config.interval || 5000;
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

module.exports = IntervalService;