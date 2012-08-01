//This function switches the dimensions of a matrix to create the
//[transpose operation](http://en.wikipedia.org/wiki/Transpose). To
//understand what is going on, let's create a much longer example of how
//to to create a transpose function.
 
// We want to be able to turn:
// 
//              [[0,1,2,0],
//               [3,4,5,0],
//               [6,7,8,0]]
// 
// Into the following:
// 
//             [[0,3,6],
//              [1,4,7],
//              [2,5,8],
//              [0,0,0]]
// 
// A simple way to do this is to create a empty matrix with the new
// shape and then copy all of the values over
// 
// 
//              d3.transpose = function(matrix){
//                 transpose = []
// 
//                 for(var i=0; i<matrix[0].length; i++){
//                    transpose.push([])
//                 }
// 
//                 for(var i=0; i<matrix.length; i++){
//                   for(var j=0; j<matrix[0].length; j++){
//                      transpose[j][i] = matrix[i][j]
//                   }
//                 }
//                 return transpose;
//               }
// So, test that out. We can now find the transpose of a matrix. 
// Look back at the d3 code though. It is significantly shorter and
// relies only on the zip function. Read through the [zip function](/d3/src/core/zip.html) and then come back to here.
// Okay, so now we know what the zip function does. And with some
// thought, we realize that the zip function is pretty much just
// transpose. Instead of going through element by element, the zip
// function just takes the nth column and turns it into the nth row in
// the resulting matrix. Linear algebra for the win, I suppose.
d3.transpose = function(matrix) {
  return d3.zip.apply(d3, matrix);
};

//Next: [core/zip.js](/d3/src/core/zip.html)