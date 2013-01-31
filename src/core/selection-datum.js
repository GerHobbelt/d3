d3_selectionPrototype.datum = function(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.property("__data__");
};

//Next: [core/selection-filter.js](/d3/src/core/selection-filter.html)
