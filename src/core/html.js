//A wrapper around d3.text that sets the MIME type to HTML and then handles the edge case of the responseText being empty. 
d3.html = function(url, callback) {
  d3.text(url, "text/html", function(text) {
    if (text != null) { // Treat empty string as valid HTML.
      var range = document.createRange();
      range.selectNode(document.body);
      text = range.createContextualFragment(text);
    }
    callback(text);
  });
};

//Next: [core/xml.js](/d3/src/core/xml.html)