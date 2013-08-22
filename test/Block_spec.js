/* global describe, beforeEach, afterEach, it */

var should = require('should'),
    sinon = require('sinon');

var DasheeBlock = require("../lib/Block/Block");

describe("Block", function () {
    var sandbox,
        callback = function (done) { return done(); },
        dasheeFake,
        fakeConfig,
        block;
    
    should.exist(DasheeBlock);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        dasheeFake = {
            addAssetPath: function (path, done) {
                return done();
            }
        };

        fakeConfig = {

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
        sandbox.spy(dasheeFake, "addAssetPath");

        block.assets = ["/some/path/1", "/other/path/1"];

        block.loadAssets(function (err) {
            if (err) { throw err; }

            dasheeFake.addAssetPath.calledTwice.should.equal(true);

            dasheeFake.addAssetPath.calledWith(block.assets[0]).should.equal(true);
            dasheeFake.addAssetPath.calledWith(block.assets[1]).should.equal(true);

            done();
        });
    });

    it("calls load service for each service", function (done) {
        var FakeService = function () {
            this.start = function (done) {
                return done();
            };

            this.on = sandbox.stub();

            sandbox.spy(this, "start");
        };

        var service1 = new FakeService(),
            service2 = new FakeService(),
            service3 = new FakeService();

        // Some hacking here for the multi argument call checks
        service3.start.restore();
        service3.start = function (dashee, config, done) {
            return done(null, service3);
        };
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
});