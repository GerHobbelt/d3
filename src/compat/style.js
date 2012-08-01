//A solution to fix the problem with IE9 and setting the style of an element.  
// 
// See [this commit](https://github.com/mbostock/d3/commit/c2e37352ac84eb8b4be89feed90bc2249866f715) for more information. 
// 
// 
// An error happens where 0 isn't being converted to "0" by IE. The error is caught, and the more general case of the error, where a value isn't being converted to its string representation, is fixed. 
// 
// This code takes the setProperty function and composes it with a function that takes the value variable and makes it into a string, via 
// value +"", before passing it on to the actual setProperty function. 
//
//Example:
// 
//     document.createElement("div").style.setProperty("opacity", 0, "");
//
//This is equivalent to calling: 
// 
//     document.createElement("div").style.setProperty("opacity", "0", "");

try {
  document.createElement("div").style.setProperty("opacity", 0, "");
} catch (error) {
  var d3_style_prototype = CSSStyleDeclaration.prototype,
      d3_style_setProperty = d3_style_prototype.setProperty;
  d3_style_prototype.setProperty = function(name, value, priority) {
    d3_style_setProperty.call(this, name, value + "", priority);
  };
}

//Next: [core/core.js](/d3/src/core/core.html)