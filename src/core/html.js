//A wrapper around d3.text that sets the MIME type to HTML and then handles the edge case of the responseText being empty.
d3.html = function(url, callback) {
  return d3.xhr(url, "text/html", callback).response(d3_html);
};

function d3_html(request) {
  var range = document.createRange();
  range.selectNode(document.body);
  return range.createContextualFragment(request.responseText);
}

//Next: [core/xml.js](/d3/src/core/xml.html)
