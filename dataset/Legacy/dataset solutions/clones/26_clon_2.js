process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section retrieves data from the standard input stream.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataRows = rawData.split("\n");
var firstRow = dataRows[0];
console.log(firstRow.split("").reverse().join(""));
