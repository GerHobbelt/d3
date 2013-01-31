//Adds together all of the numbers in array. If a function is supplied, then the function is called on the number before getting added to the sum.
d3.sum = function(array, f) {
  var s = 0,
      n = array.length,
      a,
      i = -1;

  if (arguments.length === 1) {
    while (++i < n) if (!isNaN(a = +array[i])) s += a;
  } else {
    while (++i < n) if (!isNaN(a = +f.call(array, array[i], i))) s += a;
  }

  return s;
};

//Next: [core/quantile.js](/d3/src/core/quantile.html)