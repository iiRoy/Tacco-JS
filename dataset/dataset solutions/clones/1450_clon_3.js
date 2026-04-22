// This script processes two sets of numbers provided via standard input.
// It determines the count of unique numbers from the second set that are also present in the first set.

const fileSystemModule = require('fs'); // Utilizing the Node.js file system module for I/O operations.

// --- Input Acquisition and Initial Processing ---

// Attempt to read the entire standard input stream as a UTF-8 string.
// A try-catch block could be added for robust error handling, but for this exercise,
// we'll assume successful input acquisition.
let rawInputPayload = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Safeguard against empty input. If no input is provided, terminate gracefully.
if (!rawInputPayload || rawInputPayload.trim().length === 0) {
    console.error("Error: No input data received from stdin.");
    process.exit(1); // Exit with an error code.
}

// Split the raw input into an array of individual lines.
// Using a regex to handle both Windows (CRLF) and Unix (LF) line endings.
let sourceContentLines = rawInputPayload.split(/\r?\n/);

// Filter out any completely empty lines that might result from trailing newlines or multiple consecutive newlines.
sourceContentLines = sourceContentLines.filter(line => line.trim().length > 0);

// --- Data Extraction and Transformation ---

// The original problem statement might include 'n' and 'q' as counts,
// but they are unused in the given logic. We'll explicitly discard them
// to simplify the code while maintaining the input parsing structure.
// This is a Type III deletion of unused variables.
const _discardedFirstCountLine = sourceContentLines.shift(); // Represents 'n' in the original context.
const _primaryDataSetString = sourceContentLines.shift(); // The line containing elements for set S.

const _discardedSecondCountLine = sourceContentLines.shift(); // Represents 'q' in the original context.
const _queryDataSetString = sourceContentLines.shift(); // The line containing elements for set T.

// Create a Set for efficient membership checking of the primary data set (S).
// Using a Set is a Type III structural change compared to the original array-as-hashmap approach.
let primaryElementExistenceSet = new Set();
if (_primaryDataSetString) {
    // Split the string into individual elements based on spaces.
    const primaryRawElements = _primaryDataSetString.split(' ');
    // Populate the set with unique elements from the first data line.
    for (const elementIdentifier of primaryRawElements) {
        if (elementIdentifier.length > 0) { // Avoid adding empty strings if there are multiple spaces
            primaryElementExistenceSet.add(elementIdentifier);
        }
    }
}


// Process the query data set (T).
let uniqueQueryItemsForSearch = [];
if (_queryDataSetString) {
    const queryRawElements = _queryDataSetString.split(' ');
    // Use a Set temporarily to get unique elements from the query list.
    // This is a more modern and readable way than `indexOf` filter, a Type III update.
    const uniqueQueryElementsTemp = new Set(queryRawElements.filter(item => item.length > 0));
    uniqueQueryItemsForSearch = Array.from(uniqueQueryElementsTemp);
}

// --- Core Logic: Matching and Counting ---

let totalMatchCount = 0; // Initialize a counter for found matches.

// Iterate over each unique element in the processed query set.
// This loop serves the same purpose as the original `T.forEach`.
for (let searchCandidate of uniqueQueryItemsForSearch) {
    // Perform a lookup in the primary set for the current candidate.
    // `has()` is an O(1) operation on average for Sets.
    const isPresentInPrimarySet = primaryElementExistenceSet.has(searchCandidate);

    // If the candidate exists in the primary set, increment the total match count.
    if (isPresentInPrimarySet) {
        totalMatchCount++;
    }
}

// --- Output Generation ---

// Display the final count of matches to standard output.
// Using `process.stdout.write` is an alternative to `console.log`, demonstrating a Type III change in output method.
process.stdout.write(String(totalMatchCount) + '\n'); // Ensure a newline character is appended for proper formatting.

// End of script.