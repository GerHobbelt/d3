//A function which provides information about how to divide an array
//into two parts.

// Let's look at a few simple examples first:
//                 d3.bisect([1,2,3,4],1) == 1
//                 d3.bisect([1,2,3,4],3) == 3
//                 d3.bisect([1,2,3,4],4) == 5
//                 d3.bisect([1,2,3,4],0) == 0
//What's going on exactly? From some of the [orgininal documentation](https://github.com/mbostock/d3/blob/6ba3097766e39ab68cb3d04e4c8b81b6f51a29c5/src/core/bisect.js):
// ```Locate the insertion point for x in a to maintain sorted order. The
// arguments lo and hi may be used to specify a subset of the array which should
// be considered; by default the entire array is used. If x is already present
// in a, the insertion point will be before (to the left of) any existing
// entries. The return value is suitable for use as the first argument to
// `array.splice` assuming that a is already sorted.```
//
//TODO: FINISH explaining this
d3.bisector = function(f) {
  return {
    left: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (f.call(a, a[mid], mid) < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (x < f.call(a, a[mid], mid)) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
};

var d3_bisector = d3.bisector(function(d) {
  return d;
});
d3.bisectLeft = d3_bisector.left;
d3.bisect = d3.bisectRight = d3_bisector.right;

//Next: [core/first.js](/d3/src/core/first.html)
