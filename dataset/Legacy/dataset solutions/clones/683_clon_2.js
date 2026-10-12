var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input data is read as a single string, then trimmed and split into an array of lines.
var lineBuffer = (rawData.trim()).split("\n");

// This loop processes multiple test cases until a specific termination condition is met.
while (true) {
    // Extract the first line, which contains the count of elements and the target sum.
    // It's split by space and each part is converted to a number.
    var numAndSum = lineBuffer.shift().split(" ").map(Number);

    // 'count' represents the number of elements in the current test case.
    var count = numAndSum[0];
    // 'targetSum' is the threshold for pair sums.
    var targetSum = numAndSum[1];

    // The loop terminates if both count and targetSum are zero.
    if (count === 0 && targetSum === 0) {
        break;
    }

    // Initialize an array to hold the numeric data for the current test case.
    var dataItems = [];

    // Populate the dataItems array by reading 'count' lines from the buffer.
    for (var idx1 = 0; idx1 < count; idx1++) {
        // Each line is converted to a number using the unary minus operator trick.
        var currentVal = lineBuffer.shift() - 0;
        dataItems.push(currentVal);
    }

    // Sort the array of data items in ascending numerical order.
    // This sorting is crucial for the subsequent pair-counting logic.
    dataItems.sort(function (valA, valB) {
        return valA - valB;
    });

    // Initialize a counter for pairs that satisfy the condition.
    var pairCount = 0;

    // Outer loop iterates through each element in the sorted array.
    for (var idx1 = 0; idx1 < count; idx1++) {
        // Inner loop iterates through elements that come after the current outer loop element.
        for (var idx2 = idx1 + 1; idx2 < count; idx2++) {
            // Check if the sum of the current pair exceeds the target sum.
            if (dataItems[idx1] + dataItems[idx2] > targetSum) {
                // If the sum exceeds the target, add the count of remaining elements
                // from the current inner loop position to the end of the array.
                // Then, continue to the next iteration of the inner loop.
                pairCount += count - idx2;
                continue;
            }
        }
    }

    // Output the total count of pairs found for the current test case.
    console.log(pairCount);
}
