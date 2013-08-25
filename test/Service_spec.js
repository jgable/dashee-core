/* global describe, before, after, beforeEach, afterEach, it */

var fs = require('fs'),
    path = require('path'),
    http = require('http');

var should = require('should'),
    sinon = require('sinon');

var DasheeService = require("../lib/Service/Service"),
    IntervalService = require("../lib/Service/IntervalService"),
    FileDataService = require("../lib/Service/FileDataService"),
    JSONFileService = require("../lib/Service/JSONFileService"),
    HTTPDataService = require("../lib/Service/HTTPDataService");

describe("Service", function () {
    var sandbox,
        fakeDashee,
        fakeConfig;
    
    should.exist(DasheeService);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeDashee = {
            get: sandbox.stub(),
            post: sandbox.stub(),
            put: sandbox.stub()
        };

        fakeConfig = {
            test: true
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("sets config and server values", function () {
        var service = new DasheeService(fakeDashee, fakeConfig);

        service.dashee.should.equal(fakeDashee);
        service.config.should.equal(fakeConfig);

        service.server.get.should.equal(fakeDashee.get);
        service.server.post.should.equal(fakeDashee.post);
        service.server.put.should.equal(fakeDashee.put);
            
    });

    it("can emit data and errors", function () {
        var service = new DasheeService(fakeDashee, fakeConfig),
            dataCount = 0,
            errorCount = 0;

        service.on("data", function () {
            dataCount++;
        });

        service.on("error", function () {
            errorCount++;
        });

        service.emitData("one");
        service.emitData("two");
        service.emitData("three");

        service.emitError("uh oh");
        service.emitError("uh oh again");

        dataCount.should.equal(3);
        errorCount.should.equal(2);
    });

    describe("IntervalService", function () {

        it("reports data on an interval", function (done) {
            var service = new IntervalService({}, {
                    interval: 5
                }),
                start = Date.now(),
                dataCount = 0;

            service.on("data", function () {
                if (dataCount > 2) {
                    (Date.now() - start).should.be.below(50);

                    service.stop();
                    return done();
                }

                dataCount++;
            });

            service.start(function (err) {
                if (err) { throw err; }
            });
        });
    });

    describe("StaticDataService", function () {
        
        it("generates random data", function (done) {
            var service = new IntervalService({}, {
                    interval: 5
                }),
                start = Date.now(),
                nums = [];

            service.on("data", function (num) {
                should.exist(num);

                nums.push(num);

                if (nums.length > 2) {
                    (Date.now() - start).should.be.below(50);

                    service.stop();
                    return done();
                }
            });

            service.start(function (err) {
                if (err) { throw err; }
            });
        });
    });

    describe("FileDataService", function () {
        it("can load a file", function (done) {
            var service = new FileDataService({}, {
                    filePath: path.join(process.cwd(), 'test', 'fixtures', 'test1.json'),
                    interval: 5
                }),
                testContents = fs.readFileSync(service.config.filePath).toString(),
                start = Date.now(),
                nums = [];



            service.on("data", function (contents) {
                should.exist(contents);

                contents.should.equal(testContents);

                nums.push(contents);

                if (nums.length > 2) {
                    (Date.now() - start).should.be.below(50);

                    service.stop();
                    return done();
                }
            });

            service.start(function (err) {
                if (err) { throw err; }
            });
        });
    });

    describe("JSONFileService", function () {
        it("can load a file", function (done) {
            var service = new JSONFileService({}, {
                    filePath: path.join(process.cwd(), 'test', 'fixtures', 'test1.json'),
                    interval: 5
                }),
                testContents = JSON.parse(fs.readFileSync(service.config.filePath).toString()),
                start = Date.now(),
                nums = [];



            service.on("data", function (contents) {
                should.exist(contents);
                should.exist(contents.test);

                contents.should.eql(testContents);
                contents.test.should.equal(true);

                nums.push(contents);

                if (nums.length > 2) {
                    (Date.now() - start).should.be.below(50);

                    service.stop();
                    return done();
                }
            });

            service.start(function (err) {
                if (err) { throw err; }
            });
        });
    });

    describe("HTTPDataService", function () {
        var server,
            responseContents = {
                test: true
            };

        before(function (done) {
            server = http.createServer(function (req, resp) {
                resp.writeHead(200, {"Content-Type": "text/plain"});
                resp.end(JSON.stringify(responseContents));
            });

            server.listen(7357, done);
        });

        after(function (done) {
            server.close(function (err) {
                if (err) { throw err; }
                done();
            });
        });

        it("can make a GET request for data", function (done) {
            var service = new HTTPDataService({}, {
                    url: "http://localhost:7357/test",
                    interval: 10
                }),
                start = Date.now(),
                nums = [];

            service.on("data", function (contents) {
                should.exist(contents);
                should.exist(contents.test);

                contents.should.eql(responseContents);
                contents.test.should.equal(true);

                nums.push(contents);

                if (nums.length > 2) {
                    (Date.now() - start).should.be.below(100);

                    service.stop();
                    return done();
                }
            });

            service.start(function (err) {
                if (err) { throw err; }
            });
        });
    });
});