process.stdin.resume();
process.stdin.setEncoding('utf8');

// Get lines from standard input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split("\n");
var line = lines[0];
console.log(line.split("").reverse().join(""));