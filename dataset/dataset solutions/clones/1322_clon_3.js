let fileContentBuffer;
try {
    // Attempt to read the full input from standard input as a UTF-8 string.
    // Using a descriptive variable name for the raw content.
    fileContentBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (dataAcquisitionError) {
    // Implement a robust error handling mechanism for file reading failures.
    // This is an added guard clause not present in the original.
    console.error("System encountered an issue reading input from /dev/stdin:", dataAcquisitionError.message);
    // Terminate the process with an error code to signal failure.
    process.exit(1);
}

// A preliminary check to ensure that some content was actually loaded.
// If the buffer is empty or undefined, there's nothing to process.
if (!fileContentBuffer || fileContentBuffer.trim().length === 0) {
    console.warn("Input stream appears to be empty. No processing will occur.");
    // Output 0 as there are no occurrences in an empty input.
    console.log(0);
    process.exit(0);
}

// Pre-process the raw input:
// 1. Trim any leading or trailing whitespace from the entire block.
// 2. Split the content into an array of distinct lines.
// 3. Filter out any lines that are completely empty after splitting (e.g., from multiple newlines).
const parsedContentLines = fileContentBuffer
    .trim()
    .split('\n')
    .filter(segment => segment.length > 0); // Added an explicit filter for empty line segments

// Extract the primary search fragment from the first valid line.
let targetSearchFragment = '';
if (parsedContentLines.length > 0) {
    targetSearchFragment = parsedContentLines[0];
} else {
    // If after parsing, there are no lines, it means no search pattern was provided.
    console.log(0);
    process.exit(0);
}

// Initialize an accumulator for the total number of matches found across all lines.
let aggregatedMatchCount = 0;

// Define the specific marker string that signals the end of textual data.
const endOfDataMarker = "END_OF_TEXT";

/**
 * A utility function to determine the number of non-overlapping occurrences
 * of a smaller string within a larger string. This replaces the direct
 * use of `split().length - 1` with a named helper function, enhancing readability.
 * @param {string} sourceString The string in which to search.
 * @param {string} fragmentToFind The substring to count.
 * @returns {number} The count of occurrences.
 */
function calculateFragmentOccurrences(sourceString, fragmentToFind) {
    // Handle the edge case where the fragment to find is an empty string.
    // Splitting by an empty string behaves unusually, and for this context,
    // an empty fragment doesn't meaningfully "occur".
    if (fragmentToFind.length === 0) {
        return 0;
    }
    // The core logic remains similar, leveraging JavaScript's split method.
    // If 'fragmentToFind' appears N times, 'split' will yield an array of N+1 elements.
    return sourceString.split(fragmentToFind).length - 1;
}

// Introduce a control flag to manage the iteration process, offering an alternative
// to direct `break` statements in some scenarios, demonstrating a Type III change.
let shouldContinueProcessing = true;

// Iterate through the processed lines, starting from the second line (index 1),
// as the first line is dedicated to the search pattern.
for (let currentLineIdentifier = 1; currentLineIdentifier < parsedContentLines.length && shouldContinueProcessing; ++currentLineIdentifier) {
    const currentTextualSegment = parsedContentLines[currentLineIdentifier];

    // Check if the current line is the termination signal.
    if (currentTextualSegment === endOfDataMarker) {
        shouldContinueProcessing = false; // Update the flag to stop further iterations.
        // An explicit break is also added here for immediate loop termination,
        // complementing the `shouldContinueProcessing` flag in the loop condition.
        break;
    }

    // Add an additional guard clause: if a line is empty, skip it.
    // This helps in robustness if the initial filter wasn't perfect or if empty lines
    // are intentionally left in the input before the termination marker.
    if (currentTextualSegment.length === 0) {
        continue;
    }

    // Utilize the helper function to count occurrences in the current line.
    const matchesInCurrentSegment = calculateFragmentOccurrences(currentTextualSegment, targetSearchFragment);

    // Add the count from the current line to the overall total.
    aggregatedMatchCount += matchesInCurrentSegment;
}

// Output the final computed total count of occurrences.
// Using `console.info` for outputting results, differentiating from errors/warnings.
console.info(aggregatedMatchCount);