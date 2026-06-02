var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'); // Read input from stdin, decode as UTF-8, and split by newlines
var firstLine = rawData[0]; // Get the first line of the input
var patternOne = /[\?|P][\?|D]/g; // Regular expression to find '?P', 'P?', 'PD', '??'
var patternTwo = /\?/g; // Regular expression to find '?'
console.log(firstLine.replace(patternOne, 'PD').replace(patternTwo, 'D')); // Apply replacements and print the result
