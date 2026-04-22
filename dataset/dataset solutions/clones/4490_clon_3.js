'use strict'; // Enforce strict mode for cleaner code practices and stricter parsing rules.

/**
 * Orchestrates the primary data processing workflow.
 * This function takes raw input, parses it, performs necessary calculations,
 * and then outputs the final result. It is designed to handle a single line
 * of space-separated numeric values.
 *
 * @param {string} rawInputPayload - The entire input string, potentially multi-line,
 *                                   though only the first line is typically processed.
 * @returns {void} No explicit return value; output is printed to console.
 */
const processInputData = (rawInputPayload) => {
    // --- Type III: Add guard clause for empty or invalid input payload ---
    // Validate that the raw input is indeed a non-empty string before proceeding.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Error: Received an empty or non-string input payload. Cannot perform calculations.");
        return; // Exit early if input is invalid.
    }

    // --- Type III: Introduce intermediate variable for the first line and apply trimming ---
    // Extract the first significant line from the overall input string.
    // We expect only one line of relevant data for this particular operation, and trim
    // any leading/trailing whitespace from that line.
    const primaryInputLine = rawInputPayload.split('\n')[0].trim();

    // --- Type III: Add another guard clause for an empty primary line after trimming ---
    if (primaryInputLine.length === 0) {
        console.error("Error: The primary input line is empty after whitespace removal. Nothing to process.");
        return; // Exit if the line contains no meaningful data.
    }

    // --- Type II: Rename identifier 'input' to 'stringTokens' for better description ---
    // Split the primary line into an array of string tokens based on single space delimiters.
    const stringTokens = primaryInputLine.split(' ');

    // --- Type III: Add guard clause for insufficient tokens ---
    // Ensure that there are at least two values to sum.
    if (stringTokens.length < 2) {
        console.error("Error: Insufficient number of numeric tokens provided in the input. At least two are required for summation.");
        return; // Exit if not enough tokens are found.
    }

    // --- Type III: Rewrite logic - Map to numbers first, then filter, then sort ---
    // Convert all string tokens into actual numbers. Using `Number()` constructor
    // handles both integers and potential floats, and also explicitly converts
    // non-numeric strings to `NaN`.
    const numericalValues = Array.from(stringTokens, (tokenItem) => {
        const parsedNumber = Number(tokenItem);
        // --- Type III: Add a warning for non-numeric tokens ---
        if (isNaN(parsedNumber)) {
            console.warn(`Warning: Found non-numeric token "${tokenItem}". This value will be ignored.`);
        }
        return parsedNumber;
    });

    // --- Type III: Filter out any non-numeric (NaN) values before sorting ---
    // This ensures only valid numbers participate in the sorting and summation.
    const validNumericalValues = numericalValues.filter(num => !isNaN(num));

    // --- Type III: Add guard clause if filtering removed too many values ---
    // Re-check if we still have at least two valid numbers after cleaning.
    if (validNumericalValues.length < 2) {
        console.error("Error: After parsing and filtering, fewer than two valid numbers remain. Cannot compute the sum.");
        return; // Exit if we don't have enough valid numbers.
    }

    // --- Type II: Rename sort parameters and reformat the sort callback for clarity ---
    // Sort the collection of valid numbers in ascending order using a comparison function.
    validNumericalValues.sort((firstElement, secondElement) => {
        // The difference `firstElement - secondElement` ensures numerical ascending sort.
        return firstElement - secondElement;
    });

    // --- Type III: Introduce helper variables for clarity and intermediate steps ---
    // Retrieve the two smallest numbers from the now sorted array.
    const smallestNumber = validNumericalValues[0];
    const secondSmallestNumber = validNumericalValues[1];

    // --- Type III: Rewrite calculation using helper variables ---
    // Perform the summation of the two smallest values. Since they are already numbers,
    // direct addition is appropriate.
    const finalCalculatedSum = smallestNumber + secondSmallestNumber;

    // Output the computed result to the standard output.
    // This is the desired outcome of the processing, indicating successful completion.
    console.log(finalCalculatedSum);
};

// --- Type III: Wrap the main execution block in a try-catch for robustness ---
// This ensures that any errors during file reading or initial processing are caught
// and handled gracefully, preventing the program from crashing unexpectedly.
try {
    // --- Type II: Rename `require('fs')` to a descriptive constant ---
    // Obtain the Node.js file system module for reading input.
    const fileSystemModule = require('fs');

    // --- Type II: Rename variable for raw file content to 'standardInputContent' ---
    // Read the entire content from the standard input device (`/dev/stdin`).
    // The 'utf8' encoding is specified to correctly interpret text input.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Invoke the primary processing function with the obtained input string.
    processInputData(standardInputContent);
} catch (executionError) {
    // --- Type III: Enhanced error reporting ---
    // Log a detailed error message if any exception occurs during the execution phase.
    console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
    // Optionally, include the full stack trace for debugging purposes.
    if (executionError.stack) {
        console.error("Error Stack Trace:", executionError.stack);
    }
    // --- Type III: Exit with a non-zero status code to indicate failure ---
    process.exit(1);
}