d3.svg.axis = function() {
  var scale = d3.scale.linear(),
      orient = d3_svg_axisDefaultOrient,
      tickMajorSize = d3_functor(6),
      tickMinorSize = d3_functor(6),
      tickEndSize = d3_functor(6),
      tickPadding = 3,
      tickArguments_ = [10],
      tickValues = null,
      tickFormat_ = null,
      tickFormatExtended_,
      tickFilter = d3_functor(true),
      tickSubdivide = null;

  function axis(g) {
    // Ticks, or domain values for ordinal scales.
    var ticks = (tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain()) : tickValues)
                  .map(d3_svg_axisMapTicks),
        tickFormat = (tickFormat_ == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : d3.format(".f")) : tickFormat_);

    // Minor ticks.
    var subticks = d3_svg_axisSubdivide(scale, ticks, tickSubdivide);
    subticks = subticks.filter(function(d, i, a) {
      return tickFilter(d, d.index, ticks, i, a);
    });

    var range = d3_scaleRange(scale);

    if (g) {
      g.each(function() {
        var g = d3.select(this);
        var subtick = g.selectAll(".tick.minor");
        subtick = subtick.data(subticks, function(d, i) {
          return String(d.value);
        });
        var subtickEnter = subtick.enter().insert("line", ".tick").attr("class", "tick minor").style("opacity", 1e-6);
        var subtickExit = d3.transition(subtick.exit()).style("opacity", 1e-6).remove();
        var subtickUpdate = d3.transition(subtick).style("opacity", 1);

        // Major ticks.
        var tick = g.selectAll(".tick.major").data(ticks, function(d, i) {
              return String(d.value);
            }),
            tickEnter = tick.enter().insert("g", "path").attr("class", "tick major").style("opacity", 1e-6),
            tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(),
            tickUpdate = d3.transition(tick).style("opacity", 1),
            tickTransform;

        // Domain.
        var path = g.selectAll(".domain").data([0]);
		path.enter().append("path").attr("class", "domain");
        var pathUpdate = d3.transition(path);

        // Stash a snapshot of the new scale, and retrieve the old snapshot.
        var scale1 = scale.copy(),
            scale0 = this.__chart__ || scale1;
        this.__chart__ = scale1;

        tickEnter.append("line").attr("class", "tick-line");
        tickEnter.append("text").attr("class", "tick-text");

        var lineEnter = tickEnter.select("line.tick-line"),
            lineUpdate = tickUpdate.select("line.tick-line"),
            text = tick.select("text.tick-text").text(function(d, i) {
              if (tickFormatExtended_ == null) {
                return tickFormat(d.value);
              } else {
                return tickFormatExtended_(d, i);
              }
            }),
            textEnter = tickEnter.select("text.tick-text"),
            textUpdate = tickUpdate.select("text.tick-text");

        switch (orient) {
          case "bottom": {
            tickTransform = d3_svg_axisX;
            subtickEnter.attr("x2", 0).attr("y2", tickMinorSize);
            subtickUpdate.attr("x2", 0).attr("y2", tickMinorSize);
            lineEnter.attr("x2", 0).attr("y2", tickMajorSize);
            textEnter.attr("x", 0).attr("y", function(d, i) {
              return Math.max(+tickMajorSize(d, i), 0) + tickPadding;
            });
            lineUpdate.attr("x2", 0).attr("y2", tickMajorSize);
            textUpdate.attr("x", 0).attr("y", function (d, i) {
              return Math.max(+tickMajorSize(d, i), 0) + tickPadding;
            });
            text.attr("dy", ".71em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize(range, 0) + "V0H" + range[1] + "V" + tickEndSize(range, 1));
            break;
          }
          case "top": {
            tickTransform = d3_svg_axisX;
            subtickEnter.attr("y2", function(d, i) {
              return -tickMinorSize(d, i);
            });
            subtickUpdate.attr("x2", 0).attr("y2", function(d, i) {
              return -tickMinorSize(d, i);
            });
            lineEnter.attr("y2", function(d, i) {
              return -tickMajorSize(d, i);
            });
            textEnter.attr("y", function(d, i) {
              return -(Math.max(+tickMajorSize(d, i), 0) + tickPadding);
            });
            lineUpdate.attr("x2", 0).attr("y2", function(d, i) {
              return -tickMajorSize(d, i);
            });
            textUpdate.attr("x", 0).attr("y", function(d, i) {
              return -(Math.max(+tickMajorSize(d, i), 0) + tickPadding);
            });
            text.attr("dy", "0em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize(range, 0) + "V0H" + range[1] + "V" + -tickEndSize(range, 1));
            break;
          }
          case "left": {
            tickTransform = d3_svg_axisY;
            subtickEnter.attr("x2", function(d, i) {
              return -tickMinorSize(d, i);
            });
            subtickUpdate.attr("x2", function(d, i) {
              return -tickMinorSize(d, i);
            }).attr("y2", 0);
            lineEnter.attr("x2", function(d, i) {
              return -tickMajorSize(d, i);
            });
            textEnter.attr("x", function(d, i) {
              return -(Math.max(+tickMajorSize(d, i), 0) + tickPadding);
            });
            lineUpdate.attr("x2", function(d, i) {
              return -tickMajorSize(d, i);
            }).attr("y2", 0);
            textUpdate.attr("x", function(d, i) {
              return -(Math.max(+tickMajorSize(d, i), 0) + tickPadding);
            }).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "end");
            pathUpdate.attr("d", "M" + -tickEndSize(range, 0) + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize(range, 1));
            break;
          }
          case "right": {
            tickTransform = d3_svg_axisY;
            subtickEnter.attr("x2", tickMinorSize);
            subtickUpdate.attr("x2", tickMinorSize).attr("y2", 0);
            lineEnter.attr("x2", tickMajorSize);
            textEnter.attr("x", function(d, i) {
              return Math.max(+tickMajorSize(d, i), 0) + tickPadding;
            });
            lineUpdate.attr("x2", tickMajorSize).attr("y2", 0);
            textUpdate.attr("x", function(d, i) {
              return Math.max(+tickMajorSize(d, i), 0) + tickPadding;
            }).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "start");
            pathUpdate.attr("d", "M" + tickEndSize(range, 0) + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize(range, 1));
            break;
          }
        }

        // For quantitative scales:
        // - enter new ticks from the old scale
        // - exit old ticks to the new scale
        if (scale.ticks) {
          tickEnter.call(tickTransform, scale0);
          tickUpdate.call(tickTransform, scale1);
          tickExit.call(tickTransform, scale1);
          subtickEnter.call(tickTransform, scale0);
          subtickUpdate.call(tickTransform, scale1);
          subtickExit.call(tickTransform, scale1);
        }

        // For ordinal scales:
        // - any entering ticks are undefined in the old scale
        // - any exiting ticks are undefined in the new scale
        // Therefore, we only need to transition updating ticks.
        else {
          var dx = scale1.rangeBand() / 2, x = function(d) { return scale1(d) + dx; };
          tickEnter.call(tickTransform, x);
          tickUpdate.call(tickTransform, x);
        }
      });
      return false;
    } else {
      // when using d3.axis other than in a d3.selection.call(...); produce the ticks, etc. for custom work:
      return {
        ticks: ticks,
        subticks: subticks,
        range: range,                            // array[2]
        tickMajorSize: tickMajorSize,            // functor(d, i)
        tickMinorSize: tickMinorSize,            // functor(d, i)
        tickEndSize: tickEndSize,                // functor(d, i)
        tickPadding: tickPadding,                // Number
        tickFormat: tickFormat,                  // functor(d)
        tickFormatExtended: tickFormatExtended_  // functor(d, i)
      };
    }
  }

  axis.scale = function(x) {
    if (!arguments.length) return scale;
    scale = x;
    return axis;
  };

  axis.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
    return axis;
  };

  axis.ticks = function() {
    if (!arguments.length) return tickArguments_;
    tickArguments_ = arguments;
    return axis;
  };

  axis.tickValues = function(x) {
    if (!arguments.length) return tickValues;
    tickValues = x;
    return axis;
  };

  // f: expects null or a d3.format() compatible function
  axis.tickFormat = function(f) {
    if (!arguments.length) return tickFormat_;
    tickFormat_ = f;
    return axis;
  };

  axis.tickFormatEx = function(x) {
    if (!arguments.length) return tickFormatExtended_;
    tickFormatExtended_ = extended;
    return axis;
  };

  axis.tickSize = function(major, minor) {
    var n = arguments.length;
    if (!n) return [tickMajorSize, tickMinorSize, tickEndSize];
    tickMajorSize = d3_functor(major);
    tickMinorSize = n > 1 ? d3_functor(minor) : tickMajorSize;
    tickEndSize = d3_functor(arguments[n - 1]);
    return axis;
  };

  axis.tickPadding = function(x) {
    if (!arguments.length) return tickPadding;
    tickPadding = +x;
    return axis;
  };

  axis.tickSubdivide = function(x) {
    if (!arguments.length) return tickSubdivide;
    tickSubdivide = (x != null ? typeof x !== "function" ? d3_svg_axisTickSubDivideOneTick(+x) : x : null);
    return axis;
  };

  axis.tickFilter = function(x) {
    if (!arguments.length) return tickFilter;
    tickFilter = (x != null ? d3_functor(x) : d3_functor(true));
    return axis;
  };

  return axis;
};

