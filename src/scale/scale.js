d3.scale = {};

function d3_scaleExtent(domain) {
  var start = domain[0], stop = domain[domain.length - 1];
  // We ensure that the returned span DELTA is always LARGER THAN 0.
  // This is a requirement as the extent[] is often used to determine ranges in calculations
  // which apply a Math.log() to the extent[] delta (e.g. d3_scale_linearTickRange())
  //
  // We only 'tweak' the extent when the domain range is zero, which itself is an edge case
  // which generally only stems from a domain with zero or only 1 data point, so tweaking
  // the extent in this case is harmless for all other uses.
  return start < stop ? [start, stop] : start > stop ? [stop, start] : [start, start + 1];
}

function d3_scaleRange(scale) {
  return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}
