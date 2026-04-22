const chunk = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = chunk.split('\n');
var a = lines[1].split(' ');
console.log(a.reverse().join(' '));