//Takes in a map and returns all of the keys from the map. 
 
//A simple example :
//           
// 
//              var ob = {a:1, b:2, c:3}
//              d3.keys(ob)// ["a","b","c"]
d3.keys = function(map) {
  var keys = [];
  for (var key in map) keys.push(key);
  return keys;
};

//Next: [core/values.js](/d3/src/core/values.html)