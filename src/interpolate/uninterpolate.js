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

d3.uninterpolateFloor = d3_uninterpolateFloor;

function d3_uninterpolateFloor(a, b) {
  return function(x) { return a; };
}

d3.uninterpolateCeiling = d3.uninterpolateCeiling;

function d3_uninterpolateCeiling(a, b) {
  return function(x) { return b; };
}
