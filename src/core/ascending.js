//This is a terse function that provides a [partial ordering for a poset](http://en.wikipedia.org/wiki/Partially_ordered_set)[1]. It uses the [javascript conditional operator](https://developer.mozilla.org/en/JavaScript/Reference/Operators/Conditional_Operator) several times in a nested fashion to determine the order of the two given elements. 

//The ternary expressions is equivalent to the following code: 
// 
//              if (a < b){
//                return -1
//              }
//              else{
//                if (a > b){
//                  return 1
//                }
//                else{
//                  if ( a>= b)
//                    return 0
//                  else
//                    return NaN
//                }
//              }




d3.ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : a >= a || a <= a ? -1 : b >= b || b <= b ? 1 : NaN;
};

//Next: [core/descending.js](/d3/src/core/descending.html)

//[1]All the math is meant to keep you on your toes. Watch out though, or else you will never know [what](http://en.wikipedia.org/wiki/Dirac_delta_function) hit you. 
// 
