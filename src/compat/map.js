var d3_array_map;
if (Array.prototype.map) {
  d3_array_map = function(array, each) {
    return array.map(each);
  }
} else {
  d3_array_map = _.map;
}
