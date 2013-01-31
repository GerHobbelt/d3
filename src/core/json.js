//A wrapper around d3.text that sets the MIME type to JSON and then parses the JSON before passing it to the callback.
d3.json = function(url, callback) {
  return d3.xhr(url, "application/json", callback).response(d3_json);
};

function d3_json(request) {
  return JSON.parse(request.responseText);
}

//Next: [core/html.js](/d3/src/core/html.html)
