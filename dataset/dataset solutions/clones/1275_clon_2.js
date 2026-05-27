var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = rawData.split("\n"); // Divide the input into lines
var processedNumbers = (lineSegments[1]).split(" "); // Extract the second line and split it by spaces
processedNumbers.reverse(); // Invert the order of elements in the array
console.log(processedNumbers.join(" ")); // Output the reversed elements joined by spaces
