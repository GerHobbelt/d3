// Copies a variable number of methods from source to target. See the [tests](https://github.com/mbostock/d3/blob/1b3a3b3cb3d234e550cfcb46bfd776883b5d458b/test/core/rebind-test.js) for further examples.
//
//             var a = {}, b = {foo: function() {that = this;}}, that
//             d3.rebind(a,b,"foo")
//             a.foo()
//             that === b
// 
//             var a = {}, b = {foo: function() {that = this;}}, that
//             d3.rebind(a,b,"foo")
//             a.foo.call({})
//             that === b
// 
//             var a = {}
//             var b = {foo: function() {return 1;}, bro: function(){ return "Bro."}}
//             d3.rebind(a,b,"foo","bar")
//             a.foo() == 1
//             b.bro() == "Bro."

d3.rebind = function(target, source) {
  var i = 1, n = arguments.length, method;
  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
  return target;
};

// Method is assumed to be a standard D3 getter-setter:
// 
// If passed with no arguments, gets the value.
// 
// If passed with arguments, sets the value and returns the target.
function d3_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return arguments.length ? target : value;
  };
}

//Next: [core/ascending.js](/d3/src/core/ascending.html)