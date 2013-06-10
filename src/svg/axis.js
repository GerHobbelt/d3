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
      tickLabelPosition_ = null,
      tickFilter = 2,
      tickSubdivide = 0,
      tickSize_f,
      tickEndSize_f;

  reinit_ticksizes();

  function reinit_ticksizes() {
    var mult = +1;
    var major, minor, end;
    switch (orient) {
    case "top":
    case "left":
      mult = -1;
      break;
    }
    if (typeof tickMajorSize === "function" && typeof tickMinorSize === "function") {
      tickSize_f = function(d, i) {
        if (d.subindex) {
          return mult * tickMinorSize(d, i);
        } else {
          return mult * tickMajorSize(d, i);
        }
      };
    } else if (typeof tickMajorSize === "function" && typeof tickMinorSize !== "function") {
      minor = mult * tickMinorSize;
      tickSize_f = function(d, i) {
        if (d.subindex) {
          return minor;
        } else {
          return mult * tickMajorSize(d, i);
        }
      };
    } else if (typeof tickMajorSize !== "function" && typeof tickMinorSize === "function") {
      major = mult * tickMajorSize;
      tickSize_f = function(d, i) {
        if (d.subindex) {
          return mult * tickMinorSize(d, i);
        } else {
          return major;
        }
      };
    } else { // if (typeof tickMajorSize !== "function" && typeof tickMinorSize !== "function")
      major = mult * tickMajorSize;
      minor = mult * tickMinorSize;
      tickSize_f = function(d, i) {
        if (d.subindex) {
          return minor;
        } else {
          return major;
        }
      };
    }

    if (typeof tickEndSize === "function") {
      tickEndSize_f = function(d, i) {
        return mult * tickEndSize(d, i);
      };
    } else {
      end = mult * tickEndSize;
      tickEndSize_f = function(d, i) {
        return end;
      };
    }
  }

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

    // Filter which ticks will make it into the display. Ticks which are too closely bunched together
    // should be removed/reduced for a more aesthetic display.
    // The difference between 'major' and 'minor' ticks, in the end, is which ones will be printed with
    // a label (value) next to them: only 'major' ticks will have a value text attached.
    //
    // Another difference, though a minor one, is that 'minor' ticks have an implied 'importance',
    // which is implicit in the .subindex value: for example, a tick at the half-way position
    // (i.e. at a 0.5 'position', hence with .subindex == submodulo/2) MAY be displayed more prominently
    // than, say, the first subtick in a set of ten (hence at 'position' 0.1, i.e. .subindex == submodulo/10).
    // The .subindex value in conjuction with the submodulo value is used to help the axis component plot
    // aesthetic looking axes with, for example, classical inch or centimeter/millimeter ticks.)
    // More advanced uses of this 'tick' info is also possible: the end result is determined by the combined
    // effort of the tickFilter and the axis renderer section. Very sophisticated or alternative renderings
    // are possible by using the preprocessed (filtered) tick data in your own custom axis rendering code:
    // this option is at your disposal when the axis function is invoked without a NULL instead of an SVG group
    // in 'g'.
    //
    // Note that the filter can 'reduce' a 'major' tick (tick.subindex == 0) to a 'minor' one by
    // setting its .subindex value to a non-zero value. To ensure that other logic, which inspects the
    // 'importance' of a subtick, will continue to work a 'reduced' major-tick should receive a
    // .subindex = submodulo value: this value cannot be assigned by other means (scale.ticks()) and
    // at the same time signifies the high 'importance' of the new 'sub'tick.
    //
    // Furthermore, to ensure that tick/axis animation is smooth and provides a correct progression
    // from major-to-minor and vice versa, we render all ticks from a single selection batch, where
    // we identify 'minor' ticks by simply looking at their non-zero .subindex value.
    var arr = ticks.range,
        d,
        i;

    var range = d3_scaleRange(scale);

    // The tickFilter can be either a function or a value: when the user specified a function, then the
    // tick filtering will be performed in bulk in the user-specified function. This is useful for advanced
    // axis renderings.
    if (typeof tickFilter === "function") {
      // We pass all available context info to the tickFilter as it may use / modify this info on the fly.
      //
      // For example, we pass the tickFormat function as this MASY be used to calculate the size of the
      // 'major' tick labels, which in turn would assist in determining which 'major' ticks would actually
      // receive a label...
      var context = tickFilter({
        ticks: ticks,                            // Object { ticks: Array of Tick Objects, submodulo: Number }
        range: range                             // array[2]
      }, {
        // the read-only context components:
        scale: scale,                            // d3.scale
        orient: orient,                          // String
        tickSize: tickSize_f,                    // functor(d, i)
        tickEndSize: tickEndSize_f,              // functor(d, i)
        tickPadding: tickPadding,                // Number
        tickLabelPosition: tickLabelPosition_,   // functor(d, i)
        tickFormat: tickFormat,                  // functor(d)
        tickFormatExtended: tickFormatExtended_  // functor(d, i)
      }) || {};
      ticks = (context.ticks || ticks);
      range = (context.range || range);
    } else {
      // When the tickFilter is a number or an array, than this is the minimum required spacing between individual
      // major and minor ticks. This information is used by the default tick filter to produce a aesthetic
      // set of major and minor ticks.
      var min_spacing;
      if (!Array.isArray(tickFilter) || !tickFilter.length) {
        min_spacing = [ (Number(tickFilter) || 2), (Number(tickFilter) || 2) ];
      } else {
        min_spacing = tickFilter;
        if (!min_spacing[1]) {
          min_spacing[1] = (min_spacing[0] || 2);
        }
      }
      for (i = 0; i < arr.length; i++) {
        d = arr[i];
        if (!d.subindex) {
        }
      }
    }

    if (g) {
      g.each(function() {
        var g = d3.select(this);
        // Draw the ticks.
        //
        // Note that `tickEnter` is a D3 selection while `tickExit` and `tickUpdate` are D3 transitions.
        var tick = g.selectAll(".tick").data(ticks, function(d, i) {
              return String(d.value);
            }),
            tickEnter = tick.enter().insert("g", "path").attr("class", function(d, i) {
              return d.subindex ? "tick minor" : "tick major";
            }).style("opacity", 1e-6),
            tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(),
            tickUpdate = d3.transition(tick).attr("class", function(d, i) {
              return d.subindex ? "tick minor" : "tick major";
            }).style("opacity", 1),
            tickTransform;

        // Domain.
        var path = g.selectAll(".domain").data([0]);
        path.enter().append("path").attr("class", "domain");
        var pathUpdate = d3.transition(path);

        // Stash a snapshot of the new scale, and retrieve the old snapshot.
        var scale1 = scale.copy(),
            scale0 = this.__chart__ || scale1;
        this.__chart__ = scale1;

        // Draw the new major and minor ticks
        tickEnter.append("line").attr("class", "tick-line");
        tickEnter.filter(function(d, i) {
          return !d.subindex;
        }).append("text").attr("class", "tick-text");

        // Update the existing major and minor ticks ...
        var lineEnter = tickEnter.select("line.tick-line"),
            lineUpdate = tickUpdate.select("line.tick-line"),
            textEnter = tickEnter.select("text.tick-text");

        // ... and since we MAY reduce / promote ticks for major to minor and vice versa, we need to account for those changes as well:
        //
        // First we make sure that RIGHT NOW the 'promoted' elements have an (empty) <text> element, while
        // ensuring these promoted elements are very easily recognizable through .filter().
        ticks.filter(function(d, i) {
          return !d.subindex;
        }).each(function(d, i) {
          var node = d3.select(this);
          if (node.select("text.tick-text").empty()) {
            d.is_promoted = true;
            node.append("text").attr("class", "tick-text").style("opacity", 1e-6);
          } else {
            d.is_promoted = false;
          }
        });

        // Then we extract the promote / demote (Enter/Exit) subsets from the current 'updated' ticks selection
        // and set the new label text for all the major nodes, no matter whether new or promoted.
        //
        // As we've made sure above that the 'promoted' ticks already have an (empty) <text> DOM node RIGHT NOW, we
        // can be certain that the `text` selection constructed below will indeed contain ALL major ticks.
        var textUpdate = tickUpdate.select("text.tick-text"),
            textUpdateEnter = textUpdate.filter(function(d, i) {
              return !d.subindex && d.is_promoted;
            }),
            textUpdateExit = textUpdate.filter(function(d, i) {
              return d.subindex;
            }),
            text = tick.selectAll("text.tick-text").text(function(d, i) {
              if (tickFormatExtended_ == null) {
                return tickFormat(d.value);
              } else {
                return tickFormatExtended_(d, i);
              }
            });

        textUpdate = textUpdate.filter(function(d, i) {
          return !d.subindex;
        });

        // Apply the promote / demote major-minor tick transitions now:
        //d3.transition(textUpdateExit).style("opacity", 1e-6).remove();
        textUpdateExit.style("opacity", 1e-6).remove();
        textUpdateEnter.style("opacity", 1);

        // And render the axis with ticks and all:
        var labelPos_f = (tickLabelPosition_ == null ?
          orient == "bottom" ?
            function (d, i) {
              d3.select(this).attr("dy", ".71em").style("text-anchor", "middle");
            } : orient == "top" ?
            function (d, i) {
              d3.select(this).attr("dy", "0em").style("text-anchor", "middle");
            } :
            function (d, i) {
              d3.select(this).attr("dy", ".32em").style("text-anchor", function(d, i) {
                var l = tickSize_f(d, i);
                return l < 0 ? "end" : "start";
              });
            } : tickLabelPosition_);

        switch (orient) {
        case "bottom":
        case "top":
          tickTransform = d3_svg_axisX;
          lineEnter.attr("x2", 0).attr("y2", tickSize_f);
          textEnter.attr("x", 0).attr("y", function(d, i) {
            var l = tickSize_f(d, i);
            return l < 0 ? l - tickPadding : l + tickPadding;
          }).each(labelPos_f);
          textUpdateEnter.attr("x", 0).attr("y", function(d, i) {
            var l = tickSize_f(d, i);
            return l < 0 ? l - tickPadding : l + tickPadding;
          }).each(labelPos_f);
          lineUpdate.attr("x2", 0).attr("y2", tickSize_f);
          textUpdate.attr("x", 0).attr("y", function (d, i) {
            var l = tickSize_f(d, i);
            return l < 0 ? l - tickPadding : l + tickPadding;
          }).each(labelPos_f);
          pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize_f(range, 0) + "V0H" + range[1] + "V" + tickEndSize_f(range, 1));
          break;

        case "left":
        case "right":
          tickTransform = d3_svg_axisY;
          lineEnter.attr("y2", 0).attr("x2", tickSize_f);
          textEnter.attr("y", 0).attr("x", function(d, i) {
            var l = tickSize_f(d, i);
            return l < 0 ? l - tickPadding : l + tickPadding;
          }).each(labelPos_f);
          textUpdateEnter.attr("y", 0).attr("x", function(d, i) {
            var l = tickSize_f(d, i);
            return l < 0 ? l - tickPadding : l + tickPadding;
          }).each(labelPos_f);
          lineUpdate.attr("y2", 0).attr("x2", tickSize_f);
          textUpdate.attr("y", 0).attr("x", function(d, i) {
            var l = tickSize_f(d, i);
            return l < 0 ? l - tickPadding : l + tickPadding;
          }).each(labelPos_f);
          pathUpdate.attr("d", "M" + -tickEndSize_f(range, 0) + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize_f(range, 1));
          break;
        }

        // For quantitative scales:
        // - enter new ticks from the old scale
        // - exit old ticks to the new scale
        if (scale.ticks) {
          tickEnter.call(tickTransform, scale0);
          tickUpdate.call(tickTransform, scale1);
          tickExit.call(tickTransform, scale1);
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
        ticks: ticks,                            // Object { ticks: Array of Tick Objects, submodulo: Number } where each Tick Object: { value: domainvalue, subindex: Number, majorindex: Number }
        range: range,                            // array[2]
        scale: scale,                            // d3.scale
            orient: orient,                          // String
        tickSize: tickSize_f,                    // functor(d, i)
        tickEndSize: tickEndSize_f,              // functor(d, i)
        tickPadding: tickPadding,                // Number
        tickLabelPosition: tickLabelPosition_,   // functor(d, i)
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

  axis.tickFormatEx = function(f) {
    if (!arguments.length) return tickFormatExtended_;
    tickFormatExtended_ = (typeof f === "function" ? f : null);
    return axis;
  };

  axis.tickLabelPosition = function(f) {
    if (!arguments.length) return tickLabelPosition_;
    tickLabelPosition_ = (typeof f === "function" ? f : null);
    return axis;
  };

  axis.tickSize = function(major, minor /*, end */) {
    var n = arguments.length;
    if (!n) return [tickMajorSize, tickMinorSize, tickEndSize];
    tickMajorSize = major;
    tickMinorSize = (n > 1 ? minor : tickMajorSize);
    tickEndSize = arguments[n - 1];
    reinit_ticksizes();
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
    tickFilter = (x || 2);
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
