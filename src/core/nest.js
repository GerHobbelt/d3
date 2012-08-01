//d3.nest may be one of the most underappericated set of functions of
//d3. Take a look at the [API wiki for the overview of what nest and
//it's functions do](https://github.com/mbostock/d3/wiki/Arrays). What
//nest does is allow a developer to create a hierarchy for a flat set of
//objects. For example, if you have a big csv of items, you can start grouping
//them by their characteristics. 

//Here's an example of how to use d3.nest.
// 
//             var books = [ 
//                 {title: "Hackers & Painters", author: "Paul Graham"},
//                 {title: "On Lisp", author: "Paul Graham"},
//                 {title: "Harry Potter and the Philsopher's Stone", author: "J.K. Rowling"},
//                 {title: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling"},
//                 {title: "Harry Potter and the Order of the Phoenix", author: "J.K. Rowling"},
//                 {title: "If I did it", author: "O.J. Simpson"}
//              ] 
//             var BooksByAuthor = d3.nest()
//                  .key(function(d){ return d.author})
//                  .map(books)
//             BooksByAuthor["Paul Graham"].length == 2

//This sets up the nest function to use several closed over variables
//to do all of the calculations. When you can `nest().key`, you are
//pushing functions onto a stack that will later determine the structure of the object returned. 
d3.nest = function() {
  var nest = {},
      keys = [],
      sortKeys = [],
    sortValues,
      rollup;
    
//An internal method that allows for nesting at any depth within the
//object. Uses [d3.map](./d3/src/core/map.html) to create an associative
//array of key and object pairs. Selects the key for the current
//depth, grabs all of the needed objects from the given array, and
//then puts them in the right places. 
  function map(array, depth) {
    if (depth >= keys.length) return rollup
        ? rollup.call(nest, array) : (sortValues
        ? array.sort(sortValues)
        : array);

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        object,
        valuesByKey = new d3_Map,
        values,
        o = {};

    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
        values.push(object);
      } else {
        valuesByKey.set(keyValue, [object]);
      }
    }

    valuesByKey.forEach(function(keyValue) {
      o[keyValue] = map(valuesByKey.get(keyValue), depth);
    });

    return o;
  }

//Takes in a d3.map, and gets all of the entries out of it for the current depth. This means
//`{a:1 b:2}-> [{key: "a", value: 1},{key:"b", value:2}]`. If a sortKey
//function was given as part of the d3.nest setup, then the sortKey function will be applied. 
  function entries(map, depth) {
    if (depth >= keys.length) return map;

    var a = [],
        sortKey = sortKeys[depth++],
        key;

    for (key in map) {
      a.push({key: key, values: entries(map[key], depth)});
    }

    if (sortKey) a.sort(function(a, b) {
      return sortKey(a.key, b.key);
    });

    return a;
  }

  //Uses the previously defined map function to create an object that nests according to the given keys. 
  nest.map = function(array) {
    return map(array, 0);
  };

  //Uses the `map` and `entries` functions to create an array of key value pairs. 
  nest.entries = function(array) {
    return entries(map(array, 0), 0);
  };

  //Pushes a key onto the keys stack. 
  nest.key = function(d) {
    keys.push(d);
    return nest;
  };

  // Specifies the order for the most-recently specified key.
  // Note: only applies to entries. Map keys are unordered!
  nest.sortKeys = function(order) {
    sortKeys[keys.length - 1] = order;
    return nest;
  };

  // Specifies the order for leaf values.
  // Applies to both maps and entries array.
  nest.sortValues = function(order) {
    sortValues = order;
    return nest;
  };

  //Sets the rollup function for the leaves. This is just a
  //[fold/reduce](http://en.wikipedia.org/wiki/Reduce_(higher-order_function\))
  //that is used on the leaves once all the nesting is done.
  nest.rollup = function(f) {
    rollup = f;
    return nest;
  };

  return nest;
};

//Next: [core/keys.js](/d3/src/core/keys.html)