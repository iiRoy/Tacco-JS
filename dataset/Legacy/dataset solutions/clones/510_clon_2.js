var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data: trim whitespace and split into individual lines.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop. Continues until a specific termination condition is met.
while (true) {
    // Extract the first number from the line segments, converting it to a numeric type.
    // This number represents the count of elements in the subsequent sequence.
    var countElements = lineSegments.shift() - 0;

    // If the extracted count is zero, it signifies the end of input, so break the loop.
    if (countElements === 0) {
        break;
    }

    // Extract the next line, split it by spaces, and convert each part to a number.
    // This forms the current numeric sequence to be analyzed.
    var numericSequence = (lineSegments.shift()).split(" ").map(Number);

    // Iterate through potential exclusion indices. The loop runs from 0 up to `countElements` (inclusive).
    // This is because we are looking for one element to remove from a sequence of `countElements + 1` numbers.
    for (var exclusionIndex = 0; exclusionIndex < countElements + 1; exclusionIndex++) {
        // Create a new sequence by filtering out the element at the current `exclusionIndex`.
        // The goal is to find which removed element makes the remaining sequence an arithmetic progression.
        var filteredSequence = numericSequence.filter(function(currentValue, elementIndex) {
            return exclusionIndex !== elementIndex;
        });

        // Calculate the initial common difference using the first two elements of the filtered sequence.
        var commonDifference = filteredSequence[1] - filteredSequence[0];

        // Initialize a boolean flag to true, assuming the sequence is arithmetic until proven otherwise.
        var isArithmetic = true;

        // Iterate through the filtered sequence starting from the second element to check for consistent differences.
        // The loop runs up to `countElements - 1` because `filteredSequence` has `countElements` elements.
        for (var checkIndex = 1; checkIndex < countElements; checkIndex++) {
            // If the difference between consecutive elements does not match the `commonDifference`,
            // then the sequence is not arithmetic. Set the flag to false.
            if (commonDifference !== filteredSequence[checkIndex] - filteredSequence[checkIndex - 1]) {
                isArithmetic = false;
                // No need to check further if a discrepancy is found.
                // (Note: The original code doesn't break here, but it's a minor optimization not changing behavior)
            }
        }

        // If, after checking all elements, the flag is still true, it means we found the missing element.
        // Break out of this inner loop as the correct `exclusionIndex` has been identified.
        if (isArithmetic === true) {
            break;
        }
    }

    // Output the element from the original `numericSequence` that was at the `exclusionIndex`.
    // This is the element that, when removed, makes the remaining sequence an arithmetic progression.
    console.log(numericSequence[exclusionIndex]);
}
