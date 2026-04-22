var fs = require('fs');

var inputs = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
var num = Number(inputs[0]);
var wnums = inputs[1].split(' ').map(function (i) {Number(i)});
var minimum = null;
for (var t = 1; t < num; t++) {
  var sub = wnums.slice(0, t).reduce(function(c,i) {return c+i}) - wnums.slice(t).reduce(function(c,i) {return c+i});
  if (sub < 0) {
    sub = -sub;
  }
  if (minimum === null || minimum > sub) {
    minimum = sub;
  }
}
console.log(minimum);