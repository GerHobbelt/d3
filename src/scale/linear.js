d3.scale.linear = function() {
  return d3_scale_linear([0, 1], [0, 1], d3.interpolate, false);
};

function d3_scale_linear(domain, range, interpolate, clamp) {
  var output,
      input;

  function rescale() {
    var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear,
        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
    output = linear(domain, range, uninterpolate, interpolate);
    input = linear(range, domain, uninterpolate, d3.interpolate);
    return scale;
  }

  function scale(x) {
    return output(x);
  }

  // Note: requires range is coercible to number!
  scale.invert = function(y) {
    return input(y);
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(Number);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.rangeRound = function(x) {
    return scale.range(x).interpolate(d3.interpolateRound);
  };

  scale.clamp = function(x) {
    if (!arguments.length) return clamp;
    clamp = x;
    return rescale();
  };

  scale.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolate = x;
    return rescale();
  };

  scale.ticks = function(m, subdiv_count) {
    return d3_scale_linearTicks(domain, m, subdiv_count);
  };

  scale.tickFormat = function(m) {
    return d3_scale_linearTickFormat(domain, m);
  };

  scale.nice = function() {
    d3_scale_nice(domain, d3_scale_linearNice);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_linear(domain, range, interpolate, clamp);
  };

  return rescale();
}

function d3_scale_linearRebind(scale, linear) {
  return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
}

function d3_scale_linearNice(dx) {
  dx = Math.pow(10, Math.round(Math.log(dx) / Math.LN10) - 1);
  return dx && {
    floor: function(x) { return Math.floor(x / dx) * dx; },
    ceil: function(x) { return Math.ceil(x / dx) * dx; }
  };
}

function d3_scale_linearTickRange(domain, m, subdiv_count) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step,
      substep;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;
  substep = step * (subdiv_count || 1);

  // Set extent for the subticks + store the true extent for further use by the caller:
  extent[3] = extent[0];
  extent[4] = extent[1];
  extent[5] = Math.ceil(extent[0] / substep) * substep;
  extent[6] = Math.floor(extent[1] / substep) * substep + substep * .5; // inclusive
  extent[7] = substep;
  
  // Round start and stop values to step interval.
  extent[0] = Math.ceil(extent[0] / step) * step;
  extent[1] = Math.floor(extent[1] / step) * step + step * .5; // inclusive
  extent[2] = step;
  return extent;
}

function d3_scale_linearTicks(domain, m, subdiv_count) {
  var extent = d3_scale_linearTickRange(domain, m, subdiv_count);
  if (!subdiv_count || subdiv_count == 1)
    return d3.range.apply(d3, extent);
    
  // d3.range but now producing a series of tick objects
  var start = extent[0] - extent[2], stop = extent[6], step = extent[7], left_edge = extent[3];
  if ((stop - start) / step === Infinity) throw new Error("infinite range");
  var range = [],
      k = d3_range_integerScale(Math.abs(step)),
      i = -1,
      j;
  start *= k, stop *= k, step *= k, left_edge *= k;
  if (step < 0) {
    while ((j = start + step * ++i) > left_edge) 
      ;
    for ( ; j > stop; j = start + step * ++i) {
      range.push({
        value: j / k,
        sub: i % subdiv_count,
        major: (i / subdiv_count)
      });
    }
  } else {
    while ((j = start + step * ++i) < left_edge) 
      ;
    for ( ; j < stop; j = start + step * ++i) {
      range.push({
        value: j / k,
        subindex: i % subdiv_count,
        majorindex: (i / subdiv_count)
      });
    }
  }
  return {
    range: range,
    submodulus: subdiv_count
  };
}

function d3_scale_linearTickFormat(domain, m) {
  return d3.format(",." + Math.max(0, -Math.floor(Math.log(d3_scale_linearTickRange(domain, m, 1)[2]) / Math.LN10 + .01)) + "f");
}
