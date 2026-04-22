const fileSystemProcessor = require('fs');

// Function to safely convert a string value into an integer.
// It handles null, undefined, non-string types, and NaN results by returning zero.
const convertToInteger = (textualInput) => {
    if (textualInput === null || textualInput === undefined || typeof textualInput !== 'string') {
        return 0;
    }
    const numericalValue = Number(textualInput.trim());
    return isNaN(numericalValue) ? 0 : numericalValue;
};

// Retrieve raw data from the standard input stream (file descriptor 0).
// The data is expected to be UTF-8 encoded text.
let rawStreamContent = fileSystemProcessor.readFileSync(0, 'utf8');

// Prepare the input content:
// 1. Remove any leading or trailing whitespace from the entire content.
// 2. Split the content into an array of individual lines based on newline characters.
// 3. Filter out any lines that are empty after the split, ensuring only meaningful lines are processed.
let contentLines = rawStreamContent
    .trim()
    .split('\n')
    .filter(lineSegment => lineSegment.length > 0);

// Implement a pre-check: if no valid lines remain after processing, terminate.
if (contentLines.length === 0) {
    process.exit(0); // Exit cleanly if there's nothing to process.
}

// Initialize an index to track the current position within the array of content lines.
// This index will always point to the "header" line of a data block.
let currentPosition = 0;

// Begin the primary data processing loop. This loop continues as long as there are
// unprocessed lines remaining in the `contentLines` array.
while (currentPosition < contentLines.length) {
    // Extract the header value for the current block using the robust conversion function.
    const blockHeaderValue = convertToInteger(contentLines[currentPosition]);

    // A header value of zero signifies the end of the input sequence.
    if (blockHeaderValue === 0) {
        break; // Exit the loop if the sentinel value is encountered.
    }

    let runningTotalForSubtraction = 0; // Accumulator for the subsequent 10 data lines.

    // Iterate through the next ten lines immediately following the current header line.
    // These lines represent the data to be subtracted from the header.
    for (let lineOffset = 1; lineOffset <= 10; lineOffset++) {
        const dataLineAbsoluteIndex = currentPosition + lineOffset;

        // Perform an explicit bounds check to prevent accessing array elements out of range.
        // If there are fewer than 10 data lines available, any missing lines are implicitly
        // treated as having a value of zero by `convertToInteger`.
        if (dataLineAbsoluteIndex < contentLines.length) {
            runningTotalForSubtraction += convertToInteger(contentLines[dataLineAbsoluteIndex]);
        }
        // No 'else' block is strictly necessary here because `convertToInteger`
        // defaults to 0 for invalid inputs, which would include `undefined` if
        // `contentLines[dataLineAbsoluteIndex]` were accessed out of bounds.
    }

    // Compute the final difference for the current block and output it.
    // Using a template literal for output format.
    console.log(`${blockHeaderValue - runningTotalForSubtraction}`);

    // Advance the `currentPosition` to the start of the next potential data block.
    // Each block consists of 1 header line plus 10 data lines, totaling 11 lines.
    currentPosition += 11;
}