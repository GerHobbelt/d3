//A wrapper around d3.xhr that grabs the responseXML from the response and then calls the callback. Similiar to d3.text in terms of scope. 
d3.xml = function(url, mime, callback) {
  function ready(req) {
    callback(req && req.responseXML);
  }
  if (arguments.length < 3) {
    callback = mime;
    mime = null;
  }
  d3.xhr(url, mime, ready);
};

//Next: [core/ns.js](/d3/src/core/ns.html)