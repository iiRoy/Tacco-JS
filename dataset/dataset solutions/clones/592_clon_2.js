/*
 * This JavaScript module processes sequential numeric data.
 * It reads from standard input, expecting a specific pattern
 * where a primary value is followed by a fixed number of
 * sub-values. The script then calculates and displays
 * the discrepancy between the primary value and the sum of its sub-values.
 */

// Incorporate the file system interaction module.
const fileSystemInterface = require('fs');

// Acquire the entire content from the standard input source.
// The data is expected to be text-based, using UTF-8 encoding.
let rawStreamData = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Pre-process the acquired data:
// 1. Remove any extraneous whitespace from the beginning and end.
// 2. Divide the string into an array of individual lines, using the newline character as a delimiter.
const lineFragments = rawStreamData.trim().split("\n");

// Establish an index to navigate through the array of line fragments.
let segmentPointer = 0;

// Commence the primary processing loop.
// This loop continues as long as the pointer remains within the bounds of the `lineFragments` array.
while (segmentPointer < lineFragments.length) {

    // Extract the main numeric value for the current data block.
    // Convert the string representation to a numerical type.
    let blockTotal = Number(lineFragments[segmentPointer]);

    // Check for a termination condition: if the main value is zero,
    // it signals the end of meaningful data blocks.
    if (blockTotal === 0) {
        break; // Exit the processing loop.
    }

    // Initialize an accumulator for summing the subsequent component values.
    let componentSum = 0;

    // Begin the inner iteration to gather and sum the next ten component values.
    // These values are expected to immediately follow the `blockTotal` in the input stream.
    for (let subSegmentIndex = 0; subSegmentIndex < 10; subSegmentIndex++) {
        // Access the current component line, converting it to a number,
        // and add it to the running `componentSum`.
        // The `+1` offset is because components start immediately after the `blockTotal`.
        componentSum += Number(lineFragments[segmentPointer + subSegmentIndex + 1]);
    }

    // Output the calculated difference between the declared `blockTotal`
    // and the aggregated `componentSum`. This highlights any variance.
    console.log(blockTotal - componentSum);

    // Advance the `segmentPointer` to the beginning of the next data block.
    // Note: This increment logic matches the original code's specific behavior
    // regarding overlapping data consumption, where the last element of one
    // sub-sum range becomes the `blockTotal` of the next.
    segmentPointer += 10;

} // End of the primary processing loop.