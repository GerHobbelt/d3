d3.median = function(array, f) {
  if (arguments.length > 1) array = d3_array_map(array, f);
  array = array.filter(d3_number);
  return array.length ? d3.quantile(array.sort(d3.ascending), .5) : undefined;
};
