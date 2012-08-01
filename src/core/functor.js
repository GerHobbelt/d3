//Read the wikipedia article on [functors](http://en.wikipedia.org/wiki/Functor). Pretty big ideas mathematically speaking. Probably not what you are looking for, but who doesn't need a little category theory now and then? 
//Used to [help clear up bugs in d3.svg](https://github.com/mbostock/d3/commit/22b1c0ba49161767441dbd50269f0f645257a99e).

//Takes in an argument. If that argument is a function, then functor returns that function. If the argument isn't a function, then it will wrap the argument in a function that returns the original argument. Allows for arguments of different types to be assumed to be functions. 
//
//             m = d3.functor(1)
//             m() == 1
//             
//             n = d3.functor(m)
//             n() == 1
// 
//             j = d3.functor(function(i){return i+10;})
//             j(10) == 20
function d3_functor(v) {
  return typeof v === "function" ? v : function() { return v; };
}

//Include the functor into the d3 object. 
d3.functor = d3_functor;

//Next: [core/rebind.js](/d3/src/core/rebind.html)