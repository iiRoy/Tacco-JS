'use strict';
(function(stdin) {
  //declare function
  function mosaic(array) {
    var h = array[0];
    var w = array[1];
    var line1 = [];
    var char = '';
    for (var i = 0; i < w; i++) {
      char = (i % 2 === 0 ? '#' : '.');
      line1.push(char);
    }
    line1 = line1.join('');
    var line2 = [];
    for (var j = 0; j < w; j++) {
      char = (j % 2 === 0 ? '.' : '#');
      line2.push(char);
    }
    line2 = line2.join('');
    var result = [];
    for (var k = 0; k < h; k++) {
      char = k % 2 === 0 ? line1 : line2;
      result.push(char);
    }
    return result.join('\n');
  }

  //declare variable
  var inputs = stdin.toString().trim().split('\n');
  var data = inputs.slice(0, inputs.indexOf('0 0'));
  data = data.map(function(v) {
    return v.split(' ').map(Number);
  });
  //main
  var all = data.map(mosaic);
  all = all.join('\n\n');
  //display
  console.log(all);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));