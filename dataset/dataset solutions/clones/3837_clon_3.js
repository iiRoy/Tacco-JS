/**
 * Core function to process textual data and identify a specific lexicographical substring.
 * This routine expects two lines of input:
 * 1. The primary text sequence from which substrings will be derived. It will be normalized to lowercase.
 * 2. An integer value indicating the 1-indexed rank of the desired unique substring.
 *
 * The function performs input validation, generates all non-empty unique substrings,
 * sorts them alphabetically, and then prints the substring corresponding to the specified rank.
 */
function processInputContent(rawInputPayload) {
    // Decompose the incoming raw data into distinct line segments.
    const lineSegments = rawInputPayload.split("\n");

    // Implement an initial guard clause for malformed or insufficient input.
    if (!lineSegments || lineSegments.length < 2) {
        return;
    }

    // Extract and normalize the primary text sequence for processing.
    const targetSequence = lineSegments[0].trim().toLowerCase();
    const sequenceLength = targetSequence.length;

    // Parse the numerical rank from the second line of input.
    const desiredRank = parseInt(lineSegments[1], 10);

    // Validate the length of the target sequence against defined boundaries.
    if (sequenceLength < 1 || sequenceLength > 5000) {
        return;
    }

    // Validate the parsed rank value for correctness and adherence to constraints.
    if (isNaN(desiredRank) || desiredRank < 1 || desiredRank > 5) {
        return;
    }

    // Initialize a Set data structure to efficiently store and manage unique substrings.
    const distinctFragments = new Set();

    // Iterate through all possible starting and ending positions to generate every non-empty substring.
    for (let startIdx = 0; startIdx < sequenceLength; ++startIdx) {
        for (let endIdx = startIdx + 1; endIdx <= sequenceLength; ++endIdx) {
            const currentFragment = targetSequence.substring(startIdx, endIdx);
            // The Set automatically handles uniqueness, so no explicit check is needed here.
            distinctFragments.add(currentFragment);
        }
    }

    // Convert the collection of unique fragments from a Set into a sortable Array.
    const orderedFragments = Array.from(distinctFragments);

    // Sort the array of unique fragments lexicographically (alphabetically).
    orderedFragments.sort();

    // Add a final validation to ensure the requested rank exists within the collected fragments.
    if (desiredRank > orderedFragments.length) {
        return;
    }

    // Output the substring found at the (desiredRank - 1) index,
    // as arrays are zero-indexed while the rank is one-indexed.
    console.log(orderedFragments[desiredRank - 1]);
}

// Establish the primary execution flow for the script.
// This typically involves reading input from a standard source and passing it to the processing function.
const fsModule = require("fs");
const stdInputContent = fsModule.readFileSync("/dev/stdin", "utf8");
processInputContent(stdInputContent); // Initiate the substring analysis.