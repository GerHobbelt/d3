d3.scale.formula = function() {
  return d3_scale_formula([0, 1], [0, 1], d3.interpolate, false);
};

function d3_scale_formula(domain, range, interpolate, clamp) {
  var output,
      input,
      transformer;

  function rescale() {
    var transfunc = Math.min(domain.length, range.length) > 2 ? d3_scale_polyformula : d3_scale_biformula,
        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
    output = transfunc(domain, range, uninterpolate, interpolate);
    input = transfunc(range, domain, uninterpolate, d3.interpolate);
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
    return d3_scale_formulaTicks(domain, m, subdiv_count);
  };

  scale.tickFormat = function(m) {
    return d3_scale_formulaTickFormat(domain, m);
  };

  scale.nice = function() {
    d3_scale_nice(domain, d3_scale_formulaNice);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_formula(domain, range, interpolate, clamp);
  };

  return rescale();
}

function d3_scale_formulaRebind(scale, formula) {
  return d3.rebind(scale, formula, "range", "rangeRound", "interpolate", "clamp");
}

function d3_scale_formulaNice(dx) {
  dx = Math.pow(10, Math.round(Math.log(dx) / Math.LN10) - 1);
  return dx && {
    floor: function(x) { return Math.floor(x / dx) * dx; },
    ceil: function(x) { return Math.ceil(x / dx) * dx; }
  };
}

function d3_scale_formulaTickRange(domain, m) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= 0.15) step *= 10;
  else if (err <= 0.35) step *= 5;
  else if (err <= 0.75) step *= 2;

  // Round start and stop values to step interval.
  extent[0] = Math.ceil(extent[0] / step) * step;
  extent[1] = Math.floor(extent[1] / step) * step + step * 0.5; // inclusive
  extent[2] = step;
  return extent;
}

function d3_scale_formulaTicks(domain, m) {
  return d3.range.apply(d3, d3_scale_formulaTickRange(domain, m));
}

function d3_scale_formulaTickFormat(domain, m) {
  return d3.format(",." + Math.max(0, -Math.floor(Math.log(d3_scale_formulaTickRange(domain, m)[2]) / Math.LN10 + 0.01)) + "f");
}
