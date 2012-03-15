var main = function() {
  // test 1.
  d3.select('body')
    .append('div')
    .text('hello, world')
  // test 2.
  var data = [
    {text: 'hello'},
    {text: 'world'},
    {text: 'd3 works.'}
  ];
  var data2 = [
    {text: 'hello'},
    {text: 'world'},
    {text: 'd3 works.omg'},
    {text: 'd3 works.!!'}
  ]
  var selected = null;
  selected = d3.select('body').selectAll('.foo')
  // selected.data(data).enter().append('div').attr('class','foo').text(function(d) { return d.text })

  selected = d3.select('body').selectAll('.foo')
  // selected.data(data2).enter().append('div').attr('class','foo').text(function(d) { return d.text })
  var createNode;
  // var node = document.createElement('<oval style="height:75pt;width:100pt; display: inline-block; behavior:url(#default#VML)" xmlns="urn:schemas-microsoft-com:vml" coordsize="21600,21600" fillcolor="blue" />')
  // $('body')[0].appendChild(node)
  var v = d3.select('body').append('oval')
  v.attr('coordsize', "21600,21600")
    .attr('fillcolor', "blue")
    .attr('xmlns', 'urn:schemas-microsoft-com:vml')
    .style('height','75px')
    .style('width','75px')
    .style('display','inline-block')
    .style('behavior','url(#default#VML)')
}

main();
