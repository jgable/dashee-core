/* global describe, beforeEach, afterEach, it */

var should = require('should'),
    sinon = require('sinon');

var DasheeTheme = require("../lib/Theme/Theme");

describe("Theme", function () {
    var sandbox;
    
    should.exist(DasheeTheme);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("is untested");
});