var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Extract N and M from the first line segment
    var dimensions = lineSegments.shift().split(" ").map(Number);
    var numElements = dimensions[0];
    var targetSum = dimensions[1];

    // Check for termination condition
    if (numElements === 0 && targetSum === 0) {
        break;
    }

    // Populate the array with input values
    var dataValues = [];
    for (var idx = 0; idx < numElements; idx++) {
        dataValues.push(lineSegments.shift() - 0); // Convert to number
    }
    dataValues.push(0); // Add a zero as per the original algorithm

    // Generate all possible sums of two elements
    var sumCombinations = [];
    for (var firstIdx = 0; firstIdx < dataValues.length; firstIdx++) {
        for (var secondIdx = firstIdx; secondIdx < dataValues.length; secondIdx++) {
            sumCombinations.push(dataValues[firstIdx] + dataValues[secondIdx]);
        }
    }

    // Sort the combinations in ascending order
    sumCombinations.sort(function (valA, valB) {
        return valA - valB;
    });

    var maximumAchieved = 0;
    var rightPointer = sumCombinations.length - 1;

    // Find the maximum sum less than or equal to targetSum
    for (var leftPointer = 0; leftPointer < sumCombinations.length; leftPointer++) {
        // Move the right pointer inwards if the sum exceeds targetSum
        while (sumCombinations[leftPointer] + sumCombinations[rightPointer] > targetSum) {
            rightPointer--;
        }
        // Update the maximum sum found so far
        maximumAchieved = Math.max(maximumAchieved, sumCombinations[leftPointer] + sumCombinations[rightPointer]);
    }

    // Output the result
    console.log(maximumAchieved);
}
