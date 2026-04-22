'use strict';
process.stdin.on('data', function(chunk) {
  var inputs = chunk.toString().trim();
  var S = Number(inputs);
  var h = Math.floor(S/3600);
  var m = Math.floor((S-(h*3600))/60);
  var s = S%60;
  console.log([h,m,s].join(':'));
});
process.stdin.resume();
process.stdin.setEncoding('utf8');