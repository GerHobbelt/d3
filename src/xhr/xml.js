import "xhr";

//A wrapper around d3.xhr that grabs the responseXML from the response and then calls the callback. Similiar to d3.text in terms of scope.
d3.xml = function() {
  return d3.xhr.apply(d3, arguments).response(d3_xml);
};

function d3_xml(request) {
  return request.responseXML;
}

//Next: [core/ns.js](/d3/src/core/ns.html)
