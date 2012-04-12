require("../env");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("d3.descending");

suite.addBatch({
  "numbers": {
    "returns a negative number if a > b": function() {
      assert.isTrue(d3.descending(1, 0) < 0);
    },
    "returns a positive number if a < b": function() {
      assert.isTrue(d3.descending(0, 1) > 0);
    },
    "returns zero if a == b": function() {
      assert.equal(d3.descending(0, 0), 0);
    },
    "returns a negative number if a is NaN or undefined (> b)": function() {
      assert.isTrue(d3.descending(NaN, 0) < 0);
      assert.isTrue(d3.descending(undefined, 0) < 0);
    },
    "returns a positive number if b is NaN or undefined (> a)": function() {
      assert.isTrue(d3.descending(0, NaN) > 0);
      assert.isTrue(d3.descending(0, undefined) > 0);
    },
    "returns NaN if both a and b are NaN or undefined": function() {
      assert.isTrue(isNaN(d3.descending(NaN, NaN)));
      assert.isTrue(isNaN(d3.descending(undefined, undefined)));
    }
  }
});

suite.addBatch({
  "strings": {
    "returns a negative number if a > b": function() {
      assert.isTrue(d3.descending("b", "a") < 0);
    },
    "returns a positive number if a < b": function() {
      assert.isTrue(d3.descending("a", "b") > 0);
    },
    "returns zero if a == b": function() {
      assert.equal(d3.descending("a", "a"), 0);
    }
  }
});

suite.export(module);
