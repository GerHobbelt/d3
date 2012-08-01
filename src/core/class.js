//A simple function. It takes in a object and properties and then tries to add those properties to via the static [Object.defineProperty](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty). This function is only used in [map.js](/map.html) as far as I can tell. 
// 
//`enumerable:false` [tells the function](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty#Enumerable_attribute) whether to show the value during iteration via a "for i in ob" loop.
//
//If an error is thrown, then it says screw it and just changes the protoptype to the properties. 


function d3_class(ctor, properties) {
  try {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  } catch (e) {
    ctor.prototype = properties;
  }
}

//Next: [core/array.js](/d3/src/core/array.html)