var inputData = [];
var unusedVar; // This variable is declared but never used in the original code.

var standardInput = require("readline");
var inputHandler = standardInput.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on("line", function (currentLine) {
    inputData.push(currentLine);
});

inputHandler.on("close", function () {
    // Parse the first line for total length and number of points
    var initialParams = inputData.shift().split(" ");
    var totalLength = Number(initialParams[0]);
    var numPoints = Number(initialParams[1]);

    // Read the coordinates of the points
    var pointCoords = Array(numPoints);
    for (var idx = 0; idx < numPoints; idx++) {
        pointCoords[idx] = Number(inputData[idx]);
    }
    // Sort the points in ascending order
    pointCoords.sort(function (valA, valB) { return (valA - valB); });

    // --- Scenario 1: First move is to the left ---
    var rightPtr = 0;
    var leftPtr = numPoints - 1;
    // Calculate initial distances to the ends
    var distLeft = totalLength - pointCoords[leftPtr]; // Distance from current left point to the far left end
    var distRight = pointCoords[rightPtr];             // Distance from current right point to the far right end
    var scoreLeftStart = 0; // Accumulator for total distance traveled

    // Simulate the movement for N steps
    for (var loopCount = 0; loopCount < numPoints; loopCount++) {
        // If moving left is better or it's the very first step
        if (distRight <= distLeft || loopCount === 0) {
            scoreLeftStart += distLeft; // Add current left distance to total score
            distRight += distLeft;      // Update right distance (now from the new position)
            // Calculate new left distance (distance between current left point and the next one)
            distLeft = pointCoords[leftPtr] - pointCoords[leftPtr - 1];
            leftPtr--; // Move left pointer inward
        }
        // Otherwise, moving right is better
        else {
            scoreLeftStart += distRight; // Add current right distance to total score
            distLeft += distRight;       // Update left distance (now from the new position)
            // Calculate new right distance (distance between current right point and the next one)
            distRight = pointCoords[rightPtr + 1] - pointCoords[rightPtr];
            rightPtr++; // Move right pointer inward
        }
    }

    // --- Scenario 2: First move is to the right ---
    // Re-initialize pointers and distances for the second scenario
    rightPtr = 0;
    leftPtr = numPoints - 1;
    distLeft = totalLength - pointCoords[leftPtr];
    distRight = pointCoords[rightPtr];
    var scoreRightStart = 0; // Accumulator for total distance traveled

    // Simulate the movement for N steps
    for (var loopCount = 0; loopCount < numPoints; loopCount++) {
        // If moving right is better or it's the very first step
        if (distLeft <= distRight || loopCount === 0) {
            scoreRightStart += distRight; // Add current right distance to total score
            distLeft += distRight;        // Update left distance (now from the new position)
            // Calculate new right distance (distance between current right point and the next one)
            distRight = pointCoords[rightPtr + 1] - pointCoords[rightPtr];
            rightPtr++; // Move right pointer inward
        }
        // Otherwise, moving left is better
        else {
            scoreRightStart += distLeft; // Add current left distance to total score
            distRight += distLeft;       // Update right distance (now from the new position)
            // Calculate new left distance (distance between current left point and the next one)
            distLeft = pointCoords[leftPtr] - pointCoords[leftPtr - 1];
            leftPtr--; // Move left pointer inward
        }
    }
    // Output the maximum score from both scenarios
    console.log(Math.max(scoreLeftStart, scoreRightStart));
});
