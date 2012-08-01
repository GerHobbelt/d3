//This whole file started out as a way to become backwards compatible with older js engines. 
//See this [commit](https://github.com/mbostock/d3/commit/738b6347898aa7789936bfac8e5973f5f2768e3d) for more information. 
//The main worry seemed to be that there would be collisions between added properties and built-in property names such as `__proto__` and `hasOwnProperty`. 
//Over time it is being [integrated](https://github.com/mbostock/d3/commit/ebab983b8a644b4e5a7fe3d392be67d44c3e900b) [further](https://github.com/mbostock/d3/commit/7069da0c79d3c7e1578e5a6df5c1bc1e2e539faa) and [further](https://github.com/mbostock/d3/commit/f1197ed8b6b4893237cdd3e27e7454af3c97a612) into d3.js as the way to store maps of values. 


//The basics map object. It takes in an object and copies over all of the key-values into a new map. 
d3.map = function(object) {
  var map = new d3_Map;
  for (var key in object) map.set(key, object[key]);
  return map;
};

//Below is a class definition for d3_Map. It uses [`d3_class`](http://localhost:8000/class.html) to define a custom object that is built to prevent collisions. By using a custom prefix code for keys for the map, the object can prevent collisions without much extra work. 

//Create the initial object. 
function d3_Map() {}

d3_class(d3_Map, {

//Boolean function that tells whether or not the key is in the map. 
// 
//             d3.map({a:1}).has('a') == true
             
  has: function(key) {
    return d3_map_prefix + key in this;
  },
//Returns the value of the key. 
//
//             d3.map({a:1}).get('a') == 1
  get: function(key) {
    return this[d3_map_prefix + key];
  },
//Returns the value of the key. 
//
//             m = d3.map({a:1})
//             m.get("a")==1
  set: function(key, value) {
    return this[d3_map_prefix + key] = value;
  },
//Removes a key-value pair from the map. Note the use of 'key in this &&' to check for the key. If it is found then, use the delete keyword. 
// 
//             m = d3.map({a:1})
//             m.remove("a")
//             m.get("a") == null
  remove: function(key) {
    key = d3_map_prefix + key;
    return key in this && delete this[key];
  },
//Collect all the keys from the map. 
// 
//             m = d3.map({a:1, b:2, c:1})
//             m.keys() == ["a","b","c"]
  keys: function() {
    var keys = [];
    this.forEach(function(key) { keys.push(key); });
    return keys;
  },
//Collect all of the values from the map. The values aren't necessarily unique like the keys. 
// 
//             m = d3.map({a:1, b:2, c:1})
//             m.values() == [1,2,1]
  values: function() {
    var values = [];
    this.forEach(function(key, value) { values.push(value); });
    return values;
  },
//Collect all of the key-value pairs from the map. 
// 
//             m = d3.map({a:1, b:2, c:1})
//             m.entries() == [{key:"a", value: 1},{key:"b", value: 2},{key:"c", value: 1}]
  entries: function() {
    var entries = [];
    this.forEach(function(key, value) { entries.push({key: key, value: value}); });
    return entries;
  },
//Given a function, calls the function for each entry in the map. Does not change the map. 
// 
//             m = d3.map({a:1, b:2, c:1})
//             m.forEach(function(key,value){return value+1;})
//             m.get("a") == 1
// 
//             q = d3.map()
//             m.forEach(function(key,value){q.set(key,value+1);})
//             q.get("a")==2
  forEach: function(f) {
    for (var key in this) {
      if (key.charCodeAt(0) === d3_map_prefixCode) {
        f.call(this, key.substring(1), this[key]);
      }
    }
  }
});

//The code that prevents collisions from happening within the code. Used to prefix all of the keys when they are being inserted into the map. 
var d3_map_prefix = "\0", // prevent collision with built-ins
    d3_map_prefixCode = d3_map_prefix.charCodeAt(0);

//Next: [core/identity.js](/d3/src/core/identity.html)