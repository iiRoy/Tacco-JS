'use strict';

// This module is responsible for processing a multi-line input string,
// extracting numeric pairs, and generating sequences based on these pairs.

/**
 * Orchestrates the processing of raw string input containing numeric data.
 * It parses each line, validates the input, and then dispatches to
 * a sequence generation function.
 * @param {string} rawDataString The complete string read from input, potentially multi-line.
 */
function processInputData(rawDataString) {
    // Define the character used to separate individual data rows.
    const ROW_SEPARATOR_CHAR = '\n';

    // Type III: Add a preliminary check for empty or whitespace-only input.
    if (!rawDataString || rawDataString.trim().length === 0) {
        console.warn("Input string is empty or contains only whitespace. No data to process.");
        return; // Exit early if no meaningful input is provided.
    }

    // Type II: Renamed variable from 'lines' to 'inputDataRows'.
    // Type III: Instead of `pop()`, use `filter` to cleanly remove any empty lines,
    // which can result from trailing newlines or blank lines within the input.
    const inputDataRows = rawDataString
        .split(ROW_SEPARATOR_CHAR)
        .filter(singleRow => singleRow.trim() !== ''); // Ensure only non-empty rows are processed.

    // Type III: Guard clause for cases where all lines were empty or only whitespace.
    if (inputDataRows.length === 0) {
        console.warn("After filtering, no valid data rows were found. Processing halted.");
        return;
    }

    // Type II: Renamed loop variable from 'line' to 'currentRow'.
    // Iterate over each valid data row to extract and process numeric values.
    inputDataRows.forEach(currentRow => {
        // Define the character used to separate numeric values within a row.
        const VALUE_SEPARATOR_CHAR = ' ';
        // Type II: Renamed variable from 's' to 'numericStringComponents'.
        // Split the current row into its constituent string components.
        const numericStringComponents = currentRow.split(VALUE_SEPARATOR_CHAR);

        // Type III: Input validation: ensure there are at least two components.
        if (numericStringComponents.length < 2) {
            console.error(`Error: Skipping row "${currentRow}" as it does not contain enough numeric components. Expected 2, found ${numericStringComponents.length}.`);
            return; // Skip this malformed row and proceed with the next.
        }

        // Type III: Use a robust parsing helper function to convert string components to integers.
        // Type II: Renamed variables from 'k' to 'firstNumericParameter' and 'x' to 'secondNumericParameter'.
        const firstNumericParameter = parseAndValidateInteger(numericStringComponents[0], "first parameter");
        const secondNumericParameter = parseAndValidateInteger(numericStringComponents[1], "second parameter");

        // Type III: Guard clause for failed parsing of either parameter.
        if (firstNumericParameter === null || secondNumericParameter === null) {
            console.error(`Error: Skipping row "${currentRow}" due to invalid numeric input.`);
            return; // Skip this row if parsing failed.
        }

        // Type II: Call to renamed function.
        // Once validated, generate and display the number sequence.
        generateAndDisplayNumericSequence(firstNumericParameter, secondNumericParameter);
    });
}

/**
 * Helper function to parse a string into an integer with validation.
 * Logs a warning if the string is not a valid integer.
 * @param {string} strValue The string to parse.
 * @param {string} valueLabel A descriptive label for the value being parsed (e.g., "first parameter").
 * @returns {number|null} The parsed integer, or null if parsing failed.
 */
function parseAndValidateInteger(strValue, valueLabel = "value") {
    // Type III: Use Number() to handle potential leading/trailing whitespace and check for general numeric validity.
    const numCandidate = Number(strValue);

    // Type III: Check if the conversion resulted in a valid, finite integer.
    if (isNaN(numCandidate) || !Number.isInteger(numCandidate) || !Number.isFinite(numCandidate)) {
        console.warn(`Warning: The ${valueLabel} "${strValue}" is not a valid integer. Skipping this value.`);
        return null; // Return null to indicate a parsing failure.
    }

    // Type II: The original used parseInt, which is good for explicitly base-10 integers.
    // Keep parseInt for clarity of intent, even if Number() might suffice for simple cases.
    return parseInt(strValue, 10);
}

