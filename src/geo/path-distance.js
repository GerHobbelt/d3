  var d3_geo_pathDistanceSum, d3_geo_pathDistancePolygon, d3_geo_pathDistance = {
    point: d3_noop,
    lineStart: d3_geo_pathDistanceLineStart,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathDistancePolygon = true;
    },
    polygonEnd: function() {
      d3_geo_pathDistancePolygon = false;
    }
  };
  function d3_geo_pathDistanceLineStart() {
    var x00, y00, x0, y0;
    d3_geo_pathDistance.point = function(x, y) {
      d3_geo_pathDistance.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    d3_geo_pathDistance.lineEnd = function() {
      if (d3_geo_pathDistancePolygon) nextPoint(x00, y00);
      d3_geo_pathDistance.point = d3_geo_pathDistance.lineEnd = d3_noop;
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0;
      d3_geo_pathDistanceSum += Math.sqrt(dx * dx + dy * dy);
      x0 = x, y0 = y;
    }
  }
