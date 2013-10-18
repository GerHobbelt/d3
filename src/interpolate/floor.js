import "interpolate";

d3.interpolateFloor = d3_interpolateFloor;

function d3_interpolateFloor(a, b) {
  return function(t) { return a; };
}
