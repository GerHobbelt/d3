d3_selectionPrototype.call = function(callback) {
  var args = d3_array(arguments);
  callback.apply(args[0] = this, args);
  return this;
};

//Next: [core/selection-empty.js](/d3/src/core/selection-empty.html)
