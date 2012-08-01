//A better name for this function would have been d3.truncate. It chops off any decimal digits after the first `n` decimal digits. Useful for formatting. 

//Examples:
// 
//          d3.round(Math.PI) == 3
//          d3.round(Math.PI,1) == 3.1
//          d3.round(Math.PI,5) == 3.14159

d3.round = function(x, n) {
  return n
      ? Math.round(x * (n = Math.pow(10, n))) / n
      : Math.round(x);
};

//Next: [core/xhr.js](/d3/src/core/xhr.html)
