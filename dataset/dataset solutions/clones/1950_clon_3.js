"use strict"

// Define a constant for the minimum allowed length of a numeric sub-segment.
const MIN_SEGMENT_LENGTH = 4;
// Define the specific divisor against which numeric sub-segments will be checked.
const TARGET_MODULO_DIVISOR = 2019;

/**
 * Orchestrates the analysis of input data to identify and count specific numeric patterns.
 * This function performs input sanitization, iterates through potential sub-segments,
 * converts them to numbers, and applies a divisibility check.
 *
 * @param {string} rawInputContent - The complete string content obtained from the input source.
 */
function analyzeNumericStringPatterns(rawInputContent) {
    // First, process the raw input: remove leading/trailing whitespace and isolate the primary line.
    let primaryDataLine = rawInputContent.trim().split('\n')[0];

    // Implement a preliminary check: if the processed string is too short,
    // no valid sub-segments can be formed, so we can exit early.
    if (primaryDataLine.length < MIN_SEGMENT_LENGTH) {
        console.log(0); // Output zero as no patterns were found.
        return;        // Terminate function execution.
    }

    // Initialize a accumulator for the total count of patterns found.
    let matchingPatternTally = 0;
    const currentSequenceLength = primaryDataLine.length;

    // Outer iteration: Controls the starting boundary of each potential numeric sub-segment.
    // The loop ensures there's always enough remaining characters to form a segment of at least MIN_SEGMENT_LENGTH.
    for (let segmentStartIdx = 0; segmentStartIdx <= currentSequenceLength - MIN_SEGMENT_LENGTH; ++segmentStartIdx) {
        // Inner iteration: Controls the ending boundary (exclusive) of the current sub-segment.
        // It guarantees that the sub-segment's length is at least MIN_SEGMENT_LENGTH.
        for (let segmentEndIdx = segmentStartIdx + MIN_SEGMENT_LENGTH; segmentEndIdx <= currentSequenceLength; ++segmentEndIdx) {
            // Extract the current string portion based on the determined boundaries.
            let candidateSubsegment = primaryDataLine.substring(segmentStartIdx, segmentEndIdx);

            // Attempt to convert the extracted string into an integer.
            // Using parseInt with radix 10 for explicit base conversion.
            let numericValue = parseInt(candidateSubsegment, 10);

            // Add a robustness check: ensure the conversion resulted in a valid number.
            // If not, this sub-segment is not relevant for the numeric divisibility check.
            if (isNaN(numericValue)) {
                continue; // Skip to the next sub-segment if it's not a valid number.
            }

            // Perform the core divisibility test: check if the numeric value is
            // perfectly divisible by our predefined TARGET_MODULO_DIVISOR.
            if (numericValue % TARGET_MODULO_DIVISOR === 0) {
                // If the condition is met, increment the total count.
                matchingPatternTally++;
            }
        }
    }

    // After iterating through all possible sub-segments, output the final aggregated count.
    console.log(matchingPatternTally);
}

// Entry point for execution: responsible for reading input and initiating the analysis.
try {
    // Dynamically load the Node.js 'fs' (file system) module.
    const fileSystemModule = require('fs');
    // Read all data from standard input ('/dev/stdin') synchronously,
    // interpreting it as UTF-8 encoded text.
    const incomingBufferData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Pass the acquired input data to the main processing function.
    analyzeNumericStringPatterns(incomingBufferData);
} catch (inputError) {
    // Catch and handle any errors that might occur during file reading or initial processing.
    console.error("An operational error was encountered:", inputError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}