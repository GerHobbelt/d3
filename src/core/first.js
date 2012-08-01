//This finds the lowest element of the array, via a given sort or the defeault d3.ascending. So `d3.first([1,2,3]) == 1` while `d3.first([1,2,3],d3.descending)== 3`. 
d3.first = function(array, f) {
  var i = 0,
      n = array.length,
      a = array[0],
      b;
  if (arguments.length === 1) f = d3.ascending;
  while (++i < n) {
    if (f.call(array, a, b = array[i]) > 0 && (b >= b || b <= b)) {
      a = b;
    }
  }
  return a;
};

//Next: [core/last.js](/d3/src/core/last.html)
