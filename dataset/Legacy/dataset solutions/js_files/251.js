var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');

var sum = 0;
var line;
while (line = lines.shift()) {
    var arr = line.split(/\D+/);
    sum += arr.reduce(function(p,n){return p + +n;},0);
}
console.log(sum);