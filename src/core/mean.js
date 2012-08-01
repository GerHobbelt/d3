//Given an array, this function calculates the mean of the array. If you want, you can pass in a binary function that will be called on each element before the average is taken. 

//Example:
//              d3.mean([1,2,3])== 2
//              d3.mean([1,2,3],function(d,i){return d+i;})== 3
//Calls a function on each element as well. 
d3.mean = function(array, f) {
  var n = array.length,
      a,
      m = 0,
      i = -1,
      j = 0;
  if (arguments.length === 1) {
    while (++i < n) if (d3_number(a = array[i])) m += (a - m) / ++j;
  } else {
    while (++i < n) if (d3_number(a = f.call(array, array[i], i))) m += (a - m) / ++j;
  }
  return j ? m : undefined;
};

//Next: [core/median.js](/d3/src/core/median.html)