import "../core/ns";
import "selection";

d3_selectionPrototype.append = function(name) {
  var n = d3_parse_attributes(name), s;
  name = n.attr ? n.tag : name;
  name = d3_selection_creator(name);
  s = this.select(function() {
    return this.appendChild(name.apply(this, arguments));
  });
  return n.attr ? s.attr(n.attr) : s;
};

function d3_selection_creator(name) {

  function create() {
    var document = this.ownerDocument,
        namespace = this.namespaceURI;
    return namespace === d3_nsXhtml && document.documentElement.namespaceURI === d3_nsXhtml
        ? document.createElement(name)
        : document.createElementNS(namespace, name);
  }

  function createNS() {
    return this.ownerDocument.createElementNS(name.space, name.local);
  }

  return typeof name === "function" ? name
      : (name = d3.ns.qualify(name)).local ? createNS
      : create;
}

var d3_parse_attributes_regex = /([\.#])/g;

function d3_parse_attributes(name) {
  if (typeof name === "string") {
    var attr = {},
        parts = name.split(d3_parse_attributes_regex), p;
    name = parts.shift();
    while ((p = parts.shift())) {
      if (p == '.') attr['class'] = attr['class'] ? attr['class'] + ' ' + parts.shift() : parts.shift();
      else if (p == '#') attr.id = parts.shift();
    }
    return attr.id || attr['class'] ? { tag: name, attr: attr } : name;
  }
  return name;
}
