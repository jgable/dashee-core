var _ = require("lodash"),
    async = require("async");

function DasheeBlock(dashee, config) {
    this.dashee = dashee;
    this.config = config;
}

_.extend(DasheeBlock.prototype, {
    assets: [],

    services: [],

    load: function (done) {

        var self = this;

        this.loadAssets(function (err) {
            if (err) { return done(err); }

            self.startServices(function (err) {
                if (err) { return done(err); }

                done(null, self);
            });
        });
    },

    loadAssets: function (done) {
        var self = this,
            loadAssetPath = function (assetPath, cb) {
                self.dashee.addAssetPath(assetPath, cb);
            };

        async.mapSeries(this.assets, loadAssetPath, function (err, results) {
            if (err) { return done(err); }

            done(null, results);
        });
    },

    startServices: function (done) {
        var self = this,
            loadService = function (Service, cb) {
                self.loadAndStartService(Service, cb);
            };

        async.mapSeries(this.services, loadService, function (err, results) {
            if (err) { return done(err); }

            done(null, results);
        });
    },

    loadAndStartService: function (Service, done) {
        if (_.isFunction(Service)) {
            Service = new Service(this.dashee, this.config);
        }

        if (!_.isFunction(Service.start)) {
            return done(new Error("Service does not have the start function defined"));
        }

        if (Service.start.length > 1) {
            Service.start(this.dashee, this.config, done);
        } else {
            Service.start(done);
        }
    }
});

module.exports = DasheeBlock;