var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');
 
var nums = lines.map(function(line) {
    return line.split(',').map(function(n){return +n;});
});

var sum = nums.reduce(function(p, n) {
    return p + n[0] * n[1];
}, 0);

var qsum = nums.reduce(function(p, n) {
    return p + n[1];
}, 0);

console.log(sum);
console.log(Math.round(qsum/nums.length));