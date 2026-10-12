var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

var p = [];
var j = [];

for (var i = 0; i < 3; i++) {
  p[i] = Number(lines[i]);
}

for (var k = 0; k < 2; k++) {
  j[k] = Number(lines[k + 3]);
}

var minP = Math.min.apply(null, p);
var minJ = Math.min.apply(null, j);
var answer = minP + minJ - 50;

console.log(answer);