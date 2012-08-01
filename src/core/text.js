//A wrapper around d3.xhr that passes back the responseText of the response to the callback. 
d3.text = function(url, mime, callback) {
  function ready(req) {
    callback(req && req.responseText);
  }
  if (arguments.length < 3) {
    callback = mime;
    mime = null;
  }
  d3.xhr(url, mime, ready);
};

//Next: [core/json.js](/d3/src/core/json.html)