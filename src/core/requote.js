//This little guy escapes a certain set of characters that are used often in CSS classes. Used to help selections know how to deal with CSS basically. Check the [tests](https://github.com/mbostock/d3/commit/6d97ab221829bd48a7fb20733799b9057245266d) and [introduction of the function](https://github.com/mbostock/d3/commit/ffb445bb1b581dd1e780d043cb130479300e5681) to know more. 
d3.requote = function(s) {
  return s.replace(d3_requote_re, "\\$&");
};

//A small beast of a regex. 
var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

//Next: [core/round.js](/d3/src/core/round.html)