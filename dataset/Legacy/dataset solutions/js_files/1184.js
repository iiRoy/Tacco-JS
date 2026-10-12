//config = {stdin: 'tmp', newline: '\r\n'}; // win
config = {stdin: '/dev/stdin', newline: '\n'}; // linux

line = require('fs').readFileSync(config.stdin, 'ascii')
       .split(config.newline, 3)
       .map(function(line) {
         return line.split(' ').map(Number);
       });

dist = (function (x, y) {
  var res = [];
  for (var i in x) res.push(Math.abs(x[i] - y[i]));
  return res;
}) (line[1], line[2]);

console.log(
  dist.reduce(function (prev, cur) { return prev + cur; }, 0));
console.log(
  Math.sqrt(
    dist.reduce(function (prev, cur) { return prev + cur * cur; }, 0)));
console.log(
  Math.pow(
    dist.reduce(function (prev, cur) { return prev + cur * cur * cur; }, 0),
    1/3));
console.log(
  dist.reduce(function (prev, cur) { return Math.max(prev, cur); }, 0));