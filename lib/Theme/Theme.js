
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

			// Cannot register routes yet because the server is not running
			// Cannot register views root yet either

			done(null, this);
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
			app = this.dashee,
			pageData = this.config.pageData || {},
			setBlocksHtml = function (req, res, next) {
				app.getBlocksHtml(function (err, renderedBlocks) {
					if (err) { throw err; }

					res.locals = _.extend(res.locals || {}, {
						blocks: renderedBlocks
					});

					next();
				});
			},
			setAssets = function (req, res, next) {
				app.getAssetsPaths(function (err, assetsPaths) {

					res.locals = _.extend(res.locals || {}, {
						assets: function (path) {
							return assetsPaths[path] || path;
						}
					});

					next();
				});
			};

		// Register the blocks html and assets middlewares
		app.use(setBlocksHtml);
		app.use(setAssets);

		_.each(self.views, function (viewName, route) {
			app.get(route, function (req, res) {
				_.extend(pageData, res.locals || {});

				console.log("route", route, viewName, pageData);

				res.render(viewName, pageData);
			});
		});
	}

});

DasheeTheme.DEFAULTS = {
	pageData: {
		title: "Dashee",
		description: "A Dashboard framework for Node.js"
	}
};

module.exports = DasheeTheme;