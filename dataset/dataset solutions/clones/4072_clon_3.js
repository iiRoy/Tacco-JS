const fileSystemUtility = require('fs'); // Renamed 'fs' to 'fileSystemUtility' for clarity.

/**
 * Reads raw string data from a specified file path.
 * This function handles potential errors during file access, providing robustness.
 *
 * @param {string} sourcePath The absolute or relative path to the input file.
 * @returns {string | null} The content of the file as a string (UTF-8 encoded), or null if any error occurs.
 */
function retrieveInputContent(sourcePath) {
    try {
        // Attempt to synchronously read the file content.
        // Using 'utf8' encoding ensures the data is returned as a string.
        const fileContentBuffer = fileSystemUtility.readFileSync(sourcePath, 'utf8');
        // If reading is successful, return the content.
        return fileContentBuffer;
    } catch (readError) {
        // Log any exceptions that occur during the file reading process.
        // This includes file not found, permission issues, etc.
        console.error(`An error occurred while attempting to read the source file: ${readError.message}`);
        // Return null to indicate that the operation failed.
        return null;
    }
}

/**
 * Transforms a raw string into a base-10 integer, after removing all whitespace.
 * Includes validation to ensure the string can be meaningfully converted to a number.
 *
 * @param {string} rawStringInput The string representation that needs to be parsed.
 * @returns {number | null} The successfully parsed integer, or null if parsing fails or input is invalid.
 */
function processStringForInteger(rawStringInput) {
    // Validate that the input is indeed a string and not empty after trimming.
    if (typeof rawStringInput !== 'string' || rawStringInput.trim().length === 0) {
        console.warn('Received invalid or empty string for integer processing.');
        return null; // Indicate failure due to invalid input type or content.
    }

    // A Type III change: Use a more comprehensive regex to remove ALL whitespace characters
    // (spaces, tabs, newlines, etc.) instead of just a single space.
    const cleanedStringRepresentation = rawStringInput.replace(/\s/g, '');

    // Define the numerical base (radix) for parsing. Base 10 for decimal numbers.
    const numericalBase = 10;
    // Attempt to convert the cleaned string into an integer.
    const resultingNumericValue = parseInt(cleanedStringRepresentation, numericalBase);

    // Check if the result of parseInt is Not-a-Number (NaN), which indicates a parsing failure.
    if (isNaN(resultingNumericValue)) {
        console.warn(`Failed to convert "${rawStringInput}" into a valid integer.`);
        return null; // Indicate parsing failure.
    }

    // Return the successfully processed integer.
    return resultingNumericValue;
}

/**
 * Determines if a given non-negative number is a perfect square.
 * This involves calculating its square root and then checking if the root is an integer.
 *
 * @param {number} candidateForCheck The number to be evaluated.
 * @returns {boolean} True if the number is a perfect square, false otherwise.
 */
function ascertainPerfectSquareStatus(candidateForCheck) {
    // Perform initial validation: The number must be a finite, non-negative number.
    if (typeof candidateForCheck !== 'number' || !Number.isFinite(candidateForCheck) || candidateForCheck < 0) {
        console.warn('Invalid or negative numeric value provided for perfect square determination.');
        return false; // Negative numbers or non-numbers cannot be perfect squares in this context.
    }

    // Calculate the square root of the candidate number.
    const computedRoot = Math.sqrt(candidateForCheck);

    // Type III change: Use an alternative, equivalent method to check if a number is an integer.
    // If the remainder when divided by 1 is 0, the number has no fractional part, meaning it's an integer.
    const isRootAnIntegralValue = (computedRoot % 1 === 0);

    // Return the boolean result of the check.
    return isRootAnIntegralValue;
}

/**
 * The main execution flow for checking if an input number is a perfect square.
 * Orchestrates reading input, processing it, and outputting the result.
 */
function executeSquareRootAnalysis() {
    // Define the standard input file path, common in competitive programming environments.
    const standardInputDevicePath = '/dev/stdin';

    // Step 1: Retrieve the raw string data from the specified input source.
    const rawInputBuffer = retrieveInputContent(standardInputDevicePath);

    // Type III addition: Guard clause to handle cases where input data could not be read.
    if (rawInputBuffer === null) {
        console.log('Input data acquisition failed. Aborting analysis.');
        return; // Exit the function if no data is available.
    }

    // Step 2: Convert the raw string data into a clean, valid integer.
    const evaluatedNumericTerm = processStringForInteger(rawInputBuffer);

    // Type III addition: Guard clause to validate the parsed numeric value.
    // It must be a valid number and non-negative for a real perfect square check.
    if (evaluatedNumericTerm === null || evaluatedNumericTerm < 0) {
        console.log('Processed input is not a valid non-negative integer. Cannot proceed with perfect square check.');
        return; // Exit if the number is invalid or negative.
    }

    // Step 3: Determine if the processed number is a perfect square.
    const isResultAPerfectSquare = ascertainPerfectSquareStatus(evaluatedNumericTerm);

    // Step 4: Output the final determination to the console.
    // Type III change: Replaced the ternary operator with a more verbose if-else statement.
    if (isResultAPerfectSquare) {
        console.log('Yes'); // The number is a perfect square.
    } else {
        console.log('No');  // The number is not a perfect square.
    }
}

// Initiate the entire analysis process.
// This is the entry point for the script's execution.
executeSquareRootAnalysis();