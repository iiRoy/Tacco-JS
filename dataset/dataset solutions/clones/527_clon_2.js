var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input string into an array of lines and remove leading/trailing whitespace
var lineArray = rawData.trim().split("\n");

// Extract the first line, split by space, and convert parts to numbers
var configValues = lineArray.shift().split(" ").map(Number);

// Assign configuration values to descriptive variables
var adjustedN = configValues[0] - 1; // N value, potentially adjusted for 0-based indexing
var countM = configValues[1];        // M value, representing a count
var targetP = configValues[2];       // P value, the target point

// Initialize an array to store relevant numeric data points
var dataPoints = [];

// Process the next 'countM' lines from the input
for (var idx = 0; idx < countM; idx++) {
   // Convert the current line to a number
   var currentVal = lineArray.shift() - 0.0;
   // If the value is not equal to the target P, add it to our data points
   if (currentVal !== targetP) {
      dataPoints.push(currentVal);
   }
}

// Ensure the target P value is included in the data points array
dataPoints = dataPoints.concat(targetP);

// Sort the data points numerically in ascending order
dataPoints.sort(function(valA, valB) {
    return valA - valB;
});

// Initialize the minimum distance with a very large number
var minimumDistance = Number.POSITIVE_INFINITY;

// Iterate through each data point to calculate and find the minimum distance
dataPoints.forEach(function(currentPoint, pointIndex) {
    // Scenario 1: The current data point is less than the target P
    if (currentPoint < targetP) {
        // If it's not the first element, calculate a potential minimum distance
        if (pointIndex !== 0) {
            minimumDistance = Math.min(minimumDistance, (targetP - currentPoint) * 2 + (adjustedN - targetP + 1) + dataPoints[pointIndex - 1]);
        }
    }
    // Scenario 2: The current data point is exactly equal to the target P
    if (targetP === currentPoint) {
        // Calculate various potential minimum distances based on its position
        if (pointIndex === 0) { // If P is the first element
            minimumDistance = Math.min(minimumDistance, dataPoints[dataPoints.length - 1] - currentPoint);
        }
        if (pointIndex === dataPoints.length - 1) { // If P is the last element
            minimumDistance = Math.min(minimumDistance, currentPoint - dataPoints[0]);
        }
        if (pointIndex !== dataPoints.length - 1) { // If P is not the last element
            minimumDistance = Math.min(minimumDistance, targetP + adjustedN - dataPoints[pointIndex + 1] + 1);
        }
        if (pointIndex !== 0) { // If P is not the first element
            minimumDistance = Math.min(minimumDistance, adjustedN - targetP + 1 + dataPoints[pointIndex - 1]);
        }
    }
    // Scenario 3: The current data point is greater than the target P
    if (targetP < currentPoint) {
        // If it's not the last element, calculate a potential minimum distance
        if (pointIndex !== dataPoints.length - 1) {
            minimumDistance = Math.min(minimumDistance, (currentPoint - targetP) * 2 + targetP + (adjustedN - dataPoints[pointIndex + 1] + 1));
        }
    }
});

// Output the final calculated minimum distance, multiplied by 100
console.log(minimumDistance * 100);
