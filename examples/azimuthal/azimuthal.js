var xy = d3.geo.azimuthal().scale(240).mode("stereographic"),
    circle = d3.geo.greatCircle(),
    path = d3.geo.path().projection(xy),
    svg = d3.select("body").append("svg");

d3.json("../data/world-countries.json", function(collection) {
  svg.selectAll("path")
      .data(collection.features)
    .enter().append("path")
      .attr("d", function(d) { return path(circle.clip(d)); })
    .append("title")
      .text(function(d) { return d.properties.name; });
});

function refresh(duration) {
  var p = svg.selectAll("path");
  if (duration) p = p.transition().duration(duration);
  p.attr("d", function(d) { return path(circle.clip(d)); });
  d3.select("#lon span")
      .text(xy.origin()[0]);
  d3.select("#lat span")
      .text(xy.origin()[1]);
  d3.select("#scale span")
      .text(xy.scale());
  d3.select("#translate-x span")
      .text(xy.translate()[0]);
  d3.select("#translate-y span")
      .text(xy.translate()[1]);
}

$("#lon").slider({
  min: -180,
  max: 180,
  step: 1e-1,
  value: 0,
  slide: function(event, ui) {
    var origin = xy.origin();
    origin[0] = ui.value;
    xy.origin(origin);
    circle.origin(origin);
    refresh();
  }
});

$("#lat").slider({
  min: -90,
  max: 90,
  step: 1e-1,
  value: 0,
  slide: function(event, ui) {
    var origin = xy.origin();
    origin[1] = ui.value;
    xy.origin(origin);
    circle.origin(origin);
    refresh();
  }
});

$("#scale").slider({
  min: 0,
  max: 3000,
  value: 240,
  slide: function(event, ui) {
    xy.scale(ui.value);
    refresh();
  }
});

$("#translate-x").slider({
  min: -2000,
  max: 2000,
  value: 480,
  slide: function(event, ui) {
    var translate = xy.translate();
    translate[0] = ui.value;
    xy.translate(translate);
    refresh();
  }
});

$("#translate-y").slider({
  min: -2000,
  max: 2000,
  value: 250,
  slide: function(event, ui) {
    var translate = xy.translate();
    translate[1] = ui.value;
    xy.translate(translate);
    refresh();
  }
});

$("#mode").change(function() {
  var mode = $(this).val();
  xy.mode(mode);
  refresh(500);
});

