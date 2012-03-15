// TODO append(node)?
// TODO append(function)?
d3_selectionPrototype.append = function(name) {
  name = d3.ns.qualify(name);

  function append() {
    return this.appendChild(d3_createElementNS(this.namespaceURI, name));
  }

  function appendNS() {
    return this.appendChild(d3_createElementNS(name.space, name.local));
  }

  return this.select(name.local ? appendNS : append);
};
