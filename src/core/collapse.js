//`d3_collapse` is an internal function that is used within the selection implementation when working with classes of elements. It is used to take out extra spaces and characters that might accumluate while working with the classes attached to elements as strings. 
function d3_collapse(s) {
  return s.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
}

//Next: [core/range.js](/d3/src/core/range.html)
