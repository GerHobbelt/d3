//The opposite of the d3.ascending ordering function.

//An alternative implementation for this could have been the following:
//
//              d3.descending= function(a,b){
//                return -d3.ascending(a,b);
//              }
d3.descending = function(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
};

//Next: [core/mean.js](/d3/src/core/mean.html)
