'use strict'; // Enforce strict mode for modern JavaScript practices

/**
 * Core function to process raw textual input and compute the numerical range.
 * It expects a sequence of space-separated integers on the second line of the input.
 *
 * @param {string} rawTextContent - The complete input data as a single string,
 *                                  typically read from a file or standard input.
 */
const processInputData = (rawTextContent) => {
    // A variable to store the final calculated range (difference between max and min).
    let computedNumericalRange = 0;

    // Step 1: Divide the entire input string into an array of individual lines.
    // This allows for easier access to specific lines of data.
    const allInputLines = rawTextContent.split('\n');

    // --- Validation / Guard Clause: Ensure sufficient input lines ---
    // The problem implies data is on the second line, so at least two lines are needed.
    if (allInputLines.length < 2) {
        console.error("Data Processing Error: Insufficient lines in input. Expected at least two lines.");
        return; // Terminate execution if input format is incorrect.
    }

    // Step 2: Extract the specific line that contains the numeric data.
    // The problem specifies the numbers are on the second line (index 1).
    // .trim() is used to remove leading/trailing whitespace from the line.
    const targetDataLine = allInputLines[1].trim();

    // --- Validation / Guard Clause: Check if the data line itself is empty ---
    if (targetDataLine.length === 0) {
        console.error("Data Processing Error: The designated data line (second line) is empty.");
        return; // Terminate if no data is present on the expected line.
    }

    // Step 3: Split the data line into an array of string tokens, using space as a delimiter.
    const stringValueTokens = targetDataLine.split(' ');

    // An array to hold the successfully parsed numerical values.
    const collectedNumericValues = [];

    // Step 4: Iterate through each string token and convert it into a number.
    // Using the Number() constructor for type conversion, an alternative to parseInt().
    for (const currentToken of stringValueTokens) {
        const convertedNumber = Number(currentToken);

        // --- Validation: Ensure the conversion resulted in a valid number ---
        // Only push valid numbers to our collection, ignoring any non-numeric tokens.
        if (!isNaN(convertedNumber)) {
            collectedNumericValues.push(convertedNumber);
        }
        // Optional: Add a warning for skipped non-numeric tokens.
        // else { console.warn(`Skipped non-numeric token: '${currentToken}'`); }
    }

    // --- Validation / Guard Clause: Check if enough numbers were successfully parsed ---
    // A range (max - min) requires at least two distinct numerical values.
    if (collectedNumericValues.length < 2) {
        console.error("Data Processing Error: Not enough valid numbers found to compute a range (need at least two).");
        return; // Terminate if not enough numbers for calculation.
    }

    // Step 5: Sort the array of numbers in ascending order.
    // The custom comparator (valA, valB) => valA - valB ensures numerical sorting.
    collectedNumericValues.sort((firstElement, secondElement) => {
        return firstElement - secondElement;
    });

    // Step 6: Determine the count of numbers in the sorted collection.
    const totalElementCount = collectedNumericValues.length;

    // Step 7: Identify the minimum and maximum values from the sorted array.
    // The first element is the minimum.
    const minimumObservedValue = collectedNumericValues[0];
    // The last element (at index totalElementCount - 1) is the maximum.
    const maximumObservedValue = collectedNumericValues[totalElementCount - 1];

    // Step 8: Calculate the difference between the maximum and minimum values.
    computedNumericalRange = maximumObservedValue - minimumObservedValue;

    // Step 9: Output the final computed range to the console.
    // Using a template literal for a more descriptive output message.
    console.log(`The calculated numerical range (max - min) is: ${computedNumericalRange}`);
};

// --- Execution Entry Point ---
// This block handles reading input from the standard input stream (/dev/stdin)
// and initiating the data processing.
try {
    // Read the entire content from the standard input file.
    // 'utf-8' specifies the character encoding for the input.
    const fileContentFromStdin = require('fs').readFileSync('/dev/stdin', 'utf-8');

    // Call the main processing function with the content read from stdin.
    processInputData(fileContentFromStdin);
} catch (errorDuringRead) {
    // If any error occurs during the file reading process (e.g., file not found, permissions),
    // log an informative error message to the console.
    console.error("System Input Error: Failed to read data from standard input. Details:", errorDuringRead.message);
}