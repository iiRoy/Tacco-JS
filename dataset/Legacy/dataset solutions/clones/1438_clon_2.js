var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input string: remove leading/trailing whitespace, split by space, and convert to numbers.
var coordinates = rawData.trim().split(" ").map(Number);

// Calculate the Euclidean distance between two points (x1, y1) and (x2, y2).
// The input array is expected to be [x1, y1, x2, y2].
// Distance formula: sqrt((x2 - x1)^2 + (y2 - y1)^2)
var distanceValue = Math.sqrt(
    Math.pow(coordinates[2] - coordinates[0], 2) +
    Math.pow(coordinates[3] - coordinates[1], 2)
);

// Output the calculated distance, formatted to 8 decimal places.
console.log(distanceValue.toFixed(8));
