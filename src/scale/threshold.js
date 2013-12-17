import "../arrays/bisect";
import "scale";

d3.scale.threshold = function() {
  return d3_scale_threshold([.5], [0, 1]);
};

function d3_scale_threshold(domain, range) {

  function scale(x) {
    // ASSUMPTION: domain.length == range.length - 1
    if (x <= x) return range[d3.bisect(domain, x)];
  }

  scale.invert = function(y) {
    if (Number(range[0]) === NaN) {
      for (var i = 0; i < range.length; ++i) {
        if (range[i] === y) {
          return domain[i];
        }
      }
      return NaN;
    } else {
      var i0 = d3.bisect(range, y);
      var i1 = i0 + 1;
      if (i1 < domain.length) {
        var delta = (y - range[i0]) / (range[i1] - range[i0]);
        return domain[i0] + delta * (domain[i1] - domain[i0]);
      } else if (i0 > 0) {
        return domain[i0] + delta * (domain[i0 - 1] - domain[i0]);
      } else {
        return domain[i0] + delta;
      }
    }
  };

  scale.domain = function(_) {
    if (!arguments.length) return domain;
    domain = _;
    return scale;
  };

  scale.range = function(_) {
    if (!arguments.length) return range;
    range = _;
    return scale;
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    return [domain[y - 1], domain[y]];
  };

  scale.ticks = function(m, subdiv_count) {
    var l = Math.min(domain.length, range.length - 1);
    if (l > 0) {
      var t = [], i;
      t.push(+domain[0] - 1);
      for (i = 1; i < l; i++) {
        t.push((+domain[i] + +domain[i - 1]) / 2);
      }
      t.push(+domain[l - 1] + 1);
      return t;
    }
    return [];
  };

  scale.copy = function() {
    return d3_scale_threshold(domain, range);
  };

  return scale;
};
