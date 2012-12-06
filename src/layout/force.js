// A rudimentary force layout using Gauss-Seidel.
d3.layout.force = function() {
  var force = {},
      event = d3.dispatch("start", "tick", "end"),
      size = [1, 1],
      drag,
      alpha,
      friction = d3_functor(.9),
      linkDistance = d3_functor(20),
      linkStrength = d3_functor(1),
      charge = d3_functor(-30),
      repulsor = d3_functor(false),
      gravity = .1,
      theta = d3_functor(.8),
      interval,
      nodes = [],
      links = [],
      distances,
      strengths,
      neighbors,
      epsilon = 0.1, // minimal distance-squared for which the approximation holds; any smaller distance is assumed to be this large to prevent instable approximations
      charges;

  function repulse(node, i) {
    return function(quad, x1, y1, x2, y2) {
      if (quad.point !== node) {
        var dx = quad.cx - node.x,
            dy = quad.cy - node.y,
            l = dx * dx + dy * dy,
            dn = 1 / Math.max(epsilon, l),
            k = quad.charge * dn,
            th = theta(node, i, quad, l, x1, x2, k);

        /*
        Based on the Barnes-Hut criterion.
        http://www.amara.com/papers/nbody.html#tcu

        Uses ideas from A Hierarchical O(N) Force Calculation Algorithm, Dehnen, 2007:
        http://physics.ucsd.edu/students/courses/winter2008/physics141/lecture16/2002JCP...179...27D.pdf
        to produce an improved acceptance criterion: Similar to the paper we not only
        collect the center of mass per quad but also the maximum distance of any
        node from that derived center of mass by collecting the bounding box;
        by comparing this measure with the distance of the quad's center of mass to our
        node and apply a decision threshold  based on a (possibly) mass-dependent theta,
        we can tweak the accuracy of our approximation more accurately for fields with
        a very uneven charge distribution.

        The basic Barnes-Hut criterion is purely distance based, while we use a criterion
        which is similar to the potential-based criterion discussed in the latter paper:
        when the influence of the collective force over the given distance is relatively
        small, we do accept the consolidated quad data; otherwise we need process the
        child nodes.
        */
        if (l * k * k < th * th) {
          k *= alpha;
          node.px -= dx * k;
          node.py -= dy * k;
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

    // gauss-seidel relaxation for links
    for (i = 0; i < m; ++i) {
      o = links[i];
      s = o.source;
      t = o.target;
      x = t.x - s.x;
      y = t.y - s.y;
      if (l = (x * x + y * y)) {
        l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
        x *= l;
        y *= l;
        t.x -= x * (k = s.weight / (t.weight + s.weight));
        t.y -= y * k;
        s.x += x * (k = 1 - k);
        s.y += y * k;
      }
    }

    // apply gravity forces
    if (k = alpha * gravity) {
      x = size[0] / 2;
      y = size[1] / 2;
      i = -1;
      while (++i < n) {
        o = nodes[i];
        o.x += (x - o.x) * k;
        o.y += (y - o.y) * k;
      }
    }

    // compute quadtree center of mass and apply charge forces
    f = 0;
    q = d3.geom.quadtree(nodes);
    // recalculate charges on every tick if need be:
    charges = [];
    for (i = 0; i < n; ++i) {
      charges[i] = k = +charge.call(this, nodes[i], i, q);
      f += Math.abs(k);
    }
    if (f != 0) {
      d3_layout_forceAccumulate(q, alpha, charges);
      i = -1; while (++i < n) {
        if (!(o = nodes[i]).fixed) {
          q.visit(repulse(o, i));
        }
      }
    }
    repulsor.call(this, q, charges, distances, strengths);

    // position verlet integration
    i = -1; while (++i < n) {
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

    event.tick({type: "tick", alpha: alpha, quadtree: q});
  };

  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return force;
  };

  force.links = function(x) {
    if (!arguments.length) return links;
    links = x;
    return force;
  };

  force.neighbours = function() {
    neighbor(0);
    return neighbors;
  };

  force.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return force;
  };

  force.linkDistance = function(x) {
    if (!arguments.length) return linkDistance;
    linkDistance = d3_functor(x);
    return force;
  };

  // For backwards-compatibility.
  force.distance = force.linkDistance;

  force.linkStrength = function(x) {
    if (!arguments.length) return linkStrength;
    linkStrength = d3_functor(x);
    return force;
  };

  force.friction = function(x) {
    if (!arguments.length) return friction;
    friction = d3_functor(x);
    return force;
  };

  force.charge = function(x) {
    if (!arguments.length) return charge;
    charge = d3_functor(x);
    return force;
  };

  force.gravity = function(x) {
    if (!arguments.length) return gravity;
    gravity = +x;
    return force;
  };

  force.repulsor = function(x) {
    if (!arguments.length) return repulsor;
    repulsor = d3_functor(x);
    return force;
  };

  force.theta = function(x) {
    if (!arguments.length) return theta;
    theta = +x;
    return force;
  };

  force.alpha = function(x) {
    if (!arguments.length) return alpha;

    if (alpha) { // if we're already running
      if (x > 0) alpha = x; // we might keep it hot
      else alpha = 0; // or, next tick will dispatch "end"
    } else if (x > 0) { // otherwise, fire it up!
      event.start({type: "start", alpha: alpha = x});
      d3.timer(force.tick);
    }

    return force;
  };

  force.start = function() {
    var i,
        j,
        n = nodes.length,
        m = links.length,
        w = size[0],
        h = size[1],
        o;

    for (i = 0; i < n; ++i) {
      (o = nodes[i]).index = i;
      o.weight = 0;
    }

    distances = [];
    strengths = [];
    for (i = 0; i < m; ++i) {
      o = links[i];
      if (typeof o.source == "number") o.source = nodes[o.source];
      if (typeof o.target == "number") o.target = nodes[o.target];
      distances[i] = linkDistance.call(this, o, i);
      strengths[i] = linkStrength.call(this, o, i);
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

    charges = [];
    for (i = 0; i < n; ++i) {
      charges[i] = +charge.call(this, nodes[i], i);
    }

    // initialize node position based on first neighbor
    function position(dimension, size, i) {
      var my_neighbors = neighbor(i),
          j = -1,
          m = my_neighbors.outlinks.length,
          x;
      while (++j < m)
        if (!isNaN(x = my_neighbors.outlinks[j].target[dimension]))
          return x;
      m = my_neighbors.inlinks.length;
      while (++j < m)
        if (!isNaN(x = my_neighbors.inlinks[j].source[dimension]))
          return x;
      return Math.random() * size;
    }

    return force.resume();
  };

  // initialize neighbors lazily
  function neighbor(i) {
    if (!neighbors) {
      var j,
          n = nodes.length,
          m = links.length;
      neighbors = [];
      for (j = 0; j < n; ++j) {
        neighbors[j] = { inlinks: [], outlinks: [] };
      }
      for (j = 0; j < m; ++j) {
        var o = links[j];
        neighbors[o.source.index].outlinks.push(o);
        neighbors[o.target.index].inlinks.push(o);
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
    if (!arguments.length) return drag;

    if (!drag) drag = d3.behavior.drag()
        .origin(d3_identity)
        .on("dragstart.force", d3_layout_forceDragstart)
        .on("drag.force", dragmove)
        .on("dragend.force", d3_layout_forceDragend);

    this.on("mouseover.force", d3_layout_forceMouseover)
        .on("mouseout.force", d3_layout_forceMouseout)
        .call(drag);
  };

  function dragmove(d) {
    d.px = d3.event.x;
    d.py = d3.event.y;
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
