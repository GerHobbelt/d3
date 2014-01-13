function d3_format_precision(x, p) {
  return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
}

d3.formatPrecision = function(x, p) {
  return d3_format_precision(x, p || 0);
};

