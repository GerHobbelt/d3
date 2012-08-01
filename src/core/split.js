//Splits an array based on a given function. It just goes through collecting values, waiting until f returns true, and then it pushs the collected values and starts a new collection. Note that it disgards the element that triggers the predicate function. 

//Simple example: 
// 
//              var arr = [1,2,3,null,10]
//              d3.split(arr) //[[1,2,3],[10]]
//              d3.split(arr,function(n){return n==3;}) //[[1,2],[null,10]]

d3.split = function(array, f) {
  var arrays = [],
      values = [],
      value,
      i = -1,
      n = array.length;
  if (arguments.length < 2) f = d3_splitter;
  while (++i < n) {
    if (f.call(values, value = array[i], i)) {
      values = [];
    } else {
      if (!values.length) arrays.push(values);
      values.push(value);
    }
  }
  return arrays;
};

//Used as a default for d3.split. You will probably want to replace
//this to be more useful for your given problem.
function d3_splitter(d) {
  return d == null;
}

//Next: [core/collapse.js](/d3/src/core/collapse.html)
