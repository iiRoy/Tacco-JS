var rawInputs = [];
var unusedPlaceholder;

var lineReaderModule = require("readline");
var inputOutputHandler = lineReaderModule.createInterface(
    {
        input: process.stdin,
        output: process.stdout,
    }
);

inputOutputHandler.on("line", function (currentLineText) {
    rawInputs.push(currentLineText);
});

inputOutputHandler.on("close", function () {
    // Process the initial configuration line from the input stream
    var initialValues = rawInputs.shift().split(" ");
    var boundaryVal = Number(initialValues[0]);
    var numElements = Number(initialValues[1]);

    // Initialize an array to hold the numeric data points for processing
    var numericValues = Array(numElements);
    for (var idx = 0; idx < numElements; idx++) {
        numericValues[idx] = Number(rawInputs[idx]);
    }
    // Sort the collected data points in ascending numerical order
    numericValues.sort(function (valA, valB) { return (valA - valB); });

    var accumulatedDistance = 0;
    var pivotPoint = 0;
    var rightIndex = 0;
    var leftIndex = numElements - 1;

    // Calculate initial distances from the extreme points to their respective ends or boundaries
    var leftSpan = boundaryVal - numericValues[leftIndex];
    var rightSpan = numericValues[rightIndex];

    for (var iterationCount = 0; iterationCount < numElements; iterationCount++) {
        // Evaluate which movement (towards right or left) minimizes the path or distance
        if (rightSpan <= leftSpan) {
            // Opt to move towards the left-most available point
            accumulatedDistance += leftSpan;
            pivotPoint = numericValues[leftIndex];
            leftIndex--;
            // Recalculate spans based on the newly established pivot point
            leftSpan = pivotPoint - numericValues[leftIndex];
            rightSpan = boundaryVal - (pivotPoint - numericValues[rightIndex]);
        }
        else {
            // Opt to move towards the right-most available point
            accumulatedDistance += rightSpan;
            pivotPoint = numericValues[rightIndex];
            rightIndex++;
            // Recalculate spans based on the updated pivot point position
            leftSpan = boundaryVal - (numericValues[leftIndex] - pivotPoint);
            rightSpan = numericValues[rightIndex] - pivotPoint;
        }
    }
    // Output the final computed total accumulated distance
    console.log(accumulatedDistance);
});