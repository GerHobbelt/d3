import "document";

//Due to function hoisting, read the next two functions first.

var d3_array = d3_arraySlice; // conversion for NodeLists

//Copies a given pseudoarray. The word pseudo probably refers the idea that these functions will be working with [NodeLists](https://developer.mozilla.org/En/DOM/NodeList), which are similiar to an array, but aren't really the same at all.
function d3_arrayCopy(pseudoarray) {
  var i = -1, n = pseudoarray.length, array = [];
  while (++i < n) array.push(pseudoarray[i]);
  return array;
}

//Given an array, this copies it via `slice`.
function d3_arraySlice(pseudoarray) {
  return Array.prototype.slice.call(pseudoarray);
}

//If `d3_arraySlice` cannot work with a [NodeList](https://developer.mozilla.org/En/DOM/NodeList), then change `d3_array` to `d3_arrayCopy`.
//Side note: when you call `document.getElementsByTagName("selector")`, the array is live, i.e. when you change the document, the list will update automatically.
try {
  // Test whether the DOM nodes have array methods attached; if not, we add the one(s) we need.
  d3_array(d3_document.documentElement.childNodes)[0].nodeType;
} catch(e) {
  d3_array = d3_arrayCopy;
}

// An extended `pred ? a : b` expression to define the d3_arraySubclass
var d3_arraySubclass = [].__proto__ ? function(array, prototype) {
  // Until ECMAScript supports array subclassing, prototype injection works well.
  array.__proto__ = prototype;
} : function(array, prototype) {
  // And if your browser doesn't support __proto__, we'll use direct extension.
  for (var property in prototype) array[property] = prototype[property];
};

//Next: [core/map.js](/d3/src/core/map.html)
