let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input

const numericValues = rawData.split(' ').map(function(item) {
    return +item; // Convert each string segment to a number
});

let coord1X = numericValues[0]; // First point's X coordinate
let coord1Y = numericValues[1]; // First point's Y coordinate
let coord2X = numericValues[2]; // Second point's X coordinate
let coord2Y = numericValues[3]; // Second point's Y coordinate

// Compute the squared Euclidean distance between the two points
const squaredDistance = Math.pow(coord1X - coord2X, 2) + Math.pow(coord1Y - coord2Y, 2);

console.log(Math.sqrt(squaredDistance).toFixed(5)); // Display the square root of the squared distance, formatted to five decimal places
