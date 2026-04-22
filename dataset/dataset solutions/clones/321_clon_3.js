// This script is designed to process textual input from standard input,
// identify and modify specific words within each line, and then
// output the transformed text to the console.
// It simulates a simple text transformation utility.

// Import the Node.js 'fs' (file system) module for input operations.
// Using 'const' for modules is a best practice.
const fileSystemModule = require('fs');

// Define a constant for the standard input path.
// This ensures consistency and makes the code easier to modify.
const STANDARD_INPUT_PATH = '/dev/stdin';

// Define the specific word to search for and its replacement.
// Using constants improves readability and maintainability.
const TARGET_IDENTIFIER = 'Hoshino';
const REPLACEMENT_IDENTIFIER = 'Hoshina';

// --- Input Reading Phase ---
// Read the entire content from the specified standard input path.
// The content is read as UTF-8 encoded text and any leading/trailing
// whitespace is removed using .trim().
let rawInputContent = '';
try {
    rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, 'utf8').trim();
} catch (error) {
    // Basic error handling for file reading.
    // If the input file cannot be read, an error message is printed,
    // and the process exits to prevent further execution with invalid data.
    console.error("Error reading input from " + STANDARD_INPUT_PATH + ": " + error.message);
    process.exit(1);
}

// --- Pre-processing Phase ---
// Split the raw input content into individual lines.
// An empty string input will result in an array containing a single empty string.
const inputContentLines = rawInputContent.split('\n');

// Initialize a counter for the number of lines processed.
// This variable serves as an intermediate step to track execution progress.
let processedLinesCount = 0;

/**
 * Processes a given text line, splitting it into words, replacing a target word
 * with a specified replacement, and rejoining the words.
 * This helper function encapsulates the core word replacement logic,
 * promoting modularity and reusability.
 *
 * @param {string} currentTextSegment - The input text line to process.
 * @param {string} searchFor - The word to find and replace.
 * @param {string} replaceWith - The word to substitute in place of the searchFor word.
 * @returns {string} The transformed text line with replacements applied.
 */
function transformTextSegment(currentTextSegment, searchFor, replaceWith) {
    // Add a guard clause for non-string or empty segments.
    // This prevents errors and ensures predictable behavior for edge cases.
    if (typeof currentTextSegment !== 'string' || currentTextSegment.length === 0) {
        return currentTextSegment; // Return as is if invalid or empty.
    }

    // Split the segment into an array of individual words (tokens) based on spaces.
    const wordTokens = currentTextSegment.split(' ');

    // Use a traditional loop to iterate and modify tokens.
    // This approach is an alternative to chaining `map` and `join`,
    // providing explicit control over the transformation process.
    const modifiedTokensArray = [];
    for (let i = 0; i < wordTokens.length; i++) {
        const currentToken = wordTokens[i];
        // Check if the current token matches the target word.
        if (currentToken === searchFor) {
            modifiedTokensArray.push(replaceWith); // Substitute the word.
        } else {
            modifiedTokensArray.push(currentToken); // Keep the original word.
        }
    }

    // Join the modified tokens back into a single string, separated by spaces.
    return modifiedTokensArray.join(' ');
}


// --- Main Processing Loop ---
// Iterate over each line obtained from the input.
// Using 'for...of' is a modern and clean way to iterate over iterable objects like arrays,
// replacing the less explicit `while (variable = array.shift())` pattern.
for (const currentInputLine of inputContentLines) {
    // Increment the line counter for each line processed.
    processedLinesCount++;

    // Apply the transformation logic to the current line using the helper function.
    // The result is stored in an intermediate variable before being logged.
    const transformedLineOutput = transformTextSegment(
        currentInputLine,
        TARGET_IDENTIFIER,
        REPLACEMENT_IDENTIFIER
    );

    // Output the transformed line to the console.
    // This is the final step for each processed line, mimicking the original behavior.
    console.log(transformedLineOutput);
}

// End of script execution.