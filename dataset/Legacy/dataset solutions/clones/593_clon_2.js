var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input data
var lineData = rawData.trim().split("\n");

// Initialize line counter
var lineIndex = 0;

// Read dimensions (m and n) from the first line
var dimensions = lineData[lineIndex].split(" ").map(Number);
lineIndex++; // Move to the next line

var rows = dimensions[0];
var cols = dimensions[1];

// Initialize array for row values
var rowValues = [];
// Populate row values array
for (var idxA = 0; idxA < rows - 1; idxA++) {
    rowValues[idxA] = +lineData[lineIndex]; // Convert string to number
    lineIndex++;
}

// Initialize array for column operations
var colOperations = [];
// Populate column operations array
for (var idxB = 0; idxB < cols; idxB++) {
    colOperations[idxB] = +lineData[lineIndex]; // Convert string to number
    lineIndex++;
}

// Initialize total sum and current position
var totalValue = 0;
var currentPosition = 0;

// Iterate through each column operation
colOperations.forEach(function (operationValue) {
    // Determine direction factor based on operation value sign
    var directionFactor = (operationValue > 0) ? 1 : -1;

    // Get absolute count of operations
    var absOperationCount = Math.abs(operationValue);

    // Perform operations based on absolute count
    while (absOperationCount--) {
        // Add value if moving forward
        if (directionFactor === 1) {
            totalValue += rowValues[currentPosition];
        }

        // Update current position
        currentPosition = currentPosition + directionFactor;

        // Add value if moving backward (after position update)
        if (directionFactor === -1) {
            totalValue += rowValues[currentPosition];
        }
    }
    // Apply modulo to the total sum
    totalValue = totalValue % 100000;
});

// Output the final calculated sum
console.log(totalValue);
