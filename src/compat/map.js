var d3_array_map;
var d3_array_forEach;
;(function() {
"use strict";
// Implementation copied from underscore.js
var ArrayProto         = Array.prototype
var nativeForEach      = ArrayProto.forEach
var nativeMap          = ArrayProto.map
var breaker = {};

d3_array_map = function(obj, iterator, context) {
  var results = [];
  if (obj == null) return results;
  if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
  d3_array_forEach(obj, function(value, index, list) {
    results[results.length] = iterator.call(context, value, index, list);
  });
  if (obj.length === +obj.length) results.length = obj.length;
  return results;
};

d3_array_forEach = function(obj, iterator, context) {
  if (obj == null) return;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    for (var key in obj) {
      if (_.has(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) return;
      }
    }
  }
};

if (!nativeMap) {
  Array.prototype.map = function(iterator) {
    return d3_array_map(this, iterator)
  }

}
})();
