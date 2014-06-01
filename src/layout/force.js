import "../behavior/drag";
import "../core/identity";
import "../core/rebind";
import "../event/event";
import "../event/dispatch";
import "../event/timer";
import "../geom/quadtree";
import "layout";

// A rudimentary force layout using Gauss-Seidel.
d3.layout.force = function() {
  var force = {},
      event = d3.dispatch("start", "tick", "end"),
      size = [1, 1],
      drag,
      alpha,
      interval,
      nodes = [],
      links = [],
      distances,
      strengths,
      neighbors,
      charges,
      charge_abssum = -1, // negative value signals the need to recalculate this one
      update_charge_on_every_tick = false,
      update_linkStrength_on_every_tick = false,
      update_linkDistance_on_every_tick = false,
      repulsor = false,
      has_theta2_f = false,
      // These model parameters can be either a function or a direct numeric value:
      friction = d3_layout_forceFriction,
      linkDistance = d3_layout_forceLinkDistance,
      linkStrength = d3_layout_forceLinkStrength,
      charge = d3_layout_forceCharge,
      chargeDistance2 = d3_layout_forceChargeDistance2,
      gravity = d3_layout_forceGravity,
      theta2 = d3_layout_forceTheta2,
      epsilon = d3_layout_forceEpsilon; // minimal distance-squared for which the approximation holds; any smaller distance is assumed to be this large to prevent instable approximations


  function update_linkDistances() {
    var i;
    var m = links.length;
    var f = linkDistance; 

    distances = new Array(m);
    // for maximum performance, only use the function when there actually is the need for it:
    if (typeof f === "function") {
      for (i = 0; i < m; ++i) {
        distances[i] = +f.call(this, links[i], i);
      }
    } else {
      for (i = 0; i < m; ++i) {
        distances[i] = f;
      }
    }
  }

  function update_linkStrengths() {
    var i;
    var m = links.length;
    var f = linkStrength; 

    strengths = new Array(m);
    if (typeof f === "function") {
      for (i = 0; i < m; ++i) {
        strengths[i] = +f.call(this, links[i], i);
      }
    } else {
      for (i = 0; i < m; ++i) {
        strengths[i] = f;
      }
    }
  }

  function update_charges() {
    var i, j, o;
    var n = nodes.length;
    var f = charge; 

    charges = new Array(n);
    if (typeof f === "function") {
      j = 0;
      for (i = 0; i < n; ++i) {
        charges[i] = o = +f.call(this, nodes[i], i);
        j += Math.abs(o);
      }
    } else {
      for (i = 0; i < n; ++i) {
        charges[i] = f;
      }
      j = n * Math.abs(f);
    }
    charge_abssum = j;
  }

  function repulse(node, i) {
    return function(quad, x1, y1, x2, y2) {
      if (quad.point !== node) {
        var dx = quad.cx - node.x,
            dy = quad.cy - node.y,
            dw = x2 - x1,
            l = dx * dx + dy * dy,
            dn = 1 / Math.max(epsilon, l),
            k = quad.charge * dn,
            th2;

        if (has_theta2_f) {
          // when this is a FUNCTION it calculates theta, NOT theta²!
          th2 = theta2.call(this, node, i, quad, l, x1, x2, k);
          th2 *= th2;
        } else {
          th2 = theta2;
        }

        /*
        Based on the Barnes-Hut criterion.
        http://www.amara.com/papers/nbody.html#tcu

        Uses ideas from A Hierarchical O(N) Force Calculation Algorithm, Dehnen, 2007:
        http://physics.ucsd.edu/students/courses/winter2008/physics141/lecture16/2002JCP...179...27D.pdf
        to produce an improved acceptance criterion: Similar to the paper we not only
        collect the center of mass per quad but also the maximum distance of any
        node from that derived center of mass by collecting the bounding box;
        by comparing this measure with the distance of the quad's center of mass to our
        node and apply a decision threshold based on a (possibly) mass-dependent theta,
        we can tweak the accuracy of our approximation more accurately for fields with
        a very uneven charge distribution.

        The basic Barnes-Hut criterion is purely distance based, while we use a criterion
        which is similar to the potential-based criterion discussed in the latter paper:
        when the influence of the collective force over the given distance is relatively
        small, we do accept the consolidated quad data; otherwise we need process the
        child nodes.
        */
        if (l * k * k < th2) {
          if (l < chargeDistance2) {
            k *= alpha;
            node.px -= dx * k;
            node.py -= dy * k;
          }
          return true;
        }

        if (quad.point && isFinite(dn)) {
          k = quad.pointCharge * alpha * dn;
          node.px -= dx * k;
          node.py -= dy * k;
        }
      }
      return false;
      //return !quad.charge; -- very dangerous criterion to stop tree traversal as
      //                        accumulated force may be zero, but close-by so the
      //                        accumulate must not be used.
      //                        Another issue is when the node itself coincides
      //                        with others: those won't be visited if the sum of
      //                        the charges, including 'node' itself, produce a zero sum.
    };
  }

  force.tick = function() {
    // simulated annealing, basically
    if ((alpha *= .99) < .005) {
      event.end({type: "end", alpha: alpha = 0});
      return true;
    }

    var n = nodes.length,
        m = links.length,
        q,
        f,
        i, // current index
        o, // current object
        s, // current source
        t, // current target
        l, // current distance
        k, // current force
        x, // x-distance
        y; // y-distance

    if (update_linkStrength_on_every_tick) {
      update_linkStrengths.call(this);
    }
    if (update_linkDistance_on_every_tick) {
      update_linkDistances.call(this);
    }

    // Gauss-Seidel relaxation for links
    for (i = 0; i < m; ++i) {
      o = links[i];
      s = o.source;
      t = o.target;
      x = t.x - s.x;
      y = t.y - s.y;
      l = x * x + y * y;
      // We are going to assume that *any* link has a distance and that source and target node
      // being at the exact same location is a (temporary) mistake. This fixes obscure rendering
      // artifacts for some graphs.
      //
      // At the same time we recognize that users MAY want multiple (linked) nodes to exist at
      // the *exact same position*: 
      // for those uses the `linkDistance` can be specified as a *function* which 
      // SHOULD return *zero*(0) for such links which bind two linked-and-at-the-same-position 
      // nodes together. By having a distance goal of zero the
      // relaxation code will help you by attempting to keep the nodes at the same location.
      // Do note that ensuring both such linked nodes having a mutual charge of *zero* will
      // help you in achieving the goal of keeping them together like that.
      //
      // Meanwhile we dampen the craziness that otherwise ensues for very short distances:  
      l = Math.max(epsilon, l);
      // and apply *damped* Gauss-Seidel relaxation:
      k = Math.sqrt(l);
      l = alpha * strengths[i] * (k - distances[i]) / l;
      x *= l;
      y *= l;
      // and distribute change based on arity
      k = s.weight / (t.weight + s.weight);
      t.x -= x * k;
      t.y -= y * k;
      k = 1 - k;
      s.x += x * k;
      s.y += y * k;
    }

    // apply gravity forces
    //
    // Note that gravity MAY vary for each node when it is specified as a function:
    // this may sound rather 'SF' but there are benefits to have when nodes are
    // more or less 'subject to gravity': special force rendering can be accomplished
    // without having to go to abject lengths in adding 'hidden nodes' or other hacks
    // to tweak the charges and thus the forces.
    // 
    // Here we let the gravity function adjust the nodes' positions.  
    if (typeof gravity === "function") {
      if (alpha) {
        gravity.call(this, nodes, n, alpha, size);
      }
    } else {
      k = alpha * gravity;
      if (k) {
        x = size[0] / 2;
        y = size[1] / 2;
        for (i = 0; i < n; ++i) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
    }

    // compute quadtree center of mass and apply charge forces
    q = d3.geom.quadtree(nodes);
    // recalculate charges on every tick if need be:
    if (charge_abssum < 0 || update_charge_on_every_tick) {
      update_charges.call(this);
    }
    if (charge_abssum != 0) {
      d3_layout_forceAccumulate(q, alpha, charges);
      for (i = 0; i < n; ++i) {
        if (!(o = nodes[i]).fixed) {
          q.visit(repulse(o, i));
        }
      }
    }
    if (typeof repulsor === "function") {
      repulsor.call(this, q, charges, distances, strengths);
    }

    // position verlet integration
    if (typeof friction === "function") {
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          f = friction.call(this, o, i);
          o.x -= (o.px - (o.px = o.x)) * f;
          o.y -= (o.py - (o.py = o.y)) * f;
        }
      }
    } else {
      f = friction;
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * f;
          o.y -= (o.py - (o.py = o.y)) * f;
        }
      }
    }

    event.tick({type: "tick", alpha: alpha, quadtree: q});
  };

  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x || [];
    return force;
  };

  force.links = function(x) {
    if (!arguments.length) return links;
    links = x || [];
    return force;
  };

  force.neighbors = function() {
    neighbor(0);
    return neighbors;
  };

  force.size = function(x) {
    if (!arguments.length) return size;
    size = x || [1, 1];
    if (!size[0]) size[0] = 1;
    if (!size[1]) size[1] = 1;
    return force;
  };

  force.linkDistance = function(x, update_each_tick) {
    if (!arguments.length) return linkDistance;
    var has_linkDistance_f = (typeof x === "function");
    linkDistance = (has_linkDistance_f ? x : +x);
    update_linkDistance_on_every_tick = (update_each_tick == null ? has_linkDistance_f : update_each_tick);  
    return force;
  };

  // For backwards-compatibility.
  force.distance = force.linkDistance;

  force.linkStrength = function(x, update_each_tick) {
    if (!arguments.length) return linkStrength;
    var has_linkStrength_f = (typeof x === "function");
    linkStrength = (has_linkStrength_f ? x : +x);
    update_linkStrength_on_every_tick = (update_each_tick == null ? has_linkStrength_f : update_each_tick);  
    return force;
  };

  force.friction = function(x) {
    if (!arguments.length) return friction;
    friction = typeof x === "function" ? x : +x;
    return force;
  };

  force.charge = function(x, update_each_tick) {
    if (!arguments.length) return charge;
    var has_charge_f = (typeof x === "function");
    charge = (has_charge_f ? x : +x);
    update_charge_on_every_tick = (update_each_tick == null ? has_charge_f : update_each_tick);  
    charge_abssum = -1;
    return force;
  };

  force.chargeDistance = function(x) {
    if (!arguments.length) return Math.sqrt(chargeDistance2);
    chargeDistance2 = x * x;
    return force;
  };

  force.gravity = function(x) {
    if (!arguments.length) return gravity;
    gravity = typeof x === "function" ? x : +x;
    return force;
  };

  force.repulsor = function(x) {
    if (!arguments.length) return repulsor;
    repulsor = typeof x === "function" ? x : false;
    return force;
  };

  force.theta = function(x) {
    if (!arguments.length) {
      if (has_theta2_f) {
        return theta2;
      } else {
        return Math.sqrt(theta2);
      }
    }
    // Set theta2 to x² when x is a value.
    // (This is done as a calculation optimization for when rendering the force graph.)
    //
    // When x is a function, we need to do the squaring on every quad on every iteration anyhow.
    has_theta2_f = (typeof x === "function");
    theta2 = has_theta2_f ? x : x * x;
    return force;
  };

  force.alpha = function(x) {
    if (!arguments.length) return alpha;

    x = +x;
    if (alpha) {                  // if we're already running
      if (x > 0) alpha = x;       // we might keep it hot
      else alpha = 0;             // or, next tick will dispatch "end"
    } else if (x > 0) {           // otherwise, fire it up!
      event.start({type: "start", alpha: alpha = x});
      d3.timer(force.tick);
    }

    return force;
  };

  force.start = function() {
    var i, j,
        n = nodes.length,
        m = links.length,
        w = size[0],
        h = size[1],
        o;

    for (i = 0; i < n; ++i) {
      o = nodes[i];
      o.index = i;
      o.weight = 0;
    }

    for (i = 0; i < m; ++i) {
      o = links[i];
      if (typeof o.source === "number") o.source = nodes[o.source];
      if (typeof o.target === "number") o.target = nodes[o.target];
      ++o.source.weight;
      ++o.target.weight;
    }

    for (i = 0; i < n; ++i) {
      o = nodes[i];
      if (isNaN(o.x)) o.x = position("x", w, i);
      if (isNaN(o.y)) o.y = position("y", h, i);
      if (isNaN(o.px)) o.px = o.x;
      if (isNaN(o.py)) o.py = o.y;
    }

    update_linkDistances.call(this);
    update_linkStrengths.call(this);
    update_charges.call(this);

    // inherit node position from first neighbor with defined position
    // or if no such neighbors, initialize node position randomly
    // initialize neighbors lazily to avoid overhead when not needed
    function position(dimension, size, i) {
      var candidates = neighbor(i),
          j,
          m = candidates.outlinks.length,
          x;
      for (j = 0; j < m; ++j) {
        if (!isNaN(x = candidates.outlinks[j].target[dimension]))
          return x;
      }
      m = candidates.inlinks.length;
      for (j = 0; j < m; ++j) {
        if (!isNaN(x = candidates.inlinks[j].source[dimension]))
          return x;
      }
      return Math.random() * size;
    }

    return force.resume();
  };

  // initialize neighbors lazily
  function neighbor(i) {
    if (!neighbors) {
      var j, o, dir,
          n = nodes.length,
          m = links.length;
      neighbors = new Array(n);
      for (j = 0; j < n; ++j) {
        neighbors[j] = { 
          inlinks: [], 
          outlinks: [] 
        };
      }
      for (j = 0; j < m; ++j) {
        o = links[j];
        dir = o.direction || 1;               // bitfield: 1 (bit 0) = source->target, 2 (bit 1) = target->source.  Default: source->target (unidirectional)             
        if (dir & 1) {
          neighbors[o.source.index].outlinks.push(o);
          neighbors[o.target.index].inlinks.push(o);
        }
        if (dir & 2) {
          neighbors[o.source.index].inlinks.push(o);
          neighbors[o.target.index].outlinks.push(o);
        }
      }
    }
    return neighbors[i];
  }

  force.resume = function() {
    return force.alpha(.1);
  };

  force.stop = function() {
    return force.alpha(0);
  };

  // use `node.call(force.drag)` to make nodes draggable
  force.drag = function() {
    if (!drag) drag = d3.behavior.drag()
        .origin(d3_identity)
        .on("dragstart.force", d3_layout_forceDragstart)
        .on("drag.force", dragmove)
        .on("dragend.force", d3_layout_forceDragend);

    if (!arguments.length) return drag;

    this.on("mouseover.force", d3_layout_forceMouseover)
        .on("mouseout.force", d3_layout_forceMouseout)
        .call(drag);
  };

  function dragmove(d) {
    d.px = d3.event.x, d.py = d3.event.y;
    force.resume(); // restart annealing
  }

  return d3.rebind(force, event, "on");
};

