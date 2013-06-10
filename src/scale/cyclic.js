/*
 * d3.scale.cyclic()
 *
 * Use this scale to map values onto a cyclic, i.e. repeating range.
 *
 * This happens, for instance, when you wish to create a polar (radial) axis, where your
 * input 'coordinate' value should map onto a 0..360 degrees / 0..2π radians range.
 * Use cases include microphone sensitivity curves, radar and similar basic polar diagrams,
 * Niquist curves, etc.
 *
 * Other use cases include mapping a timeline onto a time-of-day scale, i.e. a scale where
 * you are only interested in the hour within the day but otherwise want Monday, Tuesday, etc.
 * to overlap, i.e. map onto the same 24 hour range.
 *
 * We support both 'sawtooth' and 'triangle' waveform-based repetition in d3.scale.cyclic():
 * the above use case would all most probably suit the 'sawtooth' cyclic scale, but scales
 * exist which require a 'mirroring' approach to the repetition, i.e. where an input range
 * of 0..1..2..3..4..5..6 would not map onto 0..1..2..3=0..1..2..6=0 (sawtooth) but instead
 * should map onto the 'mirrored' range 0..1..2..3=3..2..1..6=0, thus creating a
 * 'triangular waveform' rather than a 'sawtooth waveform'.
 *
 * Design Considerations
 * ---------------------
 *
 * When considering how to create various polar (radial) graphs and projections, I realized that
 * assuming a unit like 'radians' or 'degrees' would be overly restrictive on the accepted
 * input coordinates / values. (And then you still need to decide wether you wish to only support
 * the highschool math '360 degrees is full circle' or also the '400 degrees is full circle'
 * unit of measure in use in some engineering / carthography settings...)
 *
 * As other 'cycling' plots come to mind, it is essential to provide the most flexible input
 * value mapping / transformation means possible: hence the introduction of the d3.scale.cyclic()
 * scale, which can be used to map other (possibly non-linear) scales onto a repeating range,
 * plus the introduction of the d3.coordsystem group of coordinate system transformation classes.
 *
 * When you wonder why you would want to plot timelines on a radial chart, imagine for example
 * graphs showing room temperature logs on a daily basis, where you plot multiple days onto
 * the same 24 hour circular graph.
 * If you are into (seasonal) climate change analysis, the same type of chart would then sport
 * a 1 year cycle rather than a 24 hour cycle.
 *
 * When you are interested in weekly behaviours, e.g. when investigating stock market factors,
 * you might use a basic cycle of 1 week, while an electronics engineer might want to plot a
 * radial response chart with a radial base of 2F so that odd and even harmonics end up in
 * separate quadrants of the graph.
 */

import "scale";

d3.scale.cyclic = function() {
  return d3_scale_cyclic(1, 0);
};

// the d3.scale.cyclic() is identical to the d3.scale.identity() scale, apart from the repeating character
function d3_scale_cyclic(period, offset) {

  function scale(x) {
    // http://jsperf.com/correct-modulo-operator-implementation
    var y;
    x -= offset;
  // the range is EXCLUSIVE 'period', hence the output range is [0..period> (plus offset, of course):
    if ((y = x % period) < 0 && period > 0 || y > 0 && period < 0) {
      return y + period + offset;
    } else {
      return y + offset;
    }
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
  // - d3.scale.cyclic.nice() as that would not make sense: it would implicitly modify the period and offset.
  // - d3.scale.cyclic.rangeRound() for the same reason (as d3.scale.cyclic shares the characteristics of d3.scale.identity())
  // - d3.scale.cyclic.interpolate() as d3.scale.cyclic shares the characteristics of d3.scale.identity() and hence makes .interpolate() a no-op.
  // - d3.scale.cyclic.clamp() as clamping to a domain/range which would otherwise 'wrap around' makes no sense.

  scale.copy = function() {
    return d3_scale_cyclic(period, offset);
  };

  return scale;
}
