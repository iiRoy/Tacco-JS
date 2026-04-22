/*
 * This script processes input from standard input, treating each non-empty line
 * as a separate entry to be displayed with a sequential case number.
 * It demonstrates reading file content, basic string manipulation, and iteration.
 */

// Import the Node.js file system module for synchronous file operations.
const fileSystemModule = require('fs');

// Define the standard input path.
const standardInputPath = '/dev/stdin';

// Variable to hold the raw content read from stdin.
let rawInputContent = '';

try {
    // Attempt to synchronously read the entire content of standard input as UTF-8.
    rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
    // If an error occurs during file reading, log it and exit.
    console.error(`Error encountered while accessing input stream: ${readError.message}`);
    // A more robust application might throw or handle differently.
    process.exit(1);
}

// Check if any significant content was read.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.warn('No discernible content found in the standard input stream. Exiting.');
    // No further processing needed if input is empty.
    return;
}

// Split the raw content into an array of individual lines.
// Then, filter out any lines that are empty or consist only of whitespace,
// ensuring only meaningful data is processed.
const individualDataLines = rawInputContent
    .split('\n')
    .map(line => line.trim()) // Trim whitespace from each line
    .filter(trimmedLine => trimmedLine.length > 0); // Keep only non-empty lines

// If after filtering, no valid lines remain, inform the user.
if (individualDataLines.length === 0) {
    console.info('Input stream contained only empty or whitespace-only lines. No data to process.');
    return;
}

// Helper function to format the output string for each case.
const formatOutputString = (sequenceNumber, contentValue) => {
    // Using template literals for clear string construction.
    return `Entry #${sequenceNumber}: ${contentValue}`;
};

// Iterate over the array of processed lines using a modern for...of loop.
// The .entries() method provides both the index and the value for each element.
for (const [lineIdx, currentLineText] of individualDataLines.entries()) {
    // Calculate the human-readable case number (1-based index).
    const currentCaseNumber = lineIdx + 1;

    // Output the formatted string to the console.
    console.log(formatOutputString(currentCaseNumber, currentLineText));
}

// Provide a concluding message to indicate completion.
console.info(`\nSuccessfully processed ${individualDataLines.length} valid entries.`);