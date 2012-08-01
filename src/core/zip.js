//This function takes in a variable number of arrays and then "zips"
//them up together. That means it takes the nth element from each array and puts all of them together in one array. 

//Example:
// 
//                 d3.zip([1,2,3],[4,5,6],[9,10,11]) == [[1,4,9],[2,5,10],[3,6,11]]
//Note that if one of the arrays is shorter than the rest, then its length will dictate the number of arrays produced:
// 
//                 d3.zip([1,1,1],[2,2],[3,3,3]) == [[1,2,3],[1,2,3]]

d3.zip = function() {
  if (!(n = arguments.length)) return [];
  for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m;) {
    for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n;) {
      zip[j] = arguments[j][i];
    }
  }
  return zips;
};

//An accessor function that is used in d3.zip to find the length of
//each of the arrays in the arguments variable. Passed in to d3.min as
//the function to be applied before finding the minimum element.
function d3_zipLength(d) {
  return d.length;
}

//Next: [core/bisect.js](/d3/src/core/bisect.html)