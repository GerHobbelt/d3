//Given an array of elements, and an array of indices, this function
//takes the elements and rearranges them according to the order
//specified by the indexes.

//A simple example: 
//           
// 
//              var array = ["Y","O","L","T"]
//              var indexes =  [3,1,2,0]
//              d3.permute(array,indexes).join("") == "TOLY"

d3.permute = function(array, indexes) {
  var permutes = [],
      i = -1,
      n = indexes.length;
  while (++i < n) permutes[i] = array[indexes[i]];
  return permutes;
};

//Next: [core/merge.js](/d3/src/core/merge.html)