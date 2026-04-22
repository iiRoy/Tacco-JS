// This script processes numerical data from standard input to find a specific count.
var receivedStrings = []; // Container for all input lines read from the stream.
var computedValue = 0;   // Variable to hold the final calculated result.

// Acquire the 'readline' module for handling input/output streams.
var inputProcessor = require('readline');

// Establish an interface to read lines from standard input and write to standard output.
var ioHandler = inputProcessor.createInterface({
    input: process.stdin,  // Use standard input as the source.
    output: process.stdout // Use standard output for any potential output (though not directly used by rl here).
});

// Attach an event listener for each line received.
ioHandler.on('line', function (incomingText) {
    // Store the incoming line of text in our array.
    receivedStrings.push(incomingText);
});

// Attach an event listener for when the input stream closes.
ioHandler.on('close', function () {
    // Parse the first line to get the array size (numElements) and the modulo value (moduloVal).
    var numElements = retrieveSegmentValue(receivedStrings[0], 0);
    var moduloVal   = retrieveSegmentValue(receivedStrings[0], 1);

    // Process the second line: split by space and convert each part to a number.
    var dataSequence = receivedStrings[1].split(" ").map(elementStr => Number(elementStr));

    // Initialize an array to store cumulative sums modulo moduloVal.
    var partialTotals = [];
    partialTotals[0] = 0; // The first prefix sum is always 0 for an empty prefix.

    // Calculate prefix sums modulo moduloVal.
    for (var loopIndex = 0; loopIndex < numElements; loopIndex++) {
        partialTotals[loopIndex + 1] = (partialTotals[loopIndex] + dataSequence[loopIndex]) % moduloVal;
    }

    var overallTally = 0;       // Initialize the final result counter.
    var occurrenceMap = {};     // Object to store frequencies of each remainder.

    // Iterate through the array of partial totals to count pairs.
    for (
        var idx = 0;
        idx < partialTotals.length;
        idx++
    ) {
        // If the current remainder hasn't been seen before, initialize its count to zero.
        if (occurrenceMap[partialTotals[idx]] === undefined) {
            occurrenceMap[partialTotals[idx]] = 0;
        }

        // Add the number of previous occurrences of this remainder to the overall tally.
        overallTally += occurrenceMap[partialTotals[idx]];

        // Increment the count for the current remainder.
        occurrenceMap[partialTotals[idx]]++;
    }

    // Output the final calculated tally.
    console.log(overallTally);
});

/**
 * Helper function to parse a specific numeric segment from a space-separated string.
 * @param {string} sourceString - The input string to parse.
 * @param {number} segmentPosition - The zero-based index of the numeric segment to extract.
 * @returns {number} The parsed numeric value.
 */
function retrieveSegmentValue(sourceString, segmentPosition) {
    return (
        Number(
            sourceString.split(" ")[segmentPosition]
        )
    );
}