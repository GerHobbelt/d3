d3_transitionPrototype.remove = function() {
  return this.each("end.transition", function() {
    var p;
    if (!this.__transition__ && (p = this.parentNode)) p.removeChild(this);
  });
};

//Next: [core/transition-delay.js](/d3/src/core/transition-delay.html)