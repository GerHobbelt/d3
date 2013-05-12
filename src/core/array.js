import "document";

var d3_array = d3_arraySlice; // conversion for NodeLists

function d3_arrayCopy(pseudoarray) {
  var i = -1, n = pseudoarray.length, array = [];
  while (++i < n) array.push(pseudoarray[i]);
  return array;
}

function d3_arraySlice(pseudoarray) {
  return Array.prototype.slice.call(pseudoarray);
}

try {
  // Test whether the DOM nodes have array methods attached; if not, we add the one(s) we need.
  d3_array(d3_document.documentElement.childNodes)[0].nodeType;
} catch(e) {
  d3_array = d3_arrayCopy;
}

var d3_arraySubclass = [].__proto__ ? function(array, prototype) {
  // Until ECMAScript supports array subclassing, prototype injection works well.
  array.__proto__ = prototype;
} : function(array, prototype) {
  // And if your browser doesn't support __proto__, we'll use direct extension.
  for (var property in prototype) array[property] = prototype[property];
};
