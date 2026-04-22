// This script processes input data from standard input to identify two key characteristics:
// 1. The token that appears most frequently.
// 2. The longest token encountered.

// Initialization of data structures and tracking variables.
// A Map is used for frequency counting, providing a robust way to store key-value pairs.
let tokenOccurrenceCounter = new Map(); // Stores how many times each unique token appears.
let highestObservedFrequency = 0;      // Keeps track of the maximum frequency found.
let mostCommonTokenIdentifier = null;  // Stores the token associated with the highest frequency.

// Variables for tracking the longest string.
let longestTextSegmentFound = '';      // Holds the actual string content of the longest segment.
let maximumSegmentLength = 0;          // Stores the length of the longest string found.

// Module required for file system operations, specifically reading input.
const fileSystemInterface = require('fs');

// Define the source for standard input and its expected encoding.
const standardInputSource = "/dev/stdin";
const textEncodingFormat = "utf8";

let rawInputBuffer = ''; // Variable to hold the content read from standard input.

try {
    // Attempt to synchronously read all content from the standard input path.
    // This is a blocking operation, suitable for script execution environments.
    rawInputBuffer = fileSystemInterface.readFileSync(standardInputSource, textEncodingFormat);
} catch (dataReadError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and terminate the process gracefully. This acts as a robust guard clause.
    console.error("Error encountered while attempting to read input data:", dataReadError.message);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Process the raw input: split it into individual tokens using space as a delimiter.
// This creates an array of strings, where each string is a distinct token from the input.
const processedTokensArray = rawInputBuffer.split(' ');

// Iterate over each token in the array to perform both frequency and length analysis.
processedTokensArray.forEach((currentInputToken) => {
    // Skip any empty strings that might result from multiple spaces in the input.
    if (currentInputToken.length === 0) {
        return; // Move to the next token without processing this one.
    }

    // --- Token Frequency Analysis ---
    // Get the current count for the token. If it's not in the map yet, default to 0.
    let currentTokenFrequency = tokenOccurrenceCounter.get(currentInputToken) || 0;
    currentTokenFrequency++; // Increment the count for the current token.
    tokenOccurrenceCounter.set(currentInputToken, currentTokenFrequency); // Update the map with the new count.

    // Compare the token's updated frequency with the highest frequency observed so far.
    if (currentTokenFrequency > highestObservedFrequency) {
        highestObservedFrequency = currentTokenFrequency; // Update the record for maximum frequency.
        mostCommonTokenIdentifier = currentInputToken;    // Store this token as the new most common one.
    }

    // --- Token Length Analysis ---
    // Determine the length of the current token.
    const lengthOfCurrentToken = currentInputToken.length;

    // Check if this token's length exceeds the maximum length recorded so far.
    if (lengthOfCurrentToken > maximumSegmentLength) {
        maximumSegmentLength = lengthOfCurrentToken; // Update the maximum length.
        longestTextSegmentFound = currentInputToken;  // Store this token as the new longest string.
    }
});

// Final output: Display the most frequent token and the longest string found.
// If no tokens were processed (e.g., empty input), default values will be '0' for the token identifier
// and '0' for the text segment to match the original's behavior of initializing variables to 0.
console.log(`${mostCommonTokenIdentifier || '0'} ${longestTextSegmentFound || '0'}`);