//`d3.range` returns an array of numbers that represent an interval. 

//Examples:
//
//         d3.range(5) // [0,1,2,3,4]
//         d3.range(3,5) // [3,4]
//         d3.range(300,500,50) // [300,350,400,450] 

//Be careful with decimal step sizes. Never trust the precision of a
//floating number to be exactly what you expect it to be. d3 does the
//right thing and multiples and divides by magnitudes to calculate the
//values from integers. Still, floating point bugs can be subtle.
// 
//         d3.range(3,4,0.1) // [3,3.1,3.2,3.3,3.4,3.5,3.6,3.7,3.8,3.9]
d3.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step === Infinity) throw new Error("infinite range");
  var range = [],
       k = d3_range_integerScale(Math.abs(step)),
       i = -1,
       j;
  start *= k, stop *= k, step *= k;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k);
  else while ((j = start + step * ++i) < stop) range.push(j / k);
  return range;
};

//This calculates the order of magnitude needed to be able to manipulate the floating point values safely. So `f(1)->1, f(0.1)-> 10, f(0.2)->10,f(Math.PI-3)->100000000000000000`. That last one with Pi? Hitting the limit of floating point precison in javascript. 
function d3_range_integerScale(x) {
  var k = 1;
  while (x * k % 1) k *= 10;
  return k;
}

//Next: [core/requote.js](/d3/src/core/requote.html)