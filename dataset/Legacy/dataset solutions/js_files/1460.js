var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();
var nums = lines.shift().split(' ').map(function(num){return +num;});
nums.sort(function(a, b){return a - b;});
console.log(nums.join(' '));