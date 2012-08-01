//Given a set of arrays, this function will merge all of them together into one array. 

//Example:
// 
//              var arrs = [d3.range(0,4),d3.range(4,6),d3.range(9,11)]
//              d3.merge(arrs) // [0,1,2,3,4,5,7,9,10]
d3.merge = function(arrays) {
  return Array.prototype.concat.apply([], arrays);
};

//Next: [core/split.js](/d3/src/core/split.html)