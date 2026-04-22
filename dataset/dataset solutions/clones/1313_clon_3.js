// This program reads character data from standard input,
// counts the frequency of each English alphabet letter (case-insensitive),
// and then outputs a report showing each letter and its total count.

// Module for file system operations
const fileSystem = require('fs');

// Define the path for the standard input stream
const inputFilePath = '/dev/stdin';

// Read the entire content from the specified input path synchronously.
// The content is expected to be UTF-8 encoded text.
const rawInputContent = fileSystem.readFileSync(inputFilePath, 'utf8');

// --- Input Validation and Pre-processing ---

// Guard clause: Check if the input data is empty or null.
// If no data is present, log a message and terminate the process gracefully.
if (!rawInputContent || rawInputContent.length === 0) {
    console.log("No input data was provided for analysis.");
    // Optionally, could return an empty report or throw an error.
    process.exit(0);
}

// Convert the raw string content into an array of individual characters.
// This step prepares the data for easier iteration and character-level analysis.
const processedCharacters = rawInputContent.split('');

// --- Character Frequency Tally Initialization ---

// Initialize an object to store the frequency of each alphabet character.
// All counts are set to zero initially.
const alphabeticalTally = {};
const lowercaseAlphabetLetters = 'abcdefghijklmnopqrstuvwxyz';

// Dynamically populate the tally object with all lowercase alphabet characters
// as keys, ensuring each starts with a count of zero.
for (let char of lowercaseAlphabetLetters) {
    alphabeticalTally[char] = 0;
}

// --- Character Analysis Loop ---

// Iterate through each character obtained from the input stream.
// The loop processes every character to determine if it's an alphabet letter.
for (let currentPosition = 0; currentPosition < processedCharacters.length; currentPosition++) {
    // Extract the character at the current index.
    const currentChar = processedCharacters[currentPosition];

    // Convert the character to lowercase to ensure case-insensitive counting.
    // For example, 'A' and 'a' will both increment the count for 'a'.
    const lowercasedChar = currentChar.toLowerCase();

    // Check if the lowercase character is a valid key in our `alphabeticalTally` object.
    // This implicitly filters out non-alphabetic characters (numbers, symbols, spaces, etc.)
    // as only 'a' through 'z' are present as keys.
    if (alphabeticalTally.hasOwnProperty(lowercasedChar)) {
        // If it's an alphabet letter, increment its corresponding counter.
        alphabeticalTally[lowercasedChar]++;
    }
    // Characters that are not in the `alphabeticalTally` (i.e., non-alphabetic)
    // are simply ignored and do not affect the counts.
}

// --- Output Generation ---

// Prepare an array to hold individual lines of the final report.
// This approach is generally more efficient for building large strings than repeated concatenation.
const reportLines = [];

// Iterate over the key-value pairs (letter and its count) in the frequency map.
// For each entry, format a string like "letter : count" and add it to the report lines array.
Object.entries(alphabeticalTally).forEach(([letterKey, countValue]) => {
    reportLines.push(`${letterKey} : ${countValue}`);
});

// Join all the formatted lines together with a newline character to form the final report string.
const finalReportString = reportLines.join('\n');

// Display the generated report to the console.
// The `.trim()` method removes any leading or trailing whitespace from the final string,
// although with the current `join('\n')` method, trailing whitespace is unlikely.
console.log(finalReportString.trim());