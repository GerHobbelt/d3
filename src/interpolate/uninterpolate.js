d3.uninterpolateNumber = d3_uninterpolateNumber;

function d3_uninterpolateNumber(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return (x - a) * b; };
}

d3.uninterpolateClamp = d3_uninterpolateClamp;

function d3_uninterpolateClamp(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return Math.max(0, Math.min(1, (x - a) * b)); };
}

d3.uninterpolateSteppedFloor = d3_uninterpolateSteppedFloor;

function d3_uninterpolateSteppedFloor(step) {
  return function(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      var extent = x - a;
      if (extent >= 0) {
        return (x - (extent % step) - a) * b;
      } else {
        var mod = extent % step;
        if (mod) {
          return (x - (step + extent % step)) * b;
        } else {
          return x * b;
        }
      }
    }
  }
}