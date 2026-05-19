var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = rawData.trim().split("\n");

// Extract configuration values from the first line
var configValues = lineSegments.shift().split(" ").map(Number);

// Assign configuration values to descriptive variables
var adjustedN = configValues[0] - 1; // N value, adjusted
var countM = configValues[1];        // M value
var targetP = configValues[2];       // P value

// Initialize an array to store relevant data points
var dataPoints = [];

// Populate dataPoints based on M and P
for (let idx = 0; idx < countM; idx++) {
    let currentVal = lineSegments.shift() - 0; // Convert string to number
    if (currentVal !== targetP) {
        dataPoints.push(currentVal);
    }
}

// Add the target P value to the data points
dataPoints = dataPoints.concat(targetP);

// Sort the data points in ascending order
dataPoints.sort(function(valA, valB) {
    return valA - valB;
});

// Initialize minimum cost with a very large value
var minimumCost = Infinity;

// Iterate through the sorted data points to calculate minimum cost
dataPoints.forEach(function(currentPoint, pointIndex) {
    // Case 1: currentPoint is less than or equal to targetP
    if (currentPoint <= targetP) {
        if (pointIndex !== 0) {
            // Calculate cost for moving left
            minimumCost = Math.min(minimumCost, (targetP - currentPoint) * 2 + (adjustedN - targetP + 1) + dataPoints[pointIndex - 1]);
        }
    }

    // Case 2: currentPoint is greater than or equal to targetP
    if (targetP <= currentPoint) {
        if (pointIndex !== dataPoints.length - 1) {
            // Calculate cost for moving right
            minimumCost = Math.min(minimumCost, (currentPoint - targetP) * 2 + targetP + (adjustedN - dataPoints[pointIndex + 1] + 1));
        }
    }
});

// Output the final calculated minimum cost, scaled by 100
console.log(minimumCost * 100);
