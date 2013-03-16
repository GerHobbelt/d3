import "../scale/linear";
import "../scale/scale";
import "../selection/selection";
import "../transition/transition";
import "svg";

d3.svg.axis = function() {
  var scale = d3.scale.linear(),
      orient = d3_svg_axisDefaultOrient,
      tickMajorSize = 6,
      tickMinorSize = 6,
      tickEndSize = 6,
      tickPadding = 3,
      tickArguments_ = [10],
      tickValues = null,
      tickFormat_ = null,
      tickFormatExtended_ = null,
      tickFilter = 2,
      tickSubdivide = 0,
      tickMajorSize_f = d3_functor(tickMajorSize),
      tickMinorSize_f = d3_functor(tickMinorSize),
      tickEndSize_f = d3_functor(tickEndSize);

  function axis(g) {
    // Ticks (+ optional subticks), or domain values for ordinal scales.
    var ticks = (tickValues == null ?
                 scale.ticks ?
                  ((ticks = scale.ticks.apply(scale, tickArguments_, tickSubdivide)) && ticks.range) ?
				   ticks :
				   ticks.map(d3_svg_axisMapTicks) :
                  { range: scale.domain().map(d3_svg_axisMapTicks), submodulus: 0 } :
                 tickValues.range ?
                  tickValues :
                  { range: tickValues.map(d3_svg_axisMapTicks), submodulus: 0 }),
        tickFormat = (tickFormat_ == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : d3.format(".f")) : tickFormat_);

    // Minor ticks?
    var subticks = [],
        majorticks = [],
        arr = ticks.range,
        d,
        i;
    if (typeof tickFilter === "function") {
      for (i = 0; i < arr.length; i++) {
        d = arr[i];
        if (tickFilter(d, i, ticks)) {
          subticks.push(d);
        } else {
          majorticks.push(d);
        }
      }
    } else if (tickFilter) {
      for (i = 0; i < arr.length; i++) {
        d = arr[i];
        if (d.subindex) {
          subticks.push(d);
        } else {
          majorticks.push(d);
        }
      }
    } else {
      majorticks = arr;
    }

    var range = d3_scaleRange(scale);

    if (g) {
      g.each(function() {
        var g = d3.select(this);
        // Draw the (minor) ticks.
        var subtick = g.selectAll(".tick.minor").data(subticks, function(d, i) {
          return String(d.value);
        });
        var subtickEnter = subtick.enter().insert("line", ".tick").attr("class", "tick minor").style("opacity", 1e-6);
        var subtickExit = d3.transition(subtick.exit()).style("opacity", 1e-6).remove();
        var subtickUpdate = d3.transition(subtick).style("opacity", 1);

        // Draw the (major) ticks.
        var tick = g.selectAll(".tick.major").data(majorticks, function(d, i) {
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
            subtickEnter.attr("x2", 0).attr("y2", tickMinorSize_f);
            subtickUpdate.attr("x2", 0).attr("y2", tickMinorSize_f);
            lineEnter.attr("x2", 0).attr("y2", tickMajorSize_f);
            textEnter.attr("x", 0).attr("y", function(d, i) {
              return Math.max(+tickMajorSize_f(d, i), 0) + tickPadding;
            });
            lineUpdate.attr("x2", 0).attr("y2", tickMajorSize_f);
            textUpdate.attr("x", 0).attr("y", function (d, i) {
              return Math.max(+tickMajorSize_f(d, i), 0) + tickPadding;
            });
            text.attr("dy", ".71em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize_f(range, 0) + "V0H" + range[1] + "V" + tickEndSize_f(range, 1));
            break;
          }
          case "top": {
            tickTransform = d3_svg_axisX;
            subtickEnter.attr("y2", function(d, i) {
              return -tickMinorSize_f(d, i);
            });
            subtickUpdate.attr("x2", 0).attr("y2", function(d, i) {
              return -tickMinorSize_f(d, i);
            });
            lineEnter.attr("y2", function(d, i) {
              return -tickMajorSize_f(d, i);
            });
            textEnter.attr("y", function(d, i) {
              return -(Math.max(+tickMajorSize_f(d, i), 0) + tickPadding);
            });
            lineUpdate.attr("x2", 0).attr("y2", function(d, i) {
              return -tickMajorSize_f(d, i);
            });
            textUpdate.attr("x", 0).attr("y", function(d, i) {
              return -(Math.max(+tickMajorSize_f(d, i), 0) + tickPadding);
            });
            text.attr("dy", "0em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize_f(range, 0) + "V0H" + range[1] + "V" + -tickEndSize_f(range, 1));
            break;
          }
          case "left": {
            tickTransform = d3_svg_axisY;
            subtickEnter.attr("x2", function(d, i) {
              return -tickMinorSize_f(d, i);
            });
            subtickUpdate.attr("x2", function(d, i) {
              return -tickMinorSize_f(d, i);
            }).attr("y2", 0);
            lineEnter.attr("x2", function(d, i) {
              return -tickMajorSize_f(d, i);
            });
            textEnter.attr("x", function(d, i) {
              return -(Math.max(+tickMajorSize_f(d, i), 0) + tickPadding);
            });
            lineUpdate.attr("x2", function(d, i) {
              return -tickMajorSize_f(d, i);
            }).attr("y2", 0);
            textUpdate.attr("x", function(d, i) {
              return -(Math.max(+tickMajorSize_f(d, i), 0) + tickPadding);
            }).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "end");
            pathUpdate.attr("d", "M" + -tickEndSize_f(range, 0) + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize_f(range, 1));
            break;
          }
          case "right": {
            tickTransform = d3_svg_axisY;
            subtickEnter.attr("x2", tickMinorSize_f);
            subtickUpdate.attr("x2", tickMinorSize_f).attr("y2", 0);
            lineEnter.attr("x2", tickMajorSize_f);
            textEnter.attr("x", function(d, i) {
              return Math.max(+tickMajorSize_f(d, i), 0) + tickPadding;
            });
            lineUpdate.attr("x2", tickMajorSize_f).attr("y2", 0);
            textUpdate.attr("x", function(d, i) {
              return Math.max(+tickMajorSize_f(d, i), 0) + tickPadding;
            }).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "start");
            pathUpdate.attr("d", "M" + tickEndSize_f(range, 0) + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize_f(range, 1));
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
          var dx = scale1.rangeBand() / 2,
              x = function(d) {
                return scale1(d) + dx;
              };
          tickEnter.call(tickTransform, x);
          tickUpdate.call(tickTransform, x);
        }
      });
      return false;
    } else {
      // when using d3.axis other than in a d3.selection.call(...); produce the ticks, etc. for custom work:
      return {
        ticks: ticks,                            // Object { ticks: Array of Tick Objects, submodulo: Number }
        majorticks: majorticks,                  // Array of Tick Object { value: domainvalue, subindex: Number, majorindex: Number }
        subticks: subticks,                      // Array of Tick Object { value: domainvalue, subindex: Number, majorindex: Number }
        range: range,                            // array[2]
		    orient: orient,                          // String
        tickMajorSize: tickMajorSize_f,          // functor(d, i)
        tickMinorSize: tickMinorSize_f,          // functor(d, i)
        tickEndSize: tickEndSize_f,              // functor(d, i)
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
    tickFormat_ = (typeof f === "function" ? f : null);
    return axis;
  };

  axis.tickFormatEx = function(x) {
    if (!arguments.length) return tickFormatExtended_;
    tickFormatExtended_ = extended;
    return axis;
  };

  axis.tickSize = function(major, minor /*, end */) {
    var n = arguments.length;
    if (!n) return [tickMajorSize, tickMinorSize, tickEndSize];
    tickMajorSize = major;
    tickMajorSize_f = d3_functor(tickMajorSize);
    tickMinorSize = (n > 1 ? minor : tickMajorSize);
    tickMinorSize_f = d3_functor(tickMinorSize);
    tickEndSize = arguments[n - 1];
    tickEndSize_f = d3_functor(tickEndSize);
    return axis;
  };

  axis.tickPadding = function(x) {
    if (!arguments.length) return tickPadding;
    tickPadding = +x;
    return axis;
  };

  axis.tickSubdivide = function(x) {
    if (!arguments.length) return tickSubdivide;
    tickSubdivide = +x;
    return axis;
  };

  axis.tickFilter = function(x) {
    if (!arguments.length) return tickFilter;
    tickFilter = (x != null ? x : 2);
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

function d3_svg_axisMapTicks(v, i, ticks) {
  return {
    value: v,
    subindex: 0,
    majorindex: i
  };
}