var d3_svg_axisDefaultOrient = "bottom",
    d3_svg_axisOrients = {top: 1, right: 1, bottom: 1, left: 1};

function d3_svg_axisX(selection, x) {
  selection.attr("transform", function(d) {
    return "translate(" + x(d.value) + ",0)";
  });
}

function d3_svg_axisY(selection, y) {
  selection.attr("transform", function(d) {
    return "translate(0," + y(d.value) + ")";
  });
}

function d3_svg_axisSubdivide(scale, ticks, subdiv) {
  var subticks = [];
  if (subdiv && ticks.length > 1) {
    var extent = d3_scaleExtent(scale.domain()),
        i,
        n = ticks.length;
    for (i = 0; i <= n; i++) {
      subticks = subdiv(subticks, ticks, i, n, extent);
    }
  }
  return subticks;
}

// Return a function which produces an array of subtick objects for one tick interval:
function d3_svg_axisTickSubDivideOneTick(modulus) {
  modulus++;
  return function(subticks, ticks, i, n, extent) {
    var t0, t1, delta, s, j, v;

    if (i == 0) {
      t0 = ticks[0];
      t1 = ticks[1];
      delta = (t1.value - t0.value) / modulus;
      for (j = modulus; j-- > 1; ) {
        v = t0.value - j * delta;
        if (v > extent[0]) {
          subticks.push({
            value: v,
            index: -1,
            base: t0,
            subindex: -j,
            modulus: modulus,
            majors: ticks
          });
        }
      }
    } else if (i == n) {
      t0 = ticks[n - 2];
      t1 = ticks[n - 1];
      delta = (t1.value - t0.value) / modulus;
      for (j = modulus; j-- > 1; ) {
        v = t1.value + j * delta;
        if (v < extent[1]) {
          subticks.push({
            value: v,
            index: n - 1,
            base: t1,
            subindex: j,
            modulus: modulus,
            majors: ticks
          });
        }
      }
    } else {
      t0 = ticks[i - 1];
      t1 = ticks[i];
      delta = (t1.value - t0.value) / modulus;
      for (j = modulus; j-- > 1; ) {
        v = t0.value + j * delta;
        if (v > extent[0]) {
          subticks.push({
            value: v,
            index: i - 1,
            base: t0,
            subindex: j,
            modulus: modulus,
            majors: ticks
          });
        }
      }
    }
    return subticks;
  };
}

function d3_svg_axisMapTicks(v, i, ticks) {
  return {
    value: v,
    index: i
  };
}
