var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// This script processes a sequence of numbers from standard input.
// It performs calculations based on modular arithmetic and outputs results.

var numericSequence = rawData.trim().split("\n").map(Number);

while (true) {
    // Extract the next number from the input sequence.
    var currentValue = numericSequence.shift();

    // If the extracted number is zero, it signifies the end of input blocks.
    if (currentValue === 0) {
        break;
    }

    var booleanFlags = []; // An array to store boolean indicators.
    // Initialize all elements of the booleanFlags array to 'false'.
    for (var idx = 0; idx < currentValue; idx++) {
        booleanFlags[idx] = false;
    }

    // Mark specific indices as 'true' based on a modular square operation.
    for (var k = 1; k < currentValue; k++) {
        booleanFlags[(k * k) % currentValue] = true;
    }

    var markedIndices = []; // This array will hold the indices that were marked 'true'.
    booleanFlags.forEach(function (flagValue, indexPosition) {
        if (flagValue) {
            markedIndices.push(indexPosition);
        }
    });

    var finalCounts = []; // An array to accumulate the final count results.
    var halfRange = (currentValue - 1) / 2; // Calculate a midpoint for array sizing.

    // Populate the finalCounts array with zeros up to the calculated halfRange.
    for (var p = 0; p <= halfRange; p++) {
        finalCounts[p] = 0;
    }

    // Iterate through all unique pairs of marked indices to compute differences.
    for (var idx = 0; idx < markedIndices.length; idx++) {
        for (var q = 0; q < markedIndices.length; q++) {
            // Skip if the indices are identical to avoid self-comparison.
            if (idx === q) {
                continue;
            }

            var difference = markedIndices[idx] - markedIndices[q]; // Compute the raw difference.

            // Adjust negative differences by adding the currentValue (modulo operation).
            if (difference < 0) {
                difference += currentValue;
            }
            // Further adjust differences that exceed the halfRange.
            if (halfRange < difference) {
                difference -= currentValue;
            }
            finalCounts[difference]++; // Increment the counter for the adjusted difference.
        }
    }

    finalCounts.shift(); // Remove the element at index 0 from the final counts.

    // Output each remaining count, multiplied by two, to the console.
    finalCounts.forEach(function (resultItem) {
        console.log(resultItem * 2);
    });
}
