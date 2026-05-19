var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input

var processedLines = rawData.trim().split('\n'); // Clean up input and split into an array of lines

while (processedLines.length !== 0) { // Continue processing as long as there are lines remaining
    // Take the first line, convert it to a number, square it, add one, and then round up before printing.
    console.log(Math.ceil(Math.pow(Number(processedLines.shift()), 2) + 1));
}
