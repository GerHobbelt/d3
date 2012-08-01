// This is a function which estimates the pth quantile for an array of values. It uses the R-7 estimation per <http://en.wikipedia.org/wiki/Quantile> (similar to how Excel does its quantile estimation). It assumes that the values have been sorted previously. 
d3.quantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};

//Next: [core/transpose.js](/d3/src/core/transpose.html)