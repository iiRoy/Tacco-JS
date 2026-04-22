// This section handles reading raw text data from standard input.
const fileDataString = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' );

/*
 * The subsequent step processes the acquired string.
 * It removes leading/trailing spaces, splits by space characters,
 * and then converts each segment into a numerical representation.
 * These represent the x1, y1, x2, y2 coordinates respectively.
 */
let numericCoordinates = fileDataString
    .trim()
    .split(" ")
    .map(Number);

// Calculation of the geometric distance between two points (x1, y1) and (x2, y2).
// The formula used is sqrt((x2-x1)^2 + (y2-y1)^2).
var calculatedEuclideanDistance = Math.sqrt(
    Math.pow(numericCoordinates[2] - numericCoordinates[0], 2) +
    Math.pow(numericCoordinates[3] - numericCoordinates[1], 2)
);

// Finally, the computed distance is outputted to the console,
// formatted to a specific number of decimal places for precision.
console.log(calculatedEuclideanDistance.toFixed(8));