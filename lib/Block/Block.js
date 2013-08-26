var _ = require("lodash"),
    async = require("async");

var helpers = require("../helpers.js");

function DasheeBlock(dashee, config) {
    _.bindAll(this, "loadAndStartService", "onServiceData");

    this.dashee = dashee;
    this.config = config || {};

    this.name = this.name || this.config.name;
    this.id = this.config.id;
}

_.extend(DasheeBlock.prototype, {
    assets: [],

    services: [],

    load: function (done) {
        var self = this;

        if (!this.name) {
            return done(new Error("Must provide a unique name for this block"));
        }

        this.loadAssets(function (err) {
            if (err) { return done(err); }

            self.startServices(function (err) {
                if (err) { return done(err); }

                done(null, self);
            });
        });
    },

    loadAssets: function (done) {
        this.dashee.addAssetPaths(this.assets, done);
    },

    startServices: function (done) {
        var self = this;

        async.mapSeries(this.services, this.loadAndStartService, function (err, results) {
            if (err) { return done(err); }

            _.each(results, function (service) {
                service.on("data", self.onServiceData);
            });

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
            Service.start(function(err) {
                if (err) {
                    return done(err);
                }

                done(null, Service);
            });
        }
    },

    _lastServiceData: null,
    onServiceData: function (data) {
        this._lastServiceData = data;

        this.dashee.pushData(data, function (err) {
            if (err) {
                return console.warn("Error pushing data: " + err.message);
            }
            // TODO: report something?  There is not an error passed here
        });
    },

    // Empty render stub
    render: function (done) {
        process.nextTick(function () {
            done(null, "");
        });
    }
});

DasheeBlock.extend = helpers.extend;

module.exports = DasheeBlock;