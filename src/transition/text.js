import "transition";
import "tween";

d3_transitionPrototype.text = function(value) {
  return d3_transition_tween(this, "text", value, d3_transition_text);
};

function d3_transition_text(b) {
  if (b == null) b = "";
  return function() { this.textContent = b; };
}

//Next: [core/transition-remove.js](/d3/src/core/transition-remove.html)
