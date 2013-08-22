
var _ = require('lodash');

function DasheeTheme(dashee, config) {
	this.dashee = dashee;
	this.config = _.defaults(config, DasheeTheme.DEFAULTS);
}

_.extend(DasheeTheme.prototype, {
	// Must provide, e.g. path.join(__dirname, "..", "views")
	viewRoot: null,

	// Must provide, e.g. [path.join(__dirname, "..", "assets")]
	assets: [],

	views: {
		'/': 'index'
	},

	load: function (done) {
		var self = this;

		// Check for a viewRoot and assets
		if (!this.viewRoot) {
			return done(new Error("Must provide a viewRoot"));
		} else if (!this.assets || (_.isArray(this.assets) && this.assets.length < 1)) {
			console.warn("No asset paths provided by theme.");
		}

		// Load my assets
		this.loadAssets(function (err) {
			if (err) { return done(err); }

			// TODO: Setup the server?

			// Register my routes
			self.registerViewRoutes();

			done();
		});
	},

	loadAssets: function (done) {
		if (!this.assets || this.assets.length < 1) {
			return process.nextTick(function () {
				done();
			});
		}

		this.dashee.addAssetPaths(this.assets, done);
	},

	registerViewRoutes: function () {
		var self = this,
			app = this.dashee.app;

		_.each(self.views, function (route, viewName) {
			app.get(route, function (req, res) {
				res.render(viewName);
			});
		});
	}

});

DasheeTheme.DEFAULTS = {

};

module.exports = DasheeTheme;