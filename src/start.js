//Wraps the library up in an anonymous function by bookending with [end.html](/end.html). Closes over everything so that only the correct functions are visible.
//Used here by the [Makefile](https://github.com/mbostock/d3/blob/master/Makefile#L15).

d3 = (function(){
  var d3 = {version: VERSION}; // semver

//Next: [compat/date.js](/d3/src/compat/date.html)
