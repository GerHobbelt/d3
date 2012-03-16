// Namespace related methods - does not exist in IE < 9.
var d3_createElementNS;
var d3_setAttributeNS;
if (!document.createElementNS) {
  d3_createElementNS = function createElementNS(space, name) {
    var node = document.createElement(name);
    if (space) { node.setAttribute('xmlns', space) }
    return node;
  }
} else {
  d3_createElementNS = function(ns, name) {
    debugger;
    return document.createElementNS(ns, name);
  }
}
var _setAttributeNS = document.createElement('div').setAttributeNS;
if(_setAttributeNS) {
  d3_setAttributeNS = _setAttributeNS;
} else {
  d3_setAttributeNS = function(ns, name, value) {
    this.setAttribute((ns ? (ns + ':'):'') + name, value);
  }
}
