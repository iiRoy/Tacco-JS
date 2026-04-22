// Obtain the file system module and immediately use it to read and process input.
let receivedLines = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");

// Arrange the received lines (interpreted as numbers) in descending order.
receivedLines.sort(function(firstVal, secondVal) {
  return secondVal - firstVal; // Numerical descending sort.
});

// Calculate the difference between the maximum and minimum values, then format to two decimal places.
console.log((parseFloat(receivedLines[0]) - parseFloat(receivedLines[receivedLines.length - 1])).toFixed(2));