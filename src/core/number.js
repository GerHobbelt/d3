//A predicate function that determines whether or not the argument is a number. Used in [mean](/d3/src/core/mean.html) and [median](/d3/src/core/median.html).

function d3_number(x) {
  return x != null && !isNaN(x);
}

//Next: [core/sum.js](/d3/src/core/sum.html)