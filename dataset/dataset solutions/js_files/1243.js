'use strict';
process.stdin.on('data', function(chunk) {
  // ????????????????????????
  var inputs = chunk.toString().trim();
  var cols = inputs.split(' ').map(Number);
  var a = cols[0];
  var b = cols[1];

 console.log(Math.floor(a / b)
  , a % b
  , (a / b).toFixed(5)
  );


});
process.stdin.resume();
process.stdin.setEncoding('utf8');