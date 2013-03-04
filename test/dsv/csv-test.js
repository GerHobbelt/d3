require("../env");

var vows = require("vows"),
    assert = require("../env-assert");

var suite = vows.describe("d3.csv");

suite.addBatch({
  "csv": {
    topic: function() {
      var cb = this.callback;
      d3.csv("test/data/sample.csv", function(error, csv) {
        cb(null, csv);
      });
    },
    "invokes the callback with the parsed CSV": function(csv) {
      assert.deepEqual(csv, [{"Hello":"42","World":"\"fish\""}]);
    },
    "overrides the mime type to text/csv": function(csv) {
      assert.equal(XMLHttpRequest._last._info.mimeType, "text/csv");
    },
    "specifying a row conversion function": {
      topic: function() {
        var cb = this.callback;
        d3.csv("test/data/sample.csv", function(row) {
          row.Hello = -row.Hello;
          return row;
        }, function(error, csv) {
          cb(null, csv);
        });
      },
      "invokes the callback with the parsed CSV": function(csv) {
        assert.strictEqual(csv[0].Hello, -42);
      }
    },
    "attempting to load a file that does not exist": {
      topic: function() {
        var cb = this.callback;
        d3.csv("//does/not/exist.csv", function(error, csv) {
          cb(null, csv);
        });
      },
      "invokes the callback with undefined": function(csv) {
        assert.isUndefined(csv);
      }
    }
  },

  "parse": {
    topic: function() {
      return d3.csv.parse;
    },
    "returns an array of objects": function(parse) {
      assert.deepEqual(parse("a,b,c\n1,2,3\n"), [{a: "1", b: "2", c: "3"}]);
    },
    "does not strip whitespace": function(parse) {
      assert.deepEqual(parse("a,b,c\n 1, 2,3\n"), [{a: " 1", b: " 2", c: "3"}]);
    },
    "parses quoted values": function(parse) {
      assert.deepEqual(parse("a,b,c\n\"1\",2,3"), [{a: "1", b: "2", c: "3"}]);
      assert.deepEqual(parse("a,b,c\n\"1\",2,3\n"), [{a: "1", b: "2", c: "3"}]);
    },
    "parses quoted values with quotes": function(parse) {
      assert.deepEqual(parse("a\n\"\"\"hello\"\"\""), [{a: "\"hello\""}]);
    },
    "parses quoted values with newlines": function(parse) {
      assert.deepEqual(parse("a\n\"new\nline\""), [{a: "new\nline"}]);
      assert.deepEqual(parse("a\n\"new\rline\""), [{a: "new\rline"}]);
      assert.deepEqual(parse("a\n\"new\r\nline\""), [{a: "new\r\nline"}]);
    },
    "parses unix newlines": function(parse) {
      assert.deepEqual(parse("a,b,c\n1,2,3\n4,5,\"6\"\n7,8,9"), [
        {a: "1", b: "2", c: "3"},
        {a: "4", b: "5", c: "6"},
        {a: "7", b: "8", c: "9"}
      ]);
    },
    "parses mac newlines": function(parse) {
      assert.deepEqual(parse("a,b,c\r1,2,3\r4,5,\"6\"\r7,8,9"), [
        {a: "1", b: "2", c: "3"},
        {a: "4", b: "5", c: "6"},
        {a: "7", b: "8", c: "9"}
      ]);
    },
    "parses dos newlines": function(parse) {
      assert.deepEqual(parse("a,b,c\r\n1,2,3\r\n4,5,\"6\"\r\n7,8,9"), [
        {a: "1", b: "2", c: "3"},
        {a: "4", b: "5", c: "6"},
        {a: "7", b: "8", c: "9"}
      ]);
    }
  },

  "parse with row function": {
    "invokes the row function for every row in order": function() {
      var rows = [];
      d3.csv.parse("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
      assert.deepEqual(rows, [
        {d: {a: "1"}, i: 0},
        {d: {a: "2"}, i: 1},
        {d: {a: "3"}, i: 2},
        {d: {a: "4"}, i: 3}
      ]);
    },
    "returns an array of the row function return values": function() {
      assert.deepEqual(d3.csv.parse("a,b,c\n1,2,3\n", function(row) { return row; }), [{a: "1", b: "2", c: "3"}]);
    },
    "skips rows if the row function returns null or undefined": function() {
      assert.deepEqual(d3.csv.parse("a,b,c\n1,2,3\n2,3,4", function(row) { return row.a & 1 ? null : row; }), [{a: "2", b: "3", c: "4"}]);
      assert.deepEqual(d3.csv.parse("a,b,c\n1,2,3\n2,3,4", function(row) { return row.a & 1 ? undefined : row; }), [{a: "2", b: "3", c: "4"}]);
    }
  },

  "parseRows": {
    topic: function() {
      return d3.csv.parseRows;
    },
    "returns an array of arrays": function(parse) {
      assert.deepEqual(parse("a,b,c\n"), [["a", "b", "c"]]);
    },
    "parses quoted values": function(parse) {
      assert.deepEqual(parse("\"1\",2,3\n"), [["1", "2", "3"]]);
      assert.deepEqual(parse("\"hello\""), [["hello"]]);
    },
    "parses quoted values with quotes": function(parse) {
      assert.deepEqual(parse("\"\"\"hello\"\"\""), [["\"hello\""]]);
    },
    "parses quoted values with newlines": function(parse) {
      assert.deepEqual(parse("\"new\nline\""), [["new\nline"]]);
      assert.deepEqual(parse("\"new\rline\""), [["new\rline"]]);
      assert.deepEqual(parse("\"new\r\nline\""), [["new\r\nline"]]);
    },
    "parses unix newlines": function(parse) {
      assert.deepEqual(parse("a,b,c\n1,2,3\n4,5,\"6\"\n7,8,9"), [
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"]
      ]);
    },
    "parses mac newlines": function(parse) {
      assert.deepEqual(parse("a,b,c\r1,2,3\r4,5,\"6\"\r7,8,9"), [
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"]
      ]);
    },
    "parses dos newlines": function(parse) {
      assert.deepEqual(parse("a,b,c\r\n1,2,3\r\n4,5,\"6\"\r\n7,8,9"), [
        ["a", "b", "c"],
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"]
      ]);
    }
  },

  "format": {
    topic: function() {
      return d3.csv.format;
    },
    "takes an array of arrays as input": function(format) {
      assert.equal(format([["a", "b", "c"], ["1", "2", "3"]]), "a,b,c\n1,2,3");
    },
    "separates lines using unix newline": function(format) {
      assert.equal(format([[], []]), "\n");
    },
    "does not strip whitespace": function(format) {
      assert.equal(format([["a ", " b", "c"], ["1", "2", "3 "]]), "a , b,c\n1,2,3 ");
    },
    "does not quote simple values": function(format) {
      assert.equal(format([["a"], [1]]), "a\n1");
    },
    "escapes double quotes": function(format) {
      assert.equal(format([["\"fish\""]]), "\"\"\"fish\"\"\"");
    },
    "escapes unix newlines": function(format) {
      assert.equal(format([["new\nline"]]), "\"new\nline\"");
    },
    "escapes commas": function(format) {
      assert.equal(format([["oxford,comma"]]), "\"oxford,comma\"");
    }
  }
});

suite.export(module);
