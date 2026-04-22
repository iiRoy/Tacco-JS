const fileSystemAdapter = require('fs');

// Acquire raw input data from the standard input stream.
// It's assumed the input is encoded in UTF-8.
const originalInputBuffer = fileSystemAdapter.readFileSync('/dev/stdin', 'utf8');

// Pre-process the acquired raw data:
// 1. Remove any leading or trailing whitespace characters from the entire input block.
// 2. Split the cleaned string into an array of individual line segments.
//    This typically separates the primary text (haystack) from the search query (needle).
const inputLinesArray = originalInputBuffer.trim().split('\n');

// --- Input Validation and Early Exit Conditions ---

// Verify that a sufficient number of input lines have been provided.
// We expect at least two lines: one for the main body of text and one for the pattern.
if (inputLinesArray.length < 2) {
    console.error("Error: Insufficient input. Please provide at least two lines (text and pattern).");
    process.exit(1); // Terminate with an error status.
}

// Extract the primary text string from the first line of input.
const primaryText = inputLinesArray[0];

// Extract the search pattern string from the second line of input.
const searchTarget = inputLinesArray[1];

// Cache the length of the primary text for optimized loop boundary checks.
const primaryTextCharCount = primaryText.length;

// Cache the length of the search pattern for efficient comparison operations.
const searchTargetCharCount = searchTarget.length;

// Initialize an array to store the starting indices of all successful pattern matches.
const detectedMatchPositions = [];

// --- Additional Edge Case Handling for Search Logic ---

// If the search pattern is empty, it is conventionally considered to match everywhere,
// or in a practical sense, it's not a meaningful search. We'll exit gracefully.
if (searchTargetCharCount === 0) {
    console.log("Note: The provided search pattern is empty. No specific pattern to find.");
    process.exit(0); // Exit successfully, as no search was truly performed.
}

// If the search pattern is longer than the primary text, no match is possible.
if (searchTargetCharCount > primaryTextCharCount) {
    console.log("Info: The search pattern is longer than the main text. No matches can exist.");
    process.exit(0); // Exit successfully, as no matches are possible.
}

// --- Main Search Algorithm Execution ---

// Iterate through all possible starting positions within the primary text.
// The loop terminates when there isn't enough remaining text to accommodate the full pattern.
for (let currentScanIndex = 0; currentScanIndex <= primaryTextCharCount - searchTargetCharCount; ++currentScanIndex) {
    // Utilize the built-in `startsWith` string method for efficient substring comparison.
    // This checks if the `primaryText` starts with `searchTarget` at the `currentScanIndex`.
    // This single method call replaces the original nested loop and boolean flag logic.
    if (primaryText.startsWith(searchTarget, currentScanIndex)) {
        // If a match is confirmed, record its starting index.
        detectedMatchPositions.push(currentScanIndex);
    }
}

// --- Outputting Results ---

// Check if any matches were found during the search.
if (detectedMatchPositions.length > 0) {
    // If matches exist, iterate through the collected indices and print each one
    // on a new line, as per the original program's output format.
    detectedMatchPositions.forEach(matchLocation => {
        console.log(matchLocation);
    });
} else {
    // If no matches were found, provide an informative message to the user.
    console.log("Result: No occurrences of the specified pattern were found in the text.");
}