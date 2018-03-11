import "../core/document";
import "../core/rebind";
import "../event/drag";
import "../event/event";
import "../event/mouse";
import "../event/touches";
import "../selection/selection";
import "../interpolate/zoom";
import "behavior";

d3.behavior.zoom = function() {
  var view = {x: 0, y: 0, k: 1},
      translate0, // translate when we started zooming (to avoid drift)
      center0, // implicit desired position of translate0 after zooming
      center, // explicit desired position of translate0 after zooming
      size = [960, 500], // viewport size; required for zoom interpolation
      scaleExtent = d3_behavior_zoomInfinity,
      duration = 250,
      zooming = 0,
      zoomFactor = 2,
      robustZoom = false,
      zoomRatio = 0.002,
      mousedown = "mousedown.zoom",
      mousemove = "mousemove.zoom",
      mouseup = "mouseup.zoom",
      mousewheelTimer,
      touchtime, // time of last touchstart (to detect double-tap)
      event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"),
      x0,
      x1,
      y0,
      y1;

  // Lazily determine the DOM’s support for Wheel events.
  // https://developer.mozilla.org/en-US/docs/Mozilla_event_reference/wheel
  if (!d3_behavior_zoomWheel) {
    d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() { return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1); }, "wheel")
        : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() { return d3.event.wheelDelta; }, "mousewheel")
        : (d3_behavior_zoomDelta = function() { return -d3.event.detail; }, "MozMousePixelScroll");
  }

  if (!d3_behavior_zoomTouch) {
      if(window.PointerEvent) {
          d3_behavior_zoomTouch = {down: "pointerdown", move: "pointermove", up: "pointerup", leave: "pointerleave", enter: "pointerenter"};
          d3_behavior_zoomTouchHandler = pointerdowned;
      } else if (window.MSPointerEvent) {
          d3_behavior_zoomTouch = {down: "MSPointerDown", move: "MSPointerMove", up: "MSPointerUp", leave: "MSPointerLeave", enter: "MSPointerEnter" };
          d3_behavior_zoomTouchHandler = pointerdowned;
      } else {
          d3_behavior_zoomTouch = {down:"touchstart"};
          d3_behavior_zoomTouchHandler = touchstarted;
      }
  }

  function zoom(g) {
    g   .on(mousedown, mousedowned)
        .on(d3_behavior_zoomWheel + ".zoom", mousewheeled)
        .on("dblclick.zoom", dblclicked)
        .on(d3_behavior_zoomTouch.down + ".zoom", d3_behavior_zoomTouchHandler);
  }

  zoom.event = function(g) {
    g.each(function() {
      var dispatch = event.of(this, arguments),
          view1 = view;
      if (d3_transitionInheritId) {
        d3.select(this).transition()
            .each("start.zoom", function() {
              view = this.__chart__ || {x: 0, y: 0, k: 1}; // pre-transition state
              zoomstarted(dispatch);
            })
            .tween("zoom:zoom", function() {
              var dx = size[0],
                  dy = size[1],
                  cx = center0 ? center0[0] : dx / 2,
                  cy = center0 ? center0[1] : dy / 2,
                  i = d3.interpolateZoom(
                    [(cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k],
                    [(cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k]
                  );
              return function(t) {
                var l = i(t), k = dx / l[2];
                this.__chart__ = view = {x: cx - l[0] * k, y: cy - l[1] * k, k: k};
                zoomed(dispatch);
              };
            })
            .each("interrupt.zoom", function() {
              zoomended(dispatch);
            })
            .each("end.zoom", function() {
              zoomended(dispatch);
            });
      } else {
        this.__chart__ = view;
        zoomstarted(dispatch);
        zoomed(dispatch);
        zoomended(dispatch);
      }
    });
  };

  zoom.translate = function(_) {
    if (!arguments.length) return [view.x, view.y];
    view = {x: +_[0], y: +_[1], k: view.k}; // copy-on-write
    rescale();
    return zoom;
  };

  zoom.scale = function(_) {
    if (!arguments.length) return view.k;
    view = {x: view.x, y: view.y, k: null}; // copy-on-write
    scaleTo(+_);
    rescale();
    return zoom;
  };

  zoom.scaleExtent = function(_) {
    if (!arguments.length) return scaleExtent;
    scaleExtent = _ == null ? d3_behavior_zoomInfinity : [+_[0], +_[1]];
    return zoom;
  };

  zoom.center = function(_) {
    if (!arguments.length) return center;
    center = _ && [+_[0], +_[1]];
    return zoom;
  };

  zoom.size = function(_) {
    if (!arguments.length) return size;
    size = _ && [+_[0], +_[1]];
    return zoom;
  };

  zoom.duration = function(_) {
    if (!arguments.length) return duration;
    duration = +_; // TODO function based on interpolateZoom distance?
    return zoom;
  };

  zoom.x = function(z) {
    if (!arguments.length) return x1;
    x1 = z;
    x0 = z.copy();
    view = {x: 0, y: 0, k: 1}; // copy-on-write
    return zoom;
  };

  zoom.y = function(z) {
    if (!arguments.length) return y1;
    y1 = z;
    y0 = z.copy();
    view = {x: 0, y: 0, k: 1}; // copy-on-write
    return zoom;
  };

  zoom.zoomFactor = function(z) {
    if (!arguments.length) return zoomFactor;
    zoomFactor = z;
    return zoom;
  };

  // TRUE: turn on 'robust zooming', which only looks at the mousewheel/zoom being active yes/no, but doesn't use the mouse step value
  // FALSE: use classic zoom, with the default 0.002 factor
  // 
  // The `ratio` parameter MAY specify an alternative zoom/mouse tick factor, other than the default 0.002.
  zoom.zoomRobust = function(z, ratio) {
    if (!arguments.length) return robustZoom;
    zoomRatio = (ratio > 0 ? ratio : 0.002);
    robustZoom = !!z;
    return zoom;
  };

  function location(p) {
    return [(p[0] - view.x) / view.k, (p[1] - view.y) / view.k];
  }

  function point(l) {
    return [l[0] * view.k + view.x, l[1] * view.k + view.y];
  }

  function scaleTo(s) {
    view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
  }

  function translateTo(p, l) {
    l = point(l);
    view.x += p[0] - l[0];
    view.y += p[1] - l[1];
  }

  function zoomTo(that, p, l, k) {
    that.__chart__ = {x: view.x, y: view.y, k: view.k};

    scaleTo(Math.pow(zoomFactor, k));
    translateTo(center0 = p, l);

    that = d3.select(that);
    if (duration > 0) that = that.transition().duration(duration);
    that.call(zoom.event);
  }

  function rescale() {
    if (x1) x1.domain(x0.range().map(function(x) { return (x - view.x) / view.k; }).map(x0.invert));
    if (y1) y1.domain(y0.range().map(function(y) { return (y - view.y) / view.k; }).map(y0.invert));
  }

  function zoomstarted(dispatch) {
    if (!(zooming++)) dispatch({type: "zoomstart"});
  }

  function zoomed(dispatch) {
    rescale();
    dispatch({type: "zoom", scale: view.k, translate: [view.x, view.y]});
  }

  function zoomended(dispatch) {
    if (!--zooming) dispatch({type: "zoomend"}), center0 = null;
  }

  function mousedowned() {
    var that = this,
        dispatch = event.of(that, arguments),
        dragged = 0,
        subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended),
        location0 = location(d3.mouse(that)),
        dragRestore = d3_event_dragSuppress(that);

    d3_selection_interrupt.call(that);
    zoomstarted(dispatch);

    function moved() {
      dragged = 1;
      translateTo(d3.mouse(that), location0);
      zoomed(dispatch);
    }

    function ended() {
      subject.on(mousemove, null).on(mouseup, null);
      dragRestore(dragged);
      zoomended(dispatch);
    }
  }

  // These closures persist for as long as at least one touch is active.
  function touchstarted() {
    var that = this,
        dispatch = event.of(that, arguments),
        locations0 = {}, // touchstart locations
        distance0 = 0, // distance² between initial touches
        scale0, // scale when we started touching
        zoomName = ".zoom-" + d3.event.changedTouches[0].identifier,
        touchmove = "touchmove" + zoomName,
        touchend = "touchend" + zoomName,
        targets = [],
        subject = d3.select(that),
        dragRestore = d3_event_dragSuppress(that);

    started();
    zoomstarted(dispatch);

    // Workaround for Chrome issue 412723: the touchstart listener must be set
    // after the touchmove listener.
    subject.on(mousedown, null).on(d3_behavior_zoomTouch.down + ".zoom", started); // prevent duplicate events

    // Updates locations of any touches in locations0.
    function relocate() {
      var touches = d3.touches(that);
      scale0 = view.k;
      touches.forEach(function(t) {
        if (t.identifier in locations0) locations0[t.identifier] = location(t);
      });
      return touches;
    }

    // Temporarily override touchstart while gesture is active.
    function started() {
      // Listen for touchmove and touchend on the target of touchstart.
      var target = d3.event.target;
      d3.select(target).on(touchmove, moved).on(touchend, ended);
      targets.push(target);

      // Only track touches started on the same subject element.
      var changed = d3.event.changedTouches;
      for (var i = 0, n = changed.length; i < n; ++i) {
        locations0[changed[i].identifier] = null;
      }

      var touches = relocate(),
          now = Date.now(),
          p, q, dx, dy;

      if (touches.length === 1) {
        if (now - touchtime < 500) { // dbltap
          p = touches[0];
          zoomTo(that, p, locations0[p.identifier], Math.floor(Math.round(Math.log(view.k) / Math.log(zoomFactor) * 1e14) / 1e14) + 1);
          d3_eventPreventDefault();
        }
        touchtime = now;
      } else if (touches.length > 1) {
        p = touches[0];
        q = touches[1];
        dx = p[0] - q[0];
        dy = p[1] - q[1];
        distance0 = dx * dx + dy * dy;
      }
    }

    function moved() {
      var touches = d3.touches(that),
          p0, l0,
          p1, l1;

      d3_selection_interrupt.call(that);

      for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
        p1 = touches[i];
        l1 = locations0[p1.identifier];
        if (l1) {
          if (l0) break;
          p0 = p1;
          l0 = l1;
        }
      }

      if (l1) {
        var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1,
            scale1 = distance0 && Math.sqrt(distance1 / distance0);
        p0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        l0 = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
        scaleTo(scale1 * scale0);
      }

      touchtime = null;
      translateTo(p0, l0);
      zoomed(dispatch);
    }

    function ended() {
      // If there are any globally-active touches remaining, remove the ended
      // touches from locations0.
      if (d3.event.touches.length) {
        var changed = d3.event.changedTouches;
        for (var i = 0, n = changed.length; i < n; ++i) {
          delete locations0[changed[i].identifier];
        }
        // If locations0 is not empty, then relocate and continue listening for
        // touchmove and touchend.
        for (var identifier in locations0) {
          return void relocate(); // locations may have detached due to rotation
        }
      }
      // Otherwise, remove touchmove and touchend listeners.
      d3.selectAll(targets).on(zoomName, null);
      subject.on(mousedown, mousedowned).on(d3_behavior_zoomTouch.down + ".zoom", d3_behavior_zoomTouchHandler);

      dragRestore();
      zoomended(dispatch);
    }
  }

  var pointers = [];

  function getPointer (id){
      for (var i = 0; i < pointers.length; i++) {
          if (pointers[i].identifier == id)
              return pointers[i];
      }
  }

  function getAnotherPointer (id){
      for (var i = 0; i < pointers.length; i++) {
          if (pointers[i].identifier != id)
              return pointers[i];
      }
  }

  function addUpdatePointer(p) {
      for (var i = 0; i < pointers.length; i++) {
          if (pointers[i].identifier == p.identifier) {
              if (pointers[i][0] == p[0] && pointers[i][1] == p[1])
                  return false;

              pointers[i][0] = p[0];
              pointers[i][1] = p[1];
              return true;
          }
      }
      pointers.push(p);
      return true;
  }

  function removePointer(id) {
      for (var i = 0; i < pointers.length; i++) {
          if (pointers[i].identifier == id)
              pointers.splice(i, 1);
      }
  }
 
  function pointerdowned() {
      var that = this,
          dispatch = event.of(that, arguments),
          e = d3_eventSource(),
          distance0 = 0,
          scale0,
          zoomName = ".zoom-" + e.pointerId,
          subject = d3.select(that);

      started();
      zoomstarted(dispatch);

      function started() {
          
          var e = d3_eventSource();
          
          // store a pointer
          var p = d3_mousePoint(that, e);
          p.identifier = e.pointerId;
          p.location = location(p);
          addUpdatePointer(p);

          d3_eventPreventDefault();
          
          // prevent duplication via replacing "pointerdowned" by local "started"
          if (pointers.length == 1)
              subject
                  .on(d3_behavior_zoomTouch.down + ".zoom", null)
                  .on(d3_behavior_zoomTouch.down + zoomName, started)
                  .on(d3_behavior_zoomTouch.move + zoomName, moved)
                  .on(d3_behavior_zoomTouch.up + zoomName, ended)
                  .on(d3_behavior_zoomTouch.leave + zoomName, ended);
          
          scale0 = view.k;

          // if this touch isn't first
          if (pointers.length > 1) {
              var p = pointers[0], q = pointers[1],
                  dx = p[0] - q[0], dy = p[1] - q[1];
              distance0 = dx * dx + dy * dy;
          }
      }

      function moved() {
          var p0, l0,
              p1, l1;

          var ee = d3_eventSource();

          // update a point in "pointers"
          p0 = d3_mousePoint(that, ee);
          p0.identifier = ee.pointerId;
          p0.location = location(p0);

          // ignore repetitve events with the same coordinates
          if (!addUpdatePointer(p0))
              return;

          l0 = getPointer(p0.identifier).location;
          if (pointers.length > 1) {

              p1 = getAnotherPointer(p0.identifier); // get any another finger
              l1 = p1.location;

              var dx = p1[0] - p0[0], dy = p1[1] - p0[1],
                  distance1 = dx * dx + dy * dy;
              var scale1 = (distance0 != 0) ? Math.sqrt(distance1 / distance0) : 0;

              p0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
              l0 = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];

              scaleTo(scale1 * scale0);
          }

          translateTo(p0, l0);
          zoomed(dispatch);
      }

      function ended() {
          var e = d3_eventSource();
          removePointer(e.pointerId);

          if (pointers.length == 0) {
              subject
                  .on(zoomName, null)
                  .on(d3_behavior_zoomTouch.down + ".zoom", d3_behavior_zoomTouchHandler);

              zoomended(dispatch);
          }
      }
  }

  function mousewheeled() {
    var dispatch = event.of(this, arguments);
    if (mousewheelTimer) clearTimeout(mousewheelTimer);
    else d3_selection_interrupt.call(this), translate0 = location(center0 = center || d3.mouse(this)), zoomstarted(dispatch);
    mousewheelTimer = setTimeout(function() { mousewheelTimer = null; zoomended(dispatch); }, 50);
    d3_eventPreventDefault();
    var strength = (robustZoom ? Math.sign(d3_behavior_zoomDelta()) : d3_behavior_zoomDelta() * zoomRatio);
    scaleTo(Math.pow(zoomFactor, strength * view.k));
    translateTo(center0, translate0);
    zoomed(dispatch);
  }

  function dblclicked() {
    var p = d3.mouse(this),
        k = Math.round(Math.log(view.k) / Math.log(zoomFactor) * 1e14) / 1e14;

    zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
  }

  return d3.rebind(zoom, event, "on");
};

var d3_behavior_zoomInfinity = [0, Infinity], // default scale extent
    d3_behavior_zoomDelta, // initialized lazily
    d3_behavior_zoomWheel,
    d3_behavior_zoomTouch,
    d3_behavior_zoomTouchHandler; // <- temporary keeps the name of function that handle touch event. Ideaqlly it should be the one function that do the same for any events
