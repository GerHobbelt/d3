/*
 * d3.scale.cyclic.triangular()
 *
 * This is a separate 'cyclic' scale which was created for performance reasons: most users
 * will need d3.scale.cyclic(), i.e. the 'sawtooth' cyclic repeat scale and loading that
 * one with additional overhead to support another, very similar, cyclic mode which is
 * used much less often would be counterproductive.
 *
 * Coding Notes
 * ------------
 *
 * For performance reasons, d3.scale.cyclic.triangular() is self-contained. This also means
 * that it is an almost straight copy of the d3.scale.cyclic() code; maintenance is easy as
 * you can use your favorite visual diff (compare) tool to compare both source files:
 * cyclic.js and cyclic.triangular.js
 */

import "scale";
import "cyclic";

d3.scale.cyclic.triangular = function() {
  return d3_scale_cyclic_triangular(2, 0);
};

// the d3.scale.cyclic.triangular() is identical to the d3.scale.identity() scale, apart from the repeating character
function d3_scale_cyclic_triangular(period, offset) {

  function scale(x) {
    // http://jsperf.com/correct-modulo-operator-implementation
    var y;
    x -= offset;
    if ((y = x % (2 * period)) < 0 && period > 0 || y > 0 && period < 0) {
      y += period;
    }
    // the range is INCLUSIVE 'period', hence the output range is [0..period] (plus offset, of course):
    if (y > period) {
      y = 2 * period - y;
    }
    return y + offset;
  }

  function rescale(domain) {
    period = +domain[domain.length - 1] - +domain[0];
    offset = +domain[0];
    return scale;
  }

  scale.invert = function(x) {
    return +x;
  };

  scale.domain = scale.range = function(x) {
    if (!arguments.length) return [offset, offset + period];
    return rescale(x);
  };

  scale.period = function(x) {
    if (!arguments.length) return period;
    return rescale([offset, offset + x]);
  };

  scale.offset = function(x) {
    if (!arguments.length) return offset;
    return rescale([x, x + domain]);
  };

  scale.ticks = function(m, subdiv_count) {
    return d3_scale_linearTicks(scale.domain(), m, subdiv_count);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(scale.domain(), m, format);
  };

  // Not supported:
  // - d3.scale.cyclic.triangular.nice() as that would not make sense: it would implicitly modify the period and offset.
  // - d3.scale.cyclic.triangular.rangeRound() for the same reason (as d3.scale.cyclic shares the characteristics of d3.scale.identity())
  // - d3.scale.cyclic.triangular.interpolate() as d3.scale.cyclic shares the characteristics of d3.scale.identity() and hence makes .interpolate() a no-op.
  // - d3.scale.cyclic.triangular.clamp() as clamping to a domain/range which would otherwise 'wrap around' makes no sense.

  scale.copy = function() {
    return d3_scale_cyclic_triangular(period, offset);
  };

  return scale;
}
