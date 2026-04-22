const fileAccessUtility = require('fs');

// Path to retrieve the data from standard input
const inputSourcePath = '/dev/stdin';

// Read the entire content from the specified input path,
// ensuring UTF-8 encoding for text processing.
let rawContentBuffer = fileAccessUtility.readFileSync(inputSourcePath, 'utf8');

// Process the raw content: remove any leading or trailing whitespace
// to ensure clean data for pattern matching.
let processedInputString = rawContentBuffer.trim();

// Initialize a variable to keep track of the maximum common length found
// across all identified JOI sequences. This starts at zero as no sequences
// have been processed yet.
let largestCommonCount = 0;

// Early exit condition: if the input string is empty after trimming,
// there can be no sequences, so output 0 and terminate.
if (processedInputString.length === 0) {
    console.log(0);
    process.exit(0);
}

// Define the regular expression pattern to identify sequences of 'J', 'O', and 'I'.
// The 'g' flag ensures that all occurrences are found, not just the first.
// Each group (J+, O+, I+) captures one or more consecutive characters.
const joiSequencePattern = new RegExp('(J+)(O+)(I+)', 'g');

// Iterate through all matches of the 'JOI' pattern within the processed input string.
// The matchAll method provides an iterator for all non-overlapping matches.
for (const matchResult of processedInputString.matchAll(joiSequencePattern)) {
    // Extract the captured groups for 'J', 'O', and 'I' sequences.
    // matchResult[1] corresponds to the J+ group, matchResult[2] to O+, and matchResult[3] to I+.
    const jSequenceSegment = matchResult[1];
    const oSequenceSegment = matchResult[2];
    const iSequenceSegment = matchResult[3];

    // Determine the length of each individual segment.
    const jLength = jSequenceSegment.length;
    const oLength = oSequenceSegment.length;
    const iLength = iSequenceSegment.length;

    // Calculate the minimum length among the three segments for the current match.
    // This is rewritten from Math.min for Type III variation.
    let currentSegmentMin;
    if (jLength <= oLength && jLength <= iLength) {
        currentSegmentMin = jLength;
    } else if (oLength <= jLength && oLength <= iLength) {
        currentSegmentMin = oLength;
    } else {
        currentSegmentMin = iLength;
    }

    // Update the `largestCommonCount` if the `currentSegmentMin` is greater
    // than the previously recorded maximum.
    // This is rewritten from Math.max for Type III variation.
    if (currentSegmentMin > largestCommonCount) {
        largestCommonCount = currentSegmentMin;
    }
}

// Output the final calculated maximum common length to the console.
console.log(largestCommonCount);