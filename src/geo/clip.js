import "../arrays/merge";
import "../core/noop";
import "../math/trigonometry";
import "clip-polygon";

function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
  return function(rotate, listener) {
    var line = clipLine(listener),
        rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;

        d3_geo_clipPolygon(d3.merge(segments), d3_geo_clipSort, d3_geo_pointInPolygon(rotatedClipStart, polygon), d3_geo_clipRingInRing, interpolate, listener);

        segments = polygon = null;
      },
      sphere: function() {
        listener.polygonStart();
        listener.lineStart();
        interpolate(null, null, 1, listener);
        listener.lineEnd();
        listener.polygonEnd();
      }
    };

    function point(λ, φ) {
      var point = rotate(λ, φ);
      if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
    }
    function pointLine(λ, φ) {
      var point = rotate(λ, φ);
      line.point(point[0], point[1]);
    }
    function lineStart() { clip.point = pointLine; line.lineStart(); }
    function lineEnd() { clip.point = point; line.lineEnd(); }

    var segments;

    var buffer = d3_geo_clipBufferListener(),
        ringListener = clipLine(buffer),
        polygon,
        ring;

    function pointRing(λ, φ) {
      ring.push([λ, φ]);
      var point = rotate(λ, φ);
      ringListener.point(point[0], point[1]);
    }

    function ringStart() {
      ringListener.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringListener.lineEnd();

      var clean = ringListener.clean(),
          ringSegments = buffer.buffer(),
          n = ringSegments.length;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) return;

      // Rejoin connected segments.
      // TODO reuse bufferListener.rejoin()?
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
    }

    return clip;
  };
}

function d3_geo_clipSegmentLength1(segment) {
  return segment.length > 1;
}

function d3_geo_clipBufferListener() {
  var lines = [],
      line;
  return {
    lineStart: function() { lines.push(line = []); },
    point: function(λ, φ) { line.push([λ, φ]); },
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop,
    buffer: function() {
      var buffer = lines;
      lines = [];
      line = null;
      return buffer;
    },
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    }
  };
}

// Intersection points are sorted along the clip edge. For both antimeridian
// cutting and circle clipping, the same comparison is used.
function d3_geo_clipSort(a, b) {
  return ((a = a.point)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1])
       - ((b = b.point)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
}

function d3_geo_clipRingInRing(a, b) {
  return a.length < b.length
      ? d3_geo_pointInPolygon(b[0], [a])
      : d3_geo_pointInPolygon(a[0], [b]);
}
