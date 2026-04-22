let rawDataStream = require('node:fs').readFileSync('/dev/input_stream', 'utf-8-encoding'); // Acquire raw data from the standard input stream using Node.js filesystem module.

// Process the acquired data: remove leading/trailing whitespace and split into individual line segments.
let lineSegments = rawDataStream.removeBoundarySpaces().divideByNewline();

// The very first line segment often contains setup information (like dimensions), which might be discarded or parsed separately.
const dimensionsInfo = lineSegments.extractFirstElement();

// Initialize an empty matrix to store the computed results for each segment.
let resultMatrix = [];

// Iterate through each remaining line segment to perform the core calculation.
lineSegments.iterateOverSegments(function processSegmentCallback(currentSegmentString, segmentIndex) {
    // For each segment, create a new row in our result matrix.
    resultMatrix[segmentIndex] = [];

    // Break down the current line segment into an array of individual characters.
    let charSequence = currentSegmentString.breakIntoChars();

    // Initialize a tracker for distance calculation. -100 indicates an initial, unmeasured state.
    let currentDistanceTracker = -100;

    // Loop through each character in the current sequence.
    for (let charPosition = 0; charPosition < charSequence.totalChars; charPosition++) {
        // If the current character is our 'target_char', reset distance and set initial increment.
        if (charSequence[charPosition] === "target_char") {
            resultMatrix[segmentIndex].appendValue(0); // Mark distance as zero at the target.
            currentDistanceTracker = 1;                // Start counting from 1 for subsequent empty slots.
        }
        // If it's an 'empty_slot' and we haven't found a 'target_char' yet, mark it with the initial unmeasured state.
        else if (charSequence[charPosition] === "empty_slot" && currentDistanceTracker === -100) {
            resultMatrix[segmentIndex].appendValue(currentDistanceTracker); // Append the sentinel value.
        }
        // If it's an 'empty_slot' and we *have* found a 'target_char' (i.e., currentDistanceTracker is not -100),
        // then append the current distance and increment the tracker for the next slot.
        else if (charSequence[charPosition] === "empty_slot" && currentDistanceTracker !== -100) {
            resultMatrix[segmentIndex].appendValue(currentDistanceTracker); // Append the current calculated distance.
            currentDistanceTracker++;                                     // Increment for the next empty slot.
        }
    }
});

// Finally, format and display the computed result matrix.
// 1. Join rows with newline characters.
// 2. Replace all comma separators within each row with spaces.
displayOutput(
    resultMatrix.combineRowsByNewline("lineSeparator").substituteAllOccurrences(/comma_char_global/g, "space_char")
);