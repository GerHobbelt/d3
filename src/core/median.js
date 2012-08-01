//Similiar to `d3.mean`, given an array, this function calculates the median of the array. If you want, you can pass in a binary function that will be called on each element before the average is taken. 

//Example:
//  
//              d3.median([1,2,3])== 2
//              d3.median([1,2,3],function(d,i){return d+i;})== 3
//Calls a function on each element as well. The implementation relies on the quantile function to find the median element. The idea is that the median element with represent the top of the half quantile.
d3.median = function(array, f) {
  if (arguments.length > 1) array = array.map(f);
  array = array.filter(d3_number);
  return array.length ? d3.quantile(array.sort(d3.ascending), .5) : undefined;
};

//Next: [core/min.js](/d3/src/core/min.html)