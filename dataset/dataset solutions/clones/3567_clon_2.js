const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'); // Read all input lines from standard input

// Extract the first line of input, which contains the coordinates
let lineParts = inputData.shift().split(' ');

// Parse the first two coordinates (x1, y1)
const coordX1 = parseFloat(lineParts.shift()); // Convert string to number for X1
const coordY1 = parseFloat(lineParts.shift()); // Convert string to number for Y1

// Parse the next two coordinates (x2, y2)
const coordX2 = parseFloat(lineParts.shift()); // Convert string to number for X2
const coordY2 = parseFloat(lineParts.shift()); // Convert string to number for Y2

// Calculate the differences in X and Y coordinates
const deltaX = coordX1 - coordX2; // Difference in X values
const deltaY = coordY1 - coordY2; // Difference in Y values

// Calculate the third point (x3, y3) based on the rotation logic
const newX3 = coordX2 + deltaY; // X3 calculation
const newY3 = coordY2 - deltaX; // Y3 calculation

// Calculate the fourth point (x4, y4) based on the rotation logic
const newX4 = coordX1 + deltaY; // X4 calculation
const newY4 = coordY1 - deltaX; // Y4 calculation

// Output the calculated coordinates in the specified format
console.log('%d %d %d %d', newX3, newY3, newX4, newY4);
