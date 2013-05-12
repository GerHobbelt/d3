function d3_geo_clipGeometry(geometry) {
  return geometry.type === "LineString"
      ? d3_geo_clipLineSegment(geometry.coordinates[0], geometry.coordinates[1])
      : null;
}
