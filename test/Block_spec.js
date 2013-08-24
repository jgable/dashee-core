/* global describe, beforeEach, afterEach, it */

var _ = require('lodash'),
    should = require('should'),
    sinon = require('sinon');

var DasheeBlock = require("../lib/Block/Block"),
    DasheeService = require('../lib/Service/Service');

describe("Block", function () {
    var sandbox,
        callback = function (done) { return done(); },
        dasheeFake,
        fakeConfig,
        block;

    var FakeService = function () {
        DasheeService.call(this, dasheeFake, fakeConfig);
    };

    _.extend(FakeService.prototype, DasheeService.prototype);
    
    should.exist(DasheeBlock);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        dasheeFake = {
            addAssetPaths: function (path, done) {
                return done();
            },

            pushData: sandbox.stub()
        };

        fakeConfig = {
            name: "test-block"
        };

        block = new DasheeBlock(dasheeFake, fakeConfig);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("calls loadAssets and startServices on load", function (done) {
        sandbox.stub(block, "loadAssets", callback);
        sandbox.stub(block, "startServices", callback);

        block.load(function (err) {
            if (err) { throw err; }

            block.loadAssets.called.should.equal(true);
            block.startServices.called.should.equal(true);

            done();
        });
    });

    it("calls addAssetPath for each asset", function (done) {
        sandbox.spy(dasheeFake, "addAssetPaths");

        block.assets = ["/some/path/1", "/other/path/1"];

        block.loadAssets(function (err) {
            if (err) { throw err; }

            dasheeFake.addAssetPaths.calledOnce.should.equal(true);

            dasheeFake.addAssetPaths.calledWith(block.assets).should.equal(true);

            done();
        });
    });

    it("calls load service for each service", function (done) {
        var service1 = new FakeService(),
            service2 = new FakeService(),
            service3 = new FakeService();

        // Some hacking here for the multi argument call checks
        service3.start = function (dashee, config, done) {
            return done(null, service3);
        };
        sandbox.spy(service1, "start");
        sandbox.spy(service2, "start");
        sandbox.spy(service3, "start");

        block.services = [service1, service2, service3];

        block.startServices(function (err) {
            if (err) { throw err; }

            block.services.forEach(function (service) {
                service.start.called.should.equal(true);
            });

            // Make sure the multiple argument call works
            service3.start.calledWith(dasheeFake, fakeConfig);

            done();
        });
    });

    it("calls pushData when a service emits data", function (done) {
        var service = new FakeService();

        block.services = [service];

        block.startServices(function (err) {
            if (err) { throw err; }

            block.dashee.pushData.called.should.equal(false);

            var fakeData = { fake: true };

            service.emit("data", fakeData);

            block.dashee.pushData.calledWith(fakeData).should.equal(true);

            done();
        });
    });

    
});