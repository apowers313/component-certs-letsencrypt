"use strict";

var main = require("../index.js");
var assert = require("chai").assert;

describe("main test", function() {
    it("tests something", function() {
        this.timeout(30000);
        assert.isFunction(main);
        return main();
    });
});
