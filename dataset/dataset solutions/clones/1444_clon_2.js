let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the input string into an array of numbers
const numericValues = rawData.trim().split(" ").map(Number);

// Assign the parsed values to descriptive variables
let sideOne = numericValues[0];
let sideTwo = numericValues[1];
let angleGamma = numericValues[2]; // Angle in degrees

// Calculate the area of the triangle using the sine formula
const areaTriangle = sideOne * sideTwo / 2 * Math.sin(angleGamma * Math.PI / 180);

// Calculate the length of the third side using the Law of Cosines
const sideThree = Math.sqrt(sideOne * sideOne + sideTwo * sideTwo - 2 * sideOne * sideTwo * Math.cos(angleGamma * Math.PI / 180));

// Calculate the height corresponding to sideOne
const heightFromSideOne = 2 * areaTriangle / sideOne;

// Print the calculated area, perimeter, and height, formatted to 8 decimal places
console.log(areaTriangle.toFixed(8) + " " + (sideOne + sideTwo + sideThree).toFixed(8) + " " + heightFromSideOne.toFixed(8));
