var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from stdin
var lines = input.split('\n'); // Split input into lines

var p = []var j = []var p[0] = Number(lines[0]);
var p[1] = Number(lines[1]);
var p[2] = Number(lines[2]);

// Assign values to array 'j'
var j[0] = Number(lines[3]);
var j[1] = Number(lines[4]);

// Calculate and print the sum of the minimums
console.log(Math.min.apply(null, p) + Math.min.apply(null, j))