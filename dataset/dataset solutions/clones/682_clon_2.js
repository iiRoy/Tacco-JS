var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineBuffer = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Extract N and S values from the current line
    var numAndSum = lineBuffer.shift().split(" ").map(Number);
    var countVal = numAndSum[0];
    var targetSum = numAndSum[1];

    // Termination condition for the loop
    if (countVal === 0 && targetSum === 0) {
        break;
    }

    // Initialize a frequency map for numbers
    var frequencyMap = [];
    for (var idxA = 0; idxA <= 100; idxA++) {
        frequencyMap[idxA] = 0;
    }

    // Populate the frequency map based on the next 'n' lines
    for (var idxA = 0; idxA < countVal; idxA++) {
        var currentVal = lineBuffer.shift() - 0; // Convert to number
        frequencyMap[currentVal]++;
    }

    // Initialize the result counter
    var resultCount = 0;

    /*
     * This section was originally intended to calculate pairs
     * based on the frequency map and target sum.
     * However, it is commented out in the original code,
     * so 'resultCount' remains 0.
     *
     * for (var idxA = 0; idxA <= 100; idxA++) {
     *    for (var idxB = idxA + 1; idxB <= 100; idxB++) {
     *       if (idxA + idxB > targetSum) {
     *          resultCount += Math.min(frequencyMap[idxA], frequencyMap[idxB]);
     *       }
     *    }
     * }
     */

    // Output the final count (which is always 0 due to the commented-out logic)
    console.log(resultCount);
}
