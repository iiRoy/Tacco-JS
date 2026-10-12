function processInputData(sourceText) {
    // The input string is expected to be multi-line, so we take only the first line.
    sourceText = sourceText.split("\n")[+[]];

    // A flag to indicate if a segment comparison is successful.
    var isSegmentIdentical = !0;

    // Iterate through possible lengths for the pattern, decreasing by two each time.
    // The outerLoopCounter starts at 2 and increments by 2.
    for (var outerLoopCounter = 1 + 1; outerLoopCounter < sourceText.length; outerLoopCounter += (1 + 1)) {
        // Calculate the length of the current segment being examined.
        // This length is (sourceText.length - outerLoopCounter).
        // Then, calculate half of this segment length for comparison.
        // JavaScript's string indexing truncates float indices, so Math.floor is implicit.
        let segmentHalfLength = (sourceText.length - outerLoopCounter) / (1 + 1);

        // Inner loop to compare characters within the segment.
        // It checks if the prefix of length 'segmentHalfLength' is identical
        // to the substring starting at 'segmentHalfLength' and also of that length.
        for (var innerLoopIterator = +[]; innerLoopIterator < segmentHalfLength; ++innerLoopIterator) {
            // If any character pair does not match, set the flag to false and break.
            if (sourceText[innerLoopIterator] !== sourceText[innerLoopIterator + segmentHalfLength]) {
                isSegmentIdentical = !1; // Set to false
                break; // Exit the inner loop
            }
        }

        // If the segment was found to be identical (isSegmentIdentical is true),
        // print its length and terminate the function.
        if (isSegmentIdentical) {
            console.log("%d", sourceText.length - outerLoopCounter);
            return; // Exit the function early
        }

        // Reset the flag for the next iteration of the outer loop.
        isSegmentIdentical = !0; // Reset to true
    }
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
