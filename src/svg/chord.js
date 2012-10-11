d3.svg.chord = function() {
  var source = d3_svg_chordSource,
      target = d3_svg_chordTarget,
      radius = d3_svg_chordRadius,
      startAngle = d3_svg_arcStartAngle,
      endAngle = d3_svg_arcEndAngle;

  // TODO Allow control point to be customized.
  function dist2(p0, p1) {
    var x = p1[0] - p0[0];
    var y = p1[1] - p0[1];
    return x * x + y * y;
  }

  function lerp(p0, t, p1) {
    return [(p1[0] - p0[0]) * t, (p1[1] - p0[1]) * t];
  }

  function chord(d, i) {
    var s = subgroup(this, source, d, i),
        t = subgroup(this, target, d, i);
    var c0, c1;
    var lrp = 0.66;
    if (dist2(s.p0, t.p1) > dist2(s.p1, t.p0)) {
      c0 = lerp([0, 0], lrp, s.p0);
      c1 = lerp([0, 0], lrp, t.p1);
    } else {
      c0 = lerp([0, 0], lrp, s.p1);
      c1 = lerp([0, 0], lrp, t.p0);
    }
    return "M" + s.p0
      + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t)
      ? curve(s.p1, c0, c1, s.p0)
      : curve(s.p1, c0, c1, t.p0)
      + arc(t.r, t.p1, t.a1 - t.a0)
      + curve(t.p1, c1, c0, s.p0))
      + "Z";
  }

  function subgroup(self, f, d, i) {
    var subgroup = f.call(self, d, i),
        r = radius.call(self, subgroup, i),
        a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset,
        a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
    return {
      r: r,
      a0: a0,
      a1: a1,
      p0: [r * Math.cos(a0), r * Math.sin(a0)],
      p1: [r * Math.cos(a1), r * Math.sin(a1)]
    };
  }

  function equals(a, b) {
    return a.a0 == b.a0 && a.a1 == b.a1;
  }

  function arc(r, p, a) {
    return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
  }

  function curve(p0, c0, c1, p1) {
    //return "Q 0,0 " + p1;
    return "C " + c0 + " " + c1 + " " + p1;
  }

  chord.radius = function(v) {
    if (!arguments.length) return radius;
    radius = d3_functor(v);
    return chord;
  };

  chord.source = function(v) {
    if (!arguments.length) return source;
    source = d3_functor(v);
    return chord;
  };

  chord.target = function(v) {
    if (!arguments.length) return target;
    target = d3_functor(v);
    return chord;
  };

  chord.startAngle = function(v) {
    if (!arguments.length) return startAngle;
    startAngle = d3_functor(v);
    return chord;
  };

  chord.endAngle = function(v) {
    if (!arguments.length) return endAngle;
    endAngle = d3_functor(v);
    return chord;
  };

  return chord;
};

function d3_svg_chordSource(d) {
  return d.source;
}

function d3_svg_chordTarget(d) {
  return d.target;
}

function d3_svg_chordRadius(d) {
  return d.radius;
}

function d3_svg_chordStartAngle(d) {
  return d.startAngle;
}

function d3_svg_chordEndAngle(d) {
  return d.endAngle;
}
