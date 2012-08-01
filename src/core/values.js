//Takes in a map and returns all of the values from the map. 
 
//A simple example: 
//           
// 
//              var ob = {a:1, b:2, c:3}
//              d3.values(ob)// [1,2,3]
d3.values = function(map) {
  var values = [];
  for (var key in map) values.push(map[key]);
  return values;
};

//Next: [core/entries.js](/d3/src/core/entries.html)