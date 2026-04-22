'use strict';

/**
 * Helper function to safely convert a string value into an integer.
 * It handles potential non-numeric inputs by returning null.
 * @param {string} textualRepresentation - The string to be converted.
 * @returns {number | null} The parsed integer, or null if parsing fails.
 */
const convertToValidInteger = (textualRepresentation) => {
    // Remove leading/trailing whitespace to ensure accurate parsing.
    const cleanedString = textualRepresentation.trim();

    // If the string is empty after trimming, it's not a valid number.
    if (cleanedString === '') {
        return null;
    }

    // Attempt to parse the string into a number.
    const numericalValue = Number(cleanedString);

    // Check if the result is a valid, finite number.
    // isNaN checks for 'Not a Number', isFinite checks for Infinity/-Infinity.
    if (!isNaN(numericalValue) && isFinite(numericalValue)) {
        // Return the integer part, as the original problem deals with integers.
        return Math.floor(numericalValue);
    }
    // If parsing fails or the number is not finite, return null.
    return null;
};

/**
 * Orchestrates the core logic to process a multi-line textual dataset.
 * It identifies and counts the unique numerical entries,
 * specifically excluding the very first line of the input.
 * @param {string} incomingDataPayload - The raw string content received for processing.
 */
function processNumericalDataset(incomingDataPayload) {
    // Guard clause: Check if the input payload is empty or contains only whitespace.
    if (!incomingDataPayload || incomingDataPayload.trim().length === 0) {
        console.error("No discernible data provided for processing. Exiting.");
        console.info(0); // Output 0 as no unique elements were found.
        return;
    }

    // Split the entire payload into individual lines based on newline characters.
    // Filter out any lines that are empty or consist solely of whitespace,
    // as these typically do not represent valid data entries.
    const allContentLines = incomingDataPayload.split('\n').filter(line => line.trim().length > 0);

    // After filtering, if there are no lines or only the initial (to be ignored) line,
    // then there's no actual data to process for uniqueness.
    if (allContentLines.length <= 1) {
        console.warn("Insufficient data lines after initial filtering. Expecting at least two lines (one header, one data).");
        console.info(0); // No unique numerical data found.
        return;
    }

    // The problem statement implies the first line is metadata (e.g., a count)
    // and should not be included in the set of numbers to be analyzed.
    // We use slice(1) to get all lines starting from the second one.
    const relevantDataLines = allContentLines.slice(1);

    // Map each relevant data line through our safe integer conversion function.
    // Then, filter out any results that are null, meaning they failed to parse into a valid integer.
    const extractedIntegers = relevantDataLines
        .map(convertToValidInteger)
        .filter(item => item !== null); // Keep only successfully parsed numbers.

    // If, after parsing and filtering, no valid integers remain.
    if (extractedIntegers.length === 0) {
        console.warn("No valid numerical entries could be extracted from the provided data lines.");
        console.info(0); // Report zero distinct items.
        return;
    }

    // Create a Set object from the array of extracted integers.
    // A Set automatically stores only unique values, effectively removing duplicates.
    const uniqueNumericalElements = new Set(extractedIntegers);

    // The 'size' property of the Set directly provides the count of distinct elements.
    const totalDistinctCount = uniqueNumericalElements.size;

    // Output the final computed count of distinct numerical elements.
    console.info(totalDistinctCount);
}

// Retrieve the Node.js 'fs' (file system) module for input/output operations.
const fileSystemAccessor = require('fs');
// Define the standard path from which input is typically read in competitive programming contexts.
const standardInputFile = '/dev/stdin';

try {
    // Synchronously read the entire content of the standard input file.
    // Specify 'utf8' encoding to correctly interpret the text data.
    const rawInputContent = fileSystemAccessor.readFileSync(standardInputFile, 'utf8');
    
    // Invoke the primary data processing function with the content read from stdin.
    processNumericalDataset(rawInputContent);
} catch (operationalError) {
    // Catch and log any errors that occur during the file reading process.
    console.error(`An exception occurred while attempting to read input or process data: ${operationalError.message}`);
    // In a production environment, one might also exit the process with an error code here.
    // process.exit(1);
}