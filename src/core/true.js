//Returns `true`. 
//Used for [fixing a bug](https://github.com/mbostock/d3/commit/22b1c0ba49161767441dbd50269f0f645257a99e) within `defined`. The idea of `defined` is used within all sorts of svg shapes. 
function d3_true() {
  return true;
}

//Next: [core/functor.js](/d3/src/core/functor.html)