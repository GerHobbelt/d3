d3_selectionPrototype.text = function(value) {
var hasInnerText = (document.getElementsByTagName("body")[0].innerText !== undefined) ? true : false;
  if (!hasInnerText) {
    return arguments.length < 1
        ? this.node().textContent : this.each(typeof value === "function"
        ? function() { var v = value.apply(this, arguments); this.textContent = v == null ? "" : v; } : value == null
        ? function() { this.textContent = ""; }
        : function() { this.textContent = value; });
  } else {
    return arguments.length < 1
        ? this.node().innerText : this.each(typeof value === "function"
        ? function() { var v = value.apply(this, arguments); this.innerText = v == null ? "" : v; } : value == null
        ? function() { this.innerText = ""; }
        : function() { this.innerText = value; });

  }
};
