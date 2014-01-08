import "../arrays/range";
import "../core/rebind";
import "../interpolate/interpolate";
import "../interpolate/round";
import "../interpolate/uninterpolate";
import "../format/format";
import "bilinear";
import "nice";
import "polylinear";
import "scale";

d3.scale.linear = function() {
  return d3_scale_linear([0, 1], [0, 1], d3_uninterpolateNumber, d3_interpolate);
};

function d3_scale_linear(domain, range, uninterpolate, interpolate) {
  var output,
      input;

  function rescale() {
    var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear;
    output = linear(domain, range, uninterpolate, interpolate);
    input = linear(range, domain, uninterpolate, d3_interpolate);
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

  scale.domainClamp = function(x) {
    return scale.domain(x).uninterpolate(d3_uninterpolateClamp);
  };

  scale.clamp = function(x) {
    if (!arguments.length) return uninterpolate === d3_uninterpolateClamp;
    if (x) {
      interpolate = d3_uninterpolateClamp;
    } else {
      interpolate = d3_uninterpolateNumber;
    }
  };

  scale.uninterpolate = function(x) {
    if (!arguments.length) return uninterpolate;
    uninterpolate = x;
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.rangeRound = function(x) {
    return scale.range(x).interpolate(d3_interpolateRound);
  };

  scale.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolate = x;
    return rescale();
  };

  scale.ticks = function(m, subdiv_count) {
    return d3_scale_linearTicks(domain, m, subdiv_count);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    d3_scale_linearNice(domain, m);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_linear(domain, range, uninterpolate, interpolate);
  };

  return rescale();
}

function d3_scale_linearRebind(scale, linear) {
  return d3.rebind(scale, linear, "range", "rangeRound", "uninterpolate", "interpolate", "clamp");
}

function d3_scale_linearNice(domain, m) {
  return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
}

function d3_scale_linearTickRange(domain, m, subdiv_count) {
  m = m || 10;
  subdiv_count = subdiv_count || 1;  

  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step,
      err,
      substep;

  // Prevent errors and otherwise odd behaviour by providing a sane extent, even when the domain carries zero or one(1) data point only:
  if (span == 0 || !extent.every(isFinite)) {
    step = 1;
    err = 1;
  } else {
    step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
    err = m / span * step;
  }

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;
  substep = step * subdiv_count;

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

  // backwards compatible behaviour: when subdiv_count is undefined (or zero/falsey), a simple array of tick values is produced:
  if (!subdiv_count) {
    //subdiv_count = 1;
    return d3.range.apply(d3, extent);
  }

  // d3.range but now producing a series of tick objects
  var start = extent[0] - extent[2], stop = extent[6], step = extent[7], left_edge = extent[3];
  if (!isFinite((stop - start) / step)) throw new Error("infinite range");
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
        subindex: i % subdiv_count,
        majorindex: (i / subdiv_count) | 0       // fastest way to turn a float into an integer across browsers: http://jsperf.com/math-floor-vs-math-round-vs-parseint/18
      });
    }
  } else {
    while ((j = start + step * ++i) < left_edge)
      ;
    for ( ; j < stop; j = start + step * ++i) {
      range.push({
        value: j / k,
        subindex: i % subdiv_count,
        majorindex: (i / subdiv_count) | 0       // fastest way to turn a float into an integer across browsers: http://jsperf.com/math-floor-vs-math-round-vs-parseint/18
      });
    }
  }
  return {
    range: range,
    submodulus: subdiv_count
  };
}

function d3_scale_linearTickFormat(domain, m, format) {
  var range = d3_scale_linearTickRange(domain, m);
  return d3.format(format
      ? format.replace(d3_format_re, function(a, b, c, d, e, f, g, h, i, j) { return [b, c, d, e, f, g, h, i || "." + d3_scale_linearFormatPrecision(j, range), j].join(""); })
      : ",." + d3_scale_linearPrecision(range[2]) + "f");
}

var d3_scale_linearFormatSignificant = {s: 1, g: 1, p: 1, r: 1, e: 1};

// Returns the number of significant digits after the decimal point.
function d3_scale_linearPrecision(value) {
  return -Math.floor(Math.log(value) / Math.LN10 + .01);
}

// For some format types, the precision specifies the number of significant
// digits; for others, it specifies the number of digits after the decimal
// point. For significant format types, the desired precision equals one plus
// the difference between the decimal precision of the range’s maximum absolute
// value and the tick step’s decimal precision. For format "e", the digit before
// the decimal point counts as one.
function d3_scale_linearFormatPrecision(type, range) {
  var p = d3_scale_linearPrecision(range[2]);
  return type in d3_scale_linearFormatSignificant
      ? Math.abs(p - d3_scale_linearPrecision(Math.max(Math.abs(range[0]), Math.abs(range[1])))) + +(type !== "e")
      : p - (type === "%") * 2;
}
