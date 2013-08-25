/* global describe, beforeEach, afterEach, it */

var _ = require('lodash'),
    should = require('should'),
    sinon = require('sinon');

var DasheeTheme = require("../lib/Theme/Theme");

describe("Theme", function () {
    var sandbox,
        fakeDashee,
        fakeConfig,
        fakeBlocksHtml = {
            id: 1,
            name: "dashee-block-test",
            html: "<div></div>"
        },
        theme;
    
    should.exist(DasheeTheme);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeDashee = {
            addAssetPaths: sandbox.spy(function (paths, done) {
                done();
            }),

            getBlocksHtml: sandbox.spy(function (done) {
                done(null, [fakeBlocksHtml]);
            }),

            getAssetsPaths: sandbox.spy(function (done) {
                done(null, {
                    '/assets/dashee/js/dashee.js': '/assets/dashee/js/dashee.023872dlkfjw.js'
                });
            }),

            use: sandbox.stub(),
            get: sandbox.stub()
        };

        fakeConfig = {

        };

        theme = new DasheeTheme(fakeDashee, fakeConfig);
        theme.viewRoot = process.cwd();
        theme.assets = ["test/assets/1", "test/assets/2"];
        theme.name = "dashee-theme-test";
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("requires a viewRoot", function (done) {
        theme.viewRoot = undefined;
        theme.load(function (err) {
            should.exist(err);
            err.message.should.equal("Must provide a viewRoot");

            done();
        });
    });

    it("loads assets", function (done) {
        theme.load(function (err) {
            if (err) { throw err; }

            fakeDashee.addAssetPaths.calledWith(theme.assets).should.equal(true);

            done();
        });
    });

    it("registers view routes", function (done) {
        theme.views = _.extend(theme.views, {
            "/other": "other"
        });
        theme.load(function (err) {
            if (err) { throw err; }

            theme.registerViewRoutes();

            fakeDashee.use.calledWith(theme.setBlocksHtml).should.equal(true);
            fakeDashee.use.calledWith(theme.setAssets).should.equal(true);

            fakeDashee.get.calledWith("/").should.equal(true);
            fakeDashee.get.calledWith("/other").should.equal(true);

            done();

        });
    });

    it("sets the rendered blocks html on the response", function (done) {
        var req,
            res = {},
            next = function () {
                should.exist(res.locals);
                should.exist(res.locals.blocks);

                res.locals.blocks.length.should.be.above(0);

                done();
            };


        theme.setBlocksHtml(req, res, next);
    });

    it("sets the assets on the response", function (done) {
        var req,
            res = {},
            next = function () {
                should.exist(res.locals);
                should.exist(res.locals.assets);

                should.exist(res.locals.assets["/assets/dashee/js/dashee.js"]);

                done();
            };

        theme.setAssets(req, res, next);
    });
});