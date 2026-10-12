var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string: remove leading/trailing whitespace and split into an array of lines.
var lineSegments = (rawData.trim()).split("\n");

// Extract the first line, convert it to a number, and use it as the loop iteration count.
var loopCount = +lineSegments.shift();

// Iterate through the remaining lines, processing each one.
for (var idx = 0; idx < loopCount; idx++) {
    // For each line, split it by spaces and convert each part to a number.
    var numericValues = lineSegments[idx].split(" ").map(Number);

    // Define an anonymous function to calculate the relationship between two circles.
    // The parameters represent (x1, y1, r1, x2, y2, r2) for two circles.
    (function (xCoordA, yCoordA, radiusA, xCoordB, yCoordB, radiusB) {
        var resultValue; // Variable to store the calculated relationship.

        // Calculate the Euclidean distance between the centers of the two circles.
        var distanceBetweenCenters = Math.sqrt(Math.pow(xCoordA - xCoordB, 2) + Math.pow(yCoordA - yCoordB, 2));

        // Case 1: Circles are too far apart to intersect or touch.
        if (distanceBetweenCenters > radiusA + radiusB) {
            resultValue = 0;
        }

        // Case 2: Circles are close enough to potentially intersect, touch, or one contains the other.
        if (distanceBetweenCenters <= radiusA + radiusB) {
            resultValue = 1; // Default to 1 (intersecting or touching).

            // Sub-case 2a: Circle B is completely inside Circle A.
            if (distanceBetweenCenters <= radiusA - radiusB) {
                resultValue = 2;
            }
            // Sub-case 2b: Circle A is completely inside Circle B.
            if (distanceBetweenCenters <= radiusB - radiusA) {
                resultValue = -2;
            }
        }
        // Output the determined relationship value to the console.
        console.log(resultValue);
    }).apply(null, numericValues); // Execute the anonymous function with the parsed numeric values as arguments.
}
