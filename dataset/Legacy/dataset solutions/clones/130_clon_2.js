var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
var dataRows = rawData.trim().split('\n'); // Split the input into an array of lines, removing leading/trailing whitespace

var currentRow; // Declare a variable to hold the current line being processed
var rightAngleShapes = 0; // Initialize counter for shapes satisfying Pythagorean theorem
var rhombusShapes = 0; // Initialize counter for shapes with two equal sides (potentially rhombuses)

// Loop through each line of input data
while (currentRow = dataRows.shift()) {
    // Split the current line by comma, then convert each part to a number
    var parsedValues = currentRow.split(',').map(function(numStr) {
        return +numStr; // Convert string to number
    });

    // Assign the parsed numeric values to descriptive variables
    var sideA = parsedValues[0];
    var sideB = parsedValues[1];
    var sideC = parsedValues[2];

    // Check if the sides satisfy the Pythagorean theorem (a^2 + b^2 = c^2)
    if (sideA * sideA + sideB * sideB === sideC * sideC) {
        rightAngleShapes++; // Increment the counter for right-angled shapes
    }
    // Otherwise, check if the first two sides are equal
    else if (sideA === sideB) {
        rhombusShapes++; // Increment the counter for rhombus-like shapes
    }
}

// Output the final counts to the console
console.log(rightAngleShapes);
console.log(rhombusShapes);
