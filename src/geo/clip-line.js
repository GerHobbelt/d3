// TODO d3_geo_clip needs to use smarter sorting of points around the clip
// edge; right now it sorts them by azimuth relative to [180°, 0], which works
// for many cases, but not all.
// TODO support multiple segments.
function d3_geo_clipLineSegment(a, b) {
  var cλ0 = a[0] * d3_radians,
      cλ1 = b[0] * d3_radians,
      δcλ = cλ1 - cλ0,
      csλ = Math.abs(δcλ) > π,
      cφ0 = a[1] * d3_radians,
      cφ1 = b[1] * d3_radians,
      t;

  // Ensure cλ0 ≤ cλ1.
  if (δcλ < 0) t = cλ0, cλ0 = cλ1, cλ1 = t, t = cφ0, cφ0 = cφ1, cφ1 = t;

  // Great-circle normal, [cnx, cny, cnz].
  var cosφ,
      x0 = (cosφ = Math.cos(cφ0)) * Math.cos(cλ0),
      y0 = cosφ * Math.sin(cλ0),
      z0 = Math.sin(cφ0),
      x1 = (cosφ = Math.cos(cφ1)) * Math.cos(cλ1),
      y1 = cosφ * Math.sin(cλ1),
      z1 = Math.sin(cφ1),
      cnx = y0 * z1 - z0 * y1,
      cny = z0 * x1 - x0 * z1,
      cnz = x0 * y1 - y0 * x1,
      m = Math.sqrt(cnx * cnx + cny * cny + cnz * cnz);
  cnx /= m, cny /= m, cnz /= m;

  return d3_geo_clip(d3_true, clipLine, interpolate);

  function clipLine(listener) {
    var λ0, φ0, x0, y0, z0, // previous point
        next = false, // not first
        clean; // no intersections
    return {
      lineStart: function() {
        next = false;
        clean = 1;
        listener.lineStart();
      },
      lineEnd: function() {
        listener.lineEnd();
      },
      point: function(λ, φ) {
        var δλ = λ - λ0,
            sλ = Math.abs(δλ) > π,
            λ1,
            φ1;

        // Ensure λ0 ≤ λ1.
        if (δλ < 0) λ1 = λ0, λ0 = λ, φ1 = φ0, φ0 = φ;
        else λ1 = λ, φ1 = φ;

        // TODO optimise for common case, which may not need this conversion to
        // 3D for every point.
        var cosφ = Math.cos(φ),
            x = cosφ * Math.cos(λ),
            y = cosφ * Math.sin(λ),
            z = Math.sin(φ);

        // TODO optimise for meridians.
        // TODO fix coincident arcs.

        // If the longitude ranges overlap.
        if (next && (cλ0 <= λ1 || λ0 <= cλ1)) {
          // Great-circle normal for the current segment.
          var nx = y0 * z - z0 * y,
              ny = z0 * x - x0 * z,
              nz = x0 * y - y0 * x,
              m = Math.sqrt(nx * nx + ny * ny + nz * nz);
          nx /= m, ny /= m, nz /= m;

          // N = cn⨯n.
          var Nx = cny * nz - cnz * ny,
              Ny = cnz * nx - cnx * nz,
              Nz = cnx * ny - cny * nx;

          var λ2 = Math.atan2(Ny, Nx);
          if (csλ ^ (cλ0 <= λ2 && λ2 <= cλ1) && sλ ^ (λ0 <= λ2 && λ2 <= λ1)
              || (Nz = -Nz, csλ ^ (cλ0 <= (λ2 = (λ2 + 2 * π) % (2 * π) - π) && λ2 <= cλ1) && sλ ^ (λ0 <= λ2 && λ2 <= λ1))) {
            var φ2 = Math.asin(Nz / Math.sqrt(Nx * Nx + Ny * Ny + Nz * Nz)),
                λε = δλ < 0 ? ε : -ε,
                φε = δλ < 0 ^ φ1 < φ0 ? -ε : ε;
            listener.point(λ2 - λε, φ2 - φε);
            listener.lineEnd();
            listener.lineStart();
            listener.point(λ2 + λε, φ2 + φε);
            clean = 0;
          }
        }
        listener.point(λ0 = λ, φ0 = φ);
        x0 = x, y0 = y, z0 = z;
        next = true;
      },
      // if there are intersections, we always rejoin the first and last segments.
      clean: function() { return 2 - clean; }
    };
  }

  function interpolate(from, to, direction, listener) {
    if (from == null) {
      var λε = direction > 0 ^ δcλ < 0 ? ε : -ε,
          φε = direction > 0 ^ δcλ < 0 ^ cφ1 < cφ0 ? -ε : ε;
      listener.point(cλ0 - λε, cφ0 - φε);
      listener.point(cλ0 + λε, cφ0 + φε);
      listener.point(cλ1 + λε, cφ1 + φε);
      listener.point(cλ1 - λε, cφ1 - φε);
    } else {
      var cosφ,
          λ2 = from[0], φ2 = from[1],
          λ3 = to[0], φ3 = to[1],
          x2 = (cosφ = Math.cos(φ2)) * Math.cos(λ2),
          y2 = cosφ * Math.sin(λ2),
          z2 = Math.sin(φ2),
          x3 = (cosφ = Math.cos(φ3)) * Math.cos(λ3),
          y3 = cosφ * Math.sin(λ3),
          z3 = Math.sin(φ3),
          A = cnx * x2 + cny * y2 + cnz * z2 > 0;
      // Different sides of clip line.
      if (A ^ cnx * x3 + cny * y3 + cnz * z3 > 0) {
        if (A ^ direction > 0) listener.point(cλ1, cφ1);
        else listener.point(cλ0, cφ1);
      }
      listener.point(λ3, φ3);
    }
  }
}
