'use strict';
(function(stdin) {
  //declare function
  function square(array) {
    var w = array[0];
    var h = array[1];
    var outLine = [];
    for (var i = 0; i < w; i++) {
      outLine.push('#');
    }
    outLine = outLine.join('');
    var inLine = [];
    for (var j = 0; j < w - 2; j++) {
      inLine.push('.');
    }
    inLine.push('#');
    inLine.unshift('#');
    inLine = inLine.join('');
    var result = [];
    for (var k = 0; k < h - 2; k++) {
      result.push(inLine);
    }
    result.push(outLine);
    result.unshift(outLine);
    return result.join('\n');
  }

  //declare variable
  var inputs = stdin.toString().trim().split('\n');
  var line = inputs.slice(0, inputs.indexOf('0 0'));
  line = line.map(function(v) {
    return v.split(' ').map(Number);
  });
  //main
  var all = line.map(square).join('\n\n');
  //display
  console.log(all);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));