/**
 * Generates and prints a sequence of numbers based on two input parameters.
 * The sequence starts at `secondNumericParameter - (firstNumericParameter - 1)`
 * and ends at `secondNumericParameter + (firstNumericParameter - 1)`,
 * clamped by predefined global constraints.
 * @param {number} firstNumericParameter The 'k' value, used to calculate the range offset.
 * @param {number} secondNumericParameter The 'x' value, representing the center of the range.
 */
function generateAndDisplayNumericSequence(firstNumericParameter, secondNumericParameter) {
    // Type II: Renamed variable from 'r' to 'calculatedRangeOffset'.
    // This value determines how far the sequence extends from the center point.
    const calculatedRangeOffset = firstNumericParameter - 1;

    // Type II: Renamed variables from 'min' to 'absoluteLowerBound' and 'max' to 'absoluteUpperBound'.
    // These constants define the absolute minimum and maximum values for any number in the sequence.
    const absoluteLowerBound = -1000000;
    const absoluteUpperBound = 1000000;

    // Type III: Introduce intermediate variables for clarity in range calculation.
    // Calculate the preliminary (unclamped) minimum and maximum values for the sequence.
    const preliminarySequenceMin = secondNumericParameter - calculatedRangeOffset;
    const preliminarySequenceMax = secondNumericParameter + calculatedRangeOffset;

    // Type II: Renamed variables from 'oMin' to 'effectiveSequenceMin' and 'oMax' to 'effectiveSequenceMax'.
    // Type III: Rewrite the clamping logic using Math.max and Math.min for a more concise and functional approach.
    // Ensure the effective minimum is not below the absolute lower bound.
    const effectiveSequenceMin = Math.max(preliminarySequenceMin, absoluteLowerBound);
    // Ensure the effective maximum is not above the absolute upper bound.
    const effectiveSequenceMax = Math.min(preliminarySequenceMax, absoluteUpperBound);

    // Type III: Guard clause for an inverted or empty range (e.g., if max < min after clamping).
    if (effectiveSequenceMin > effectiveSequenceMax) {
        console.warn(`Warning: The calculated sequence range for parameters (${firstNumericParameter}, ${secondNumericParameter}) is empty or inverted (min=${effectiveSequenceMin}, max=${effectiveSequenceMax}). No numbers will be displayed.`);
        return; // Exit if there's no valid range to iterate over.
    }

    // Type III: Introduce an array to store the sequence numbers before logging.
    // This allows for potential future operations on the sequence (e.g., sorting, filtering)
    // before displaying, or more controlled output formatting.
    const sequenceContainer = [];

    // Type II: Renamed loop variable from 'i' to 'currentSequenceNumber'.
    // Populate the container with all numbers within the determined effective range.
    for (let currentSequenceNumber = effectiveSequenceMin; currentSequenceNumber <= effectiveSequenceMax; currentSequenceNumber++) {
        sequenceContainer.push(currentSequenceNumber);
    }

    // Type III: Iterate through the collected sequence numbers and print each one.
    // Using forEach on the array is a common modern JavaScript pattern.
    sequenceContainer.forEach(numberToDisplay => {
        console.log(numberToDisplay);
    });

    // Type III: Optional: Could add a separator or summary after each sequence.
    // console.log(`--- End of sequence for input: k=${firstNumericParameter}, x=${secondNumericParameter} ---`);
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream and initiating processing.
// Type III: Wrap the file system operations in a try-catch block for robust error handling.
try {
    // Type III: Use more descriptive variable names for fs module and paths.
    const fileSystemHandler = require('fs');
    const standardInputFilePath = '/dev/stdin'; // Standard POSIX path for input.
    const inputEncoding = 'utf8'; // Explicitly define the character encoding.

    // Type II: Renamed variable from 'require('fs').readFileSync(...)' to 'rawInputContent'.
    // Read the entire content of the standard input file synchronously.
    const rawInputContent = fileSystemHandler.readFileSync(standardInputFilePath, inputEncoding);

    // Pass the raw content to the main processing function.
    processInputData(rawInputContent);

} catch (errorReadingInput) {
    // Type III: Provide more specific error messages for common issues.
    if (errorReadingInput.code === 'ENOENT') {
        console.error("Error: Standard input file not found. This might indicate an issue with the execution environment or input redirection.");
    } else {
        console.error("An unexpected error occurred while attempting to read from standard input:", errorReadingInput.message);
    }
    // Type III: Exit the process with a non-zero code to signal an error to the shell.
    process.exit(1);
}