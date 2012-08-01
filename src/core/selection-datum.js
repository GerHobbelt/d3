d3_selectionPrototype.datum =
d3_selectionPrototype.map = function(value) {
  return arguments.length < 1
      ? this.property("__data__")
      : this.property("__data__", value);
};

//Next: [core/selection-filter.js](/d3/src/core/selection-filter.html)