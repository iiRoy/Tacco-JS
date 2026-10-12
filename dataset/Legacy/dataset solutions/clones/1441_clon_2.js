var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw text from standard input
var numericValues = rawData.split(' ').map(function(numStr) { // Split the string by spaces and convert each part to a number
    return +numStr;
});

var sideA = numericValues[0]; // First numerical component
var sideB = numericValues[1]; // Second numerical component
var angleGamma = numericValues[2]; // Third numerical component, representing an angle in degrees

// Calculate the height (h) of the triangle relative to side 'a'
// Convert angle from degrees to radians for trigonometric functions
var triangleHeight = sideB * Math.sin(angleGamma / 180 * Math.PI);

// Compute the area (S) of the triangle using the base 'a' and calculated height 'h'
var triangleArea = sideA * triangleHeight / 2;

// Apply the Law of Cosines to find the square of the third side (c^2)
// c^2 = a^2 + b^2 - 2ab * cos(C)
var sideCSquared = Math.pow(sideA, 2) + Math.pow(sideB, 2) - 2 * sideA * sideB * Math.cos(angleGamma / 180 * Math.PI);

// Calculate the length of the third side (c) by taking the square root
var sideC = Math.sqrt(sideCSquared);

// Output the calculated area, formatted to five decimal places
console.log(triangleArea.toFixed(5));

// Output the perimeter (sum of all three sides), formatted to five decimal places
console.log((sideA + sideB + sideC).toFixed(5));

// Output the calculated height, formatted to five decimal places
console.log(triangleHeight.toFixed(5));
