// This program processes specific tokens from standard input,
// counting occurrences of 'A', 'B', 'O', and other symbols.
// It's designed to read data from a standard input stream, split it into tokens,
// and then categorize and count specific types of these tokens.

// --- Configuration Constants ---
// Define a constant for the standard input file path.
const STDIN_SOURCE_PATH = "/dev/stdin";
// Define the character encoding to use when reading the file.
const FILE_ENCODING = "utf8";
// Define the newline character for output formatting.
const OUTPUT_LINE_BREAK = "\n";

// --- Data Storage for Categorized Counts ---
// Initialize counters for the distinct symbol types.
let countForSymbolA = 0;   // Accumulator for tokens identified as 'A'
let countForSymbolB = 0;    // Accumulator for tokens identified as 'B'
let countForSymbolO = 0;   // Accumulator for tokens identified as 'O'
let countForMiscellaneous = 0;  // Accumulator for any tokens not 'A', 'B', or 'O'

// --- Input Acquisition and Initial Processing ---
let rawInputContent = '';
try {
    // Attempt to read all content from the designated standard input path synchronously.
    // This operation is wrapped in a try-catch block to handle potential file system errors.
    const fileSystemHandler = require("fs");
    rawInputContent = fileSystemHandler.readFileSync(STDIN_SOURCE_PATH, FILE_ENCODING);
} catch (inputReadError) {
    // If an error occurs during input reading (e.g., file not found, permission issues),
    // log the error and terminate the process gracefully.
    console.error(`An error occurred while attempting to read from ${STDIN_SOURCE_PATH}: ${inputReadError.message}`);
    process.exit(1); // Indicate failure
}

// Split the raw input string into an array of individual tokens.
// The split operation uses a regular expression to recognize any whitespace character or a comma
// as a delimiter. This ensures that elements like "A B,C" become ["A", "B", "C"].
// Note: This split method can produce empty strings in the array if delimiters are adjacent (e.g., "A,,B" -> ["A", "", "B"]).
const parsedInputTokens = rawInputContent.split(/\s|,/);

// --- Pre-loop Validation (Guard Clause) ---
// If the input was effectively empty (no meaningful tokens after splitting),
// print all zeros and exit early to avoid unnecessary processing.
// This handles cases where input is "", " ", ",", etc., which might result in an array like [""] or [].
if (parsedInputTokens.length === 0 || (parsedInputTokens.length === 1 && parsedInputTokens[0].trim() === '')) {
    console.log(`0${OUTPUT_LINE_BREAK}0${OUTPUT_LINE_BREAK}0${OUTPUT_LINE_BREAK}0`);
    process.exit(0);
}

// --- Token Analysis and Counting Loop ---
// Iterate through the `parsedInputTokens` array.
// Crucially, this loop processes only *every second token*, starting from the element at index 1.
// This specific iteration pattern (index 1, 3, 5, ...) directly mimics the original code's `j+=2` logic.
for (let currentProcessingIndex = 1; currentProcessingIndex < parsedInputTokens.length; currentProcessingIndex += 2) {
    const activeTokenValue = parsedInputTokens[currentProcessingIndex];

    // --- Token Filtering (New Fragment) ---
    // If the token is empty or consists only of whitespace after trimming,
    // skip it and proceed to the next token. This is a refinement to ignore
    // artifacts from splitting (e.g., "" from "A,,B").
    if (!activeTokenValue || activeTokenValue.trim() === '') {
        continue;
    }

    // --- Categorization Logic (Rewritten) ---
    // Use a switch statement for clear, distinct categorization of tokens.
    // The token is trimmed to handle potential leading/trailing whitespace before comparison.
    switch (activeTokenValue.trim()) {
        case 'A':
            countForSymbolA++;
            break;
        case 'B':
            countForSymbolB++;
            break;
        case 'O':
            countForSymbolO++;
            break;
        default:
            // Any token that doesn't match 'A', 'B', or 'O' falls into the 'miscellaneous' category.
            countForMiscellaneous++;
            break;
    }
}

// --- Final Output Generation ---
// Construct the final output string using a template literal for improved readability.
// The counts are printed in the order: 'A', 'B', 'Miscellaneous', 'O', each on a new line.
// This output order precisely matches the original code's sequence.
const generatedReport = `${countForSymbolA}${OUTPUT_LINE_BREAK}` +
                        `${countForSymbolB}${OUTPUT_LINE_BREAK}` +
                        `${countForMiscellaneous}${OUTPUT_LINE_BREAK}` +
                        `${countForSymbolO}`;

// Print the final report to standard output.
console.log(generatedReport);

// Program execution concludes.