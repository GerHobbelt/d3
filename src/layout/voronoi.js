d3.layout.voronoi = function() {
  var size = null,
      x = d3_svg_lineX,
      y = d3_svg_lineY,
      clip;

  function voronoi(data) {
    var points = [],
        cells,
        fx = d3_functor(x),
        fy = d3_functor(y),
        d,
        i,
        n = data.length;
    for (i = 0; i < n; ++i) points.push([+fx.call(this, d = data[i], i), +fy.call(this, d, i)]);
    cells = d3.geom.voronoi(points);
    for (i = 0; i < n; ++i) cells[i].data = data[i];
    if (clip) for (i = 0; i < n; ++i) clip(cells[i]);
    return cells;
  }

  voronoi.x = function(_) {
    return arguments.length ? (x = _, voronoi) : x;
  };

  voronoi.y = function(_) {
    return arguments.length ? (y = _, voronoi) : y;
  };

  voronoi.size = function(_) {
    if (!arguments.length) return size;
    if (_ == null) {
      clip = null;
    } else {
      var w = +_[0], h = +_[1];
      clip = d3.geom.polygon([[0, 0], [0, h], [w, h], [w, 0]]).clip;
    }
    return voronoi;
  };

  return voronoi;
};