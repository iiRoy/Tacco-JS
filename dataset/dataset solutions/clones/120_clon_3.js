const fileSystemUtility = require('fs'); // Import the Node.js file system module.

// Initialize tracking variables for word analysis.
// 'occurrenceMap' will store the frequency count for each unique word.
let occurrenceMap = {};

// 'highestOccurrenceCount' keeps track of the maximum frequency found.
let highestOccurrenceCount = 0;

// 'keyWithHighestOccurrence' stores the word that currently has the highest frequency.
let keyWithHighestOccurrence = '';

// 'currentLongestWord' holds the longest string encountered so far.
// It's initialized to an empty string to ensure correct length comparison (an empty string has length 0).
let currentLongestWord = '';

// Define the standard input file path for reading data.
const standardInputFilePath = '/dev/stdin';

// Attempt to read the entire content of the standard input file synchronously.
// Specify 'utf8' encoding to handle text data correctly.
const rawInputData = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

// --- Input Validation and Pre-processing ---
// Check if the input data is empty or contains only whitespace.
// If so, output default values and exit, as there's nothing to process.
if (!rawInputData.trim()) {
    // Output the default values for the most frequent item and longest word.
    console.log(`${keyWithHighestOccurrence} ${currentLongestWord}`);
    process.exit(0); // Terminate the process cleanly.
}

// Split the raw input string into an array of individual words (tokens) using space as a delimiter.
// Filter out any empty strings that might result from multiple spaces (e.g., "word1  word2" -> ["word1", "", "word2"]).
const processedTokens = rawInputData.split(' ').filter(token => token.length > 0);

// If, after splitting and filtering, no valid tokens remain, handle this scenario.
if (processedTokens.length === 0) {
    // Output the default values if no valid words were found.
    console.log(`${keyWithHighestOccurrence} ${currentLongestWord}`);
    process.exit(0); // Terminate.
}

// --- Main Processing Loop ---
// Iterate over each processed token to update frequency counts and track the longest word.
// A 'for...of' loop is used for clear iteration over array elements.
for (const currentTokenBeingAnalyzed of processedTokens) {
    // --- Frequency Analysis Section ---
    // Retrieve the current count for the token from the map. If it doesn't exist, default to 0.
    let tokenFrequency = occurrenceMap[currentTokenBeingAnalyzed] || 0;
    // Increment the frequency count for the current token.
    tokenFrequency++;
    // Update the map with the new frequency.
    occurrenceMap[currentTokenBeingAnalyzed] = tokenFrequency;

    // Compare the current token's frequency with the highest recorded frequency.
    if (tokenFrequency > highestOccurrenceCount) {
        // If it's higher, update the highest frequency.
        highestOccurrenceCount = tokenFrequency;
        // And store this token as the new most frequent item.
        keyWithHighestOccurrence = currentTokenBeingAnalyzed;
    }

    // --- Longest Word Analysis Section ---
    // Determine the length of the current token.
    const lengthOfCurrentToken = currentTokenBeingAnalyzed.length;
    // Determine the length of the word currently considered the longest.
    const lengthOfLongestKnownWord = currentLongestWord.length;

    // Check if the current token is longer than the longest word found so far.
    if (lengthOfCurrentToken > lengthOfLongestKnownWord) {
        // If it is, update 'currentLongestWord' to this token.
        currentLongestWord = currentTokenBeingAnalyzed;
    }
}

// --- Final Output ---
// Display the results: the word that appeared most frequently, and the longest word encountered.
// Using a template literal for clean string interpolation.
console.log(`${keyWithHighestOccurrence} ${currentLongestWord}`);