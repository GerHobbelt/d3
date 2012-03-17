// TODO append(node)?
// TODO append(function)? <-- Done by polychart.
d3_selectionPrototype.append = function(name) {
  if (typeof name === 'function') {
    return this.select(function(d, i) {
      var _name = d3.ns.qualify(name(d, i));
      if (_name.local) {
        return this.appendChild(d3_createElementNS(_name.space, _name.local));
      } else {
        return this.appendChild(d3_createElementNS(this.namespaceURI, _name));
      }
    });
  }
  name = d3.ns.qualify(name);

  function append() {
    return this.appendChild(d3_createElementNS(this.namespaceURI, name));
  }

  function appendNS() {
    return this.appendChild(d3_createElementNS(name.space, name.local));
  }

  return this.select(name.local ? appendNS : append);
};
