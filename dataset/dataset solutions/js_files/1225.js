'use strict';
process.stdin.on('data', function(chunk) {
    var inputs = chunk.toString().trim().split(' ');
    var W = Number(inputs[0]);
    var H = Number(inputs[1]);
    var x = Number(inputs[2]);
    var y = Number(inputs[3]);
    var r = Number(inputs[4]);
  var x0 = W - x - r;
  var x1 = W - x + r;
  var y0 = H - y - r;
  var y1 = H - y + r;
  if (x0 >= 0 && x1 <= W && y0 <= 0 && y1 >= H) {
    console.log('Yes');
  } else {
    console.log('No');
  }
});

process.stdin.resume();
process.stdin.setEncoding('utf8');