// The fixed property has three bits:
// Bit 1 can be set externally (e.g., d.fixed = true) and show persist.
// Bit 2 stores the dragging state, from mousedown to mouseup.
// Bit 3 stores the hover state, from mouseover to mouseout.
// Dragend is a special case: it also clears the hover state.

function d3_layout_forceDragstart(d) {
  d.fixed |= 2; // set bit 2
}

function d3_layout_forceDragend(d) {
  d.fixed &= ~6; // unset bits 2 and 3
}

function d3_layout_forceMouseover(d) {
  d.fixed |= 4; // set bit 3
  d.px = d.x, d.py = d.y; // set velocity to zero
}

function d3_layout_forceMouseout(d) {
  d.fixed &= ~4; // unset bit 3
}

function d3_layout_forceAccumulate(quad, alpha, charges) {
  var cx = 0,
      cy = 0;

  quad.charge = 0;
  if (!quad.leaf) {
    var nodes = quad.nodes,
        n = nodes.length,
        i = -1,
        c;
    while (++i < n) {
      c = nodes[i];
      if (c == null) continue;
      d3_layout_forceAccumulate(c, alpha, charges);
      quad.charge += c.charge;
      cx += c.charge * c.cx;
      cy += c.charge * c.cy;
    }
  }
  if (quad.point) {
    // jitter internal nodes that are coincident
    if (!quad.leaf) {
      quad.point.x += Math.random() - .5;
      quad.point.y += Math.random() - .5;
    }
    var k = charges[quad.point.index];
    quad.charge += quad.pointCharge = k;
    cx += k * quad.point.x;
    cy += k * quad.point.y;
  }
  quad.cx = cx / quad.charge;
  quad.cy = cy / quad.charge;
}

var d3_layout_forceLinkDistance = 20,
    d3_layout_forceLinkStrength = 1,
    d3_layout_forceChargeDistance2 = Infinity,
    d3_layout_forceEpsilon = 0.1, // minimal distance-squared for which the approximation holds; any smaller distance is assumed to be this large to prevent instable approximations
    d3_layout_forceFriction = .9,
    d3_layout_forceCharge = -30,
    d3_layout_forceGravity = .1,
    d3_layout_forceTheta2 = .64;
