
var EventEmitter = require("events").EventEmitter;

var _ = require('lodash');

function DasheeService(dashee, config) {
	this.dashee = dashee;
	this.config = config;

	this.server = _.pick(dashee, "get", "post", "put");

	EventEmitter.call(this);
}

_.extend(DasheeService.prototype, EventEmitter.prototype);

_.extend(DasheeService.prototype, {
	start: function (done) {
		return done();
	},

	emitData: function (data) {
		this.emit("data", data);
	},

	emitError: function (message) {
		this.emit("error", message);
	}
});

module.exports = DasheeService;