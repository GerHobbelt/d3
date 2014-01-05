import "interpolate";

d3.interpolateCeiling = d3_interpolateCeiling;

function d3_interpolateCeiling(a, b) {
  return function(t) { return b; };
}
