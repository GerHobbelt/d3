//A wrapper around d3.xhr that passes back the responseText of the response to the callback.
d3.text = function() {
  return d3.xhr.apply(d3, arguments).response(d3_text);
};

function d3_text(request) {
  return request.responseText;
}

//Next: [core/json.js](/d3/src/core/json.html)