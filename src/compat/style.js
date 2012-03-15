try {
  document.createElement("div").style.setProperty("opacity", 0, "");
} catch (error) {
  var d3_style_prototype = CSSStyleDeclaration.prototype,
      d3_style_setProperty = d3_style_prototype.setProperty;
  if (!d3_style_setProperty) {
    // IE compat. - priority is ignored.
    d3_style_prototype.setProperty = function(name, value) {
      this[name] = value;
    };

  } else {
    d3_style_prototype.setProperty = function(name, value, priority) {
      d3_style_setProperty.call(this, name, value + "", priority);
    };
  }
}
