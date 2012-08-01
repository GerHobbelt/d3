//A wrapper around d3.text that sets the MIME type to JSON and then parses the JSON before passing it to the callback. 
d3.json = function(url, callback) {
  d3.text(url, "application/json", function(text) {
    callback(text ? JSON.parse(text) : null);
  });
};

//Next: [core/html.js](/d3/src/core/html.html)