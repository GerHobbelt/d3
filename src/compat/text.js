var d3_selectionPrototype_text;
var hasTextContent;

hasTextContent = (document.createElement("div").textContent !== undefined)
if (hasTextContent) {
  d3_selectionPrototype_text = function(value) {
    return arguments.length < 1
        ? this.node().textContent : this.each(typeof value === "function"
        ? function() { var v = value.apply(this, arguments); this.textContent = v == null ? "" : v; } : value == null
        ? function() { this.textContent = ""; }
        : function() { this.textContent = value; });
  }
} else {
  d3_selectionPrototype_text = function(value) {
    return arguments.length < 1
        ? this.node().innerText : this.each(typeof value === "function"
        ? function() { var v = value.apply(this, arguments); this.innerText = v == null ? "" : v; } : value == null
        ? function() { this.innerText = ""; }
        : function() { this.innerText = value; });
  }
}
