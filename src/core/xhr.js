//A method that creates an xhr request, and, using the supplied
//arguments, sends the request. Not too complicated beyond just calling
//the `XMLHttpRequest` API and using status codes correctly. Not used
//all that much outside of the library. It's been used to implement
//other json requests, as we'll see next.

//Example:
// 
//              d3.xhr("file.html","text/html", parseHTMLCallback)
d3.xhr = function(url, mime, callback) {
  var req = new XMLHttpRequest;
  if (arguments.length < 3) callback = mime, mime = null;
  else if (mime && req.overrideMimeType) req.overrideMimeType(mime);
  req.open("GET", url, true);
  if (mime) req.setRequestHeader("Accept", mime);
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      var s = req.status;
      callback(!s && req.response || s >= 200 && s < 300 || s === 304 ? req : null);
    }
  };
  req.send(null);
};

//Next: [core/text.js](/d3/src/core/text.html)
