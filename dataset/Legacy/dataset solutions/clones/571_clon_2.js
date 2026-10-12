let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input

// Process the raw data: remove leading/trailing whitespace and split into an array of lines.
let lineSegments = (rawData.trim()).split("\n");

// Iterate over each individual line segment obtained from the input.
lineSegments.forEach(function(currentSegment) {
    // Initialize counters for specific three-character sequences.
    let joiCount = 0; // Counter for occurrences of "JOI"
    let ioiCount = 0; // Counter for occurrences of "IOI"

    // Loop through the current line segment to find all possible three-character subsequences.
    // The loop runs up to `length - 2` to ensure `idx + 2` is a valid index.
    for (let idx = 0; idx < currentSegment.length - 2; idx++) {
        // Extract a three-character subsequence starting from the current index.
        let subSequence = currentSegment[idx] + currentSegment[idx + 1] + currentSegment[idx + 2];

        // Check if the extracted subsequence matches "JOI".
        if (subSequence === "JOI") {
            joiCount++; // Increment the "JOI" counter.
        }

        // Check if the extracted subsequence matches "IOI".
        if (subSequence === "IOI") {
            ioiCount++; // Increment the "IOI" counter.
        }
    }

    // Output the total count of "JOI" occurrences for the current line segment.
    console.log(joiCount);
    // Output the total count of "IOI" occurrences for the current line segment.
    console.log(ioiCount);
});
