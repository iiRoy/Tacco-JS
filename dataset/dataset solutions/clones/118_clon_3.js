// This program processes text data received from standard input.
// Its primary function is to identify two key pieces of information:
// 1. The word that appears most frequently within the input.
// 2. The single longest word present in the input.
// Finally, it outputs the maximum frequency count and the longest word itself.

// --- Core Data Structures and Initial State ---

// `wordFrequencies`: An object used as a hash map (or dictionary) to store
// each unique word encountered along with its corresponding count.
const wordFrequencies = {};

// `maximumOccurrenceCount`: A numerical variable initialized to zero.
// It will hold the highest frequency value found among all words.
let maximumOccurrenceCount = 0;

// `longestWordCharacterCount`: A numerical variable, also initialized to zero.
// It tracks the length of the longest word identified so far during processing.
let longestWordCharacterCount = 0;

// `currentLongestWord`: A string variable, initially empty.
// It will store the actual text of the word that has the maximum length.
let currentLongestWord = '';

// --- Input Acquisition and Initial Processing ---

// Obtain the Node.js built-in 'fs' (file system) module
// to handle reading data from the specified input source.
const fileSystemUtility = require('fs');

// Define the input source path. As per the original requirement,
// input is read from standard input, typically represented as '/dev/stdin' on Unix-like systems.
const sourceInputPath = "/dev/stdin";

let rawInputContentBuffer;

// Attempt to read the entire content of the standard input synchronously.
// A try-catch block is added for robust error handling, an enhancement over the original.
try {
    rawInputContentBuffer = fileSystemUtility.readFileSync(sourceInputPath, "utf8");
} catch (ioError) {
    // If reading fails (e.g., file not found, permissions issue, or stream error),
    // log the error and exit gracefully. This prevents an unhandled crash.
    console.error("Failed to read input from standard input:", ioError.message);
    // Output default results as if no valid input was processed.
    console.log('0 ');
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Remove any leading or trailing whitespace from the raw input string.
const cleanedInputString = rawInputContentBuffer.trim();

// --- Pre-processing Validation: Check for Empty Input ---

// If the input string is empty after trimming, there's nothing to process.
// This is a guard clause to handle empty input scenarios efficiently.
if (cleanedInputString.length === 0) {
    console.log('0 '); // Output default values (0 frequency, empty longest word).
    process.exit(0); // Exit successfully as no error occurred, just no data.
}

// Split the cleaned input string into an array of individual words (tokens).
// Words are separated by spaces. The `.filter()` method is added to
// remove any empty strings that might result from multiple consecutive spaces.
const processedWordTokens = cleanedInputString.split(' ').filter(token => token.length > 0);

// --- Main Processing Loop: Analyze Each Word ---

// Iterate over each word token obtained from the input array.
// `forEach` is used for explicit iteration, replacing the less conventional `some`
// from the original code which wasn't used for early exit.
processedWordTokens.forEach((individualWord) => {

    // --- Logic for Counting Word Frequencies ---

    // Check if this `individualWord` has already been seen and counted.
    if (wordFrequencies[individualWord]) {
        // If it exists, increment its current frequency count.
        wordFrequencies[individualWord]++;
    } else {
        // If it's a new word, initialize its count to 1.
        wordFrequencies[individualWord] = 1;
    }

    // After updating the count for the current word, compare it with the global
    // maximum frequency found so far.
    const currentWordOccurrenceCount = wordFrequencies[individualWord];
    if (currentWordOccurrenceCount > maximumOccurrenceCount) {
        // If the current word's frequency is higher, update the global maximum.
        maximumOccurrenceCount = currentWordOccurrenceCount;
    }

    // --- Logic for Tracking the Longest Word ---

    // Determine the length of the current word.
    const lengthOfThisWord = individualWord.length;

    // Compare the length of the current word with the length of the
    // longest word recorded thus far.
    if (lengthOfThisWord > longestWordCharacterCount) {
        // If the current word is longer, update both the maximum length
        // and the actual text of the longest word.
        longestWordCharacterCount = lengthOfThisWord;
        currentLongestWord = individualWord;
    }
});

// --- Final Output ---

// Print the collected results to standard output.
// The output format is "maximum_frequency longest_word", separated by a space,
// consistent with the original program's requirement.
console.log(`${maximumOccurrenceCount} ${currentLongestWord}`);