'use strict';

/**
 * A utility function to safely parse a string into an integer.
 * It handles potential non-numeric inputs by returning NaN.
 * @param {string} textValue The string to attempt parsing.
 * @returns {number} The parsed integer or NaN if parsing fails.
 */
const tryParseInteger = (textValue) => {
    // Trim whitespace from the input string to ensure robust parsing.
    const cleanedValue = String(textValue).trim();
    // If the cleaned string is empty, it cannot be parsed as a number.
    if (!cleanedValue) {
        return Number.NaN;
    }
    // Attempt to parse the integer using a specified radix (base 10 for decimal).
    const parsedNumber = parseInt(cleanedValue, 10);
    // Return the parsed number; if it's not a number, parseInt already returns NaN.
    return parsedNumber;
};

/**
 * Displays the processed array of numeric items in a structured format.
 * @param {Array<number>} itemsCollection The array of numbers to display.
 */
const displayProcessedResults = (itemsCollection) => {
    console.info('--- Processing Summary ---');
    if (!itemsCollection || itemsCollection.length === 0) {
        console.warn('No numeric data points to display.');
        return;
    }

    console.log(`Successfully processed ${itemsCollection.length} numeric data points.`);
    itemsCollection.forEach((value, index) => {
        console.log(`[Item ${index + 1}]: ${value}`);
    });
    console.info('--- End of Summary ---');
};

/**
 * Main entry point for processing raw input stream data.
 * This function parses a multi-line string, extracts numeric values,
 * and then displays them.
 * @param {string} rawTextContent The entire input as a single string.
 */
function processDataStream(rawTextContent) {
    // Define a constant for the newline character, enhancing readability.
    const LINE_DELIMITER = '\n';

    // Validate input content. An empty or non-string input is not processable.
    if (typeof rawTextContent !== 'string' || rawTextContent.trim().length === 0) {
        console.error('Error: Input data stream is empty or invalid.');
        return;
    }

    // Split the raw content into individual lines.
    // Filter out any lines that are empty or contain only whitespace.
    const preliminaryLines = rawTextContent
        .split(LINE_DELIMITER)
        .filter(line => line.trim() !== '');

    // If, after filtering, there are no valid lines, terminate processing.
    if (preliminaryLines.length === 0) {
        console.warn('No meaningful lines found in the input after initial parsing.');
        return;
    }

    // The first line typically contains metadata, e.g., the count of subsequent items.
    // We remove it from the array and parse it.
    const expectedItemCountString = preliminaryLines.shift();
    const expectedItemCount = tryParseInteger(expectedItemCountString);

    // Validate the parsed count. If it's not a valid number, it's an input format issue.
    if (isNaN(expectedItemCount)) {
        console.error(`Error: Invalid expected item count specified: "${expectedItemCountString}".`);
        return;
    }
    // Optional: Log the expected count, though not strictly used for current output.
    // console.log(`Anticipating ${expectedItemCount} data entries.`);

    // Map the remaining lines to an array of numbers.
    // We use the tryParseInteger helper for robustness.
    const parsedNumericItems = preliminaryLines
        .map(lineString => tryParseInteger(lineString))
        .filter(value => !isNaN(value)); // Filter out any lines that couldn't be parsed into valid numbers.

    // Display the final collection of valid numeric data points.
    displayProcessedResults(parsedNumericItems);
}

// --- Execution Start ---
// This block handles reading input from standard input and invoking the processing function.
try {
    // Attempt to read the entire content of the standard input file synchronously.
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Pass the read content to our main processing function.
    processDataStream(fileContent);
} catch (errorDetails) {
    // Catch and log any errors that occur during file reading or initial processing.
    console.error('An unexpected error occurred during input acquisition or initial processing:', errorDetails.message);
    // For debugging, you might want to log the full error stack.
    // console.error(errorDetails.stack);
}
// --- Execution End ---