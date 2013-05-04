//An object that holds onto distributions of random variables. Currently only contains the normal distribution. As far as I can tell, random.normal exists only [to be used for examples](https://github.com/mbostock/d3/commit/a475cd5e5cef8e00a2a1ca47bb78fc16b2f2bb51).
d3.random = {

//A function which generates normal distribution with the given parameters. Reverts back to standard normal if no arguments are passed.
    //To understand the algorithm, first look at the standard normal case. The generated function keeps sampling two uniform variables from the interval [-1,1] via Math.random and a linear transformation. Then it takes the distance of the sampled variables from the origin. If the distance is less than 1, then we know the given point is within the unit circle. Once we have sampled a point from the middle of the unit circle, it uses the [Marsaglia polar method](http://en.wikipedia.org/wiki/Marsaglia_polar_method) to generate a standard random normal variable. With some stats 101 knowledge, we can transform the standard normal variable into the desired distribution by multiplying by the deviation and adding in the mean.
  normal: function(µ, σ) {
    var n = arguments.length;
    if (n < 2) σ = 1;
    if (n < 1) µ = 0;
    return function() {
      var x, y, r;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        r = x * x + y * y;
      } while (!r || r > 1);
      return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
    };
  },
  logNormal: function() {
    var random = d3.random.normal.apply(d3, arguments);
    return function() {
      return Math.exp(random());
    };
  },
  irwinHall: function(m) {
    return function() {
      for (var s = 0, j = 0; j < m; j++) s += Math.random();
      return s / m;
    };
  }
};

//Next: [core/number.js](/d3/src/core/number.html)
