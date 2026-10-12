var inputDataRows = [];

var readline = require('readline');
var inputHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Collect each line of input
inputHandler.on('line', function (currentLine) {
    inputDataRows.push(currentLine);
});

// Process all input once the stream closes
inputHandler.on('close', function () {
    // Parse the first line for N and K
    var firstLineParts = inputDataRows.shift().split(" ");
    var totalElements = Number(firstLineParts[0]);
    var maxSegments = Number(firstLineParts[1]);

    // Convert the second line into an array of characters
    var charSequence = inputDataRows[0].split("");

    // This array will store the lengths of consecutive blocks of '0's and '1's
    var segmentLengths = [];
    var currentDigit = 1; // Start by looking for '1's
    var currentCount = 0; // Counter for the current block's length

    // Iterate through the character sequence to build segmentLengths
    // Example: "11001" -> [2, 2, 1]
    for (var idx = 0; idx < totalElements; idx++) {
        if (charSequence[idx] === currentDigit.toString()) {
            currentCount++;
        } else {
            segmentLengths.push(currentCount);
            currentDigit = 1 - currentDigit; // Toggle between 0 and 1
            currentCount = 1;
        }
    }

    // Add the last accumulated count if it's not zero
    if (currentCount !== 0) {
        segmentLengths.push(currentCount);
    }

    // Ensure segmentLengths always has an odd number of elements by padding with a zero
    // This makes sure the pattern 1-0-1-0... is consistent for calculations
    if (segmentLengths.length % 2 === 0) {
        segmentLengths.push(0);
    }
    
    var summedLength = 0;
    var maximumLength = 0; // Initialize with 0, as lengths are non-negative

    // Iterate through the segmentLengths array
    // We only consider segments starting with '1' (even indices)
    for (var segmentIdx = 0; segmentIdx < segmentLengths.length; segmentIdx++) {
        if (segmentIdx % 2 === 0) {
            // Sum up segments within the allowed window (2*K + 1 segments)
            // This window represents K '0' blocks and K+1 '1' blocks
            for (var subSegmentIdx = 0; subSegmentIdx <= 2 * maxSegments; subSegmentIdx++) {
                // Ensure we don't go out of bounds
                if (segmentIdx + subSegmentIdx < segmentLengths.length) {
                    summedLength += segmentLengths[segmentIdx + subSegmentIdx];
                }
            }
            // Update the maximum length found so far
            if (maximumLength < summedLength) {
                maximumLength = summedLength;
            }
            summedLength = 0; // Reset for the next window
        }
    }

    // Output the final maximum length
    console.log(maximumLength);
});
