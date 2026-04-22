// This script processes standard input line by line.
let rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input data into an array of individual lines.
const processedLines = rawInputContent.split('\n');

// Iterate through each line to display its content with an associated segment number.
for (let currentIdx = 0, finalIdx = processedLines.length; currentIdx < finalIdx; currentIdx++) {
  console.log('Segment ' + currentIdx + ': ' + processedLines[currentIdx]);
}