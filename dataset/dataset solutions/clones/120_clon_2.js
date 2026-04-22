// Initialize a map to store the frequency of each distinct word encountered.
const wordFrequencies = {};

// Initialize variables to track the maximum occurrence count,
// the word associated with that maximum count, and the longest word found.
let maxOccurrences = 0;
let dominantWord = '';
let longestPhrase = '';

// Load the Node.js file system module for input/output operations.
const fileSystemModule = require("fs");

// Read all data from standard input (/dev/stdin), interpret it as UTF-8 text,
// then split the content into individual tokens (words) using space as a delimiter.
// The 'map' function is utilized here to iterate over each token and process it.
fileSystemModule.readFileSync("/dev/stdin", "utf8").split(' ').map(function(currentToken) {

    // Evaluate if the current token has been recorded in our frequency map before.
    wordFrequencies[currentToken]
        ? ( // If the token exists in the map:
            // Increment its count. Then, check if this new count surpasses the current maximum.
            ++wordFrequencies[currentToken] > maxOccurrences
                ? ( // If it does, update the maximum occurrences and record this token as the dominant one.
                    maxOccurrences = wordFrequencies[currentToken],
                    dominantWord = currentToken
                )
                : 0 // Otherwise, perform no action for frequency tracking.
        )
        : ( // If the token is encountered for the first time:
            // Initialize its count to 1 in the frequency map.
            // Note: The logic for updating maxOccurrences and dominantWord only triggers
            // when an *existing* word's count is incremented past the current max,
            // matching the original code's behavior.
            wordFrequencies[currentToken] = 1
        );

    // Compare the character length of the current token with that of the longest phrase found so far.
    // If the current token is longer, update the longest phrase variable.
    currentToken.length > longestPhrase.length ? longestPhrase = currentToken : 0;
});

// After processing all tokens, output the dominant word (most frequent)
// and the longest phrase found, separated by a single space.
console.log(dominantWord + ' ' + longestPhrase);