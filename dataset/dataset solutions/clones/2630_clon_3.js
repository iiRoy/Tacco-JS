function processInputData(rawSourceData) {
    // This function calculates the equivalent resistance of parallel resistors,
    // or more generally, the reciprocal of the sum of reciprocals of input values.

    // --- Type III: Added input validation and guard clauses ---
    if (typeof rawSourceData !== 'string' || rawSourceData.trim().length === 0) {
        console.error("Error: Provided input data is either not a string or is empty. Cannot proceed.");
        return; // Exit early due to invalid input
    }

    // Split the entire input string into individual lines.
    const allInputLines = rawSourceData.trim().split('\n');

    // We expect at least two lines: one for the count (though unused by original logic) and one for values.
    if (allInputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines of data.");
        return; // Exit early
    }

    // The first line typically contains the count of elements (N), but the original logic ignores it.
    // We can parse it for potential validation, even if not strictly used in the core calculation.
    const countString = allInputLines[0];
    const expectedCount = parseInt(countString, 10);

    // --- Type II: Renamed variables and added comments ---
    // Extract the line containing the space-separated numeric representations.
    const dataValueLine = allInputLines[1];

    // Split the data line into an array of string-based numeric tokens.
    const rawNumberTokens = dataValueLine.split(' ');

    // --- Type III: Added helper function for parsing and validation ---
    /**
     * Parses a string into a floating-point number, with validation.
     * Skips invalid, non-finite, or non-positive numbers as they are problematic for reciprocals.
     * @param {string} strValue - The string to parse.
     * @returns {number|null} The parsed number, or null if invalid.
     */
    const safeParseAndValidateFloat = (strValue) => {
        const parsedNumber = parseFloat(strValue.trim()); // Use parseFloat and trim for robustness

        if (isNaN(parsedNumber) || !isFinite(parsedNumber) || parsedNumber <= 0) {
            // Log a warning for non-essential issues, but don't halt execution.
            console.warn(`Warning: Encountered an invalid, non-finite, or non-positive value '${strValue}'. This value will be skipped.`);
            return null; // Indicate that this value should be ignored.
        }
        return parsedNumber;
    };

    // --- Type II: Applied data type change (Number -> parseFloat implicitly via helper) ---
    // Process each string token: parse it to a number and filter out any invalid entries.
    const validNumericElements = rawNumberTokens
        .map(safeParseAndValidateFloat) // Transform strings to numbers (or null)
        .filter(element => element !== null); // Remove nulls (invalid entries)

    // --- Type III: Added more validation logic ---
    if (validNumericElements.length === 0) {
        console.error("Error: No valid numeric elements were found in the input for calculation.");
        return;
    }

    // Optional: Compare parsed count with actual valid elements found.
    if (!isNaN(expectedCount) && expectedCount > 0 && validNumericElements.length !== expectedCount) {
        console.warn(`Warning: Expected ${expectedCount} elements based on the first line, but found ${validNumericElements.length} valid numbers.`);
    }

    // --- Type II: Renamed accumulator variable ---
    // Initialize an accumulator for the sum of the reciprocals of the numbers.
    let inverseSumAccumulator = 0.0; // Using a float for explicit precision.

    // --- Type III: Added a helper function for clarity ---
    /**
     * Calculates the reciprocal of a given number.
     * @param {number} num - The number to get the reciprocal of.
     * @returns {number} The reciprocal.
     */
    const computeReciprocal = (num) => 1.0 / num;

    // --- Type II: Renamed loop variable ---
    // Iterate through the array of validated numeric elements.
    for (const currentElement of validNumericElements) {
        // Add the reciprocal of the current element to the accumulator.
        // The currentElement is guaranteed to be a positive finite number due to prior filtering.
        const elementReciprocal = computeReciprocal(currentElement);
        inverseSumAccumulator += elementReciprocal;
    }

    // --- Type III: Added guard for division by zero in final calculation ---
    if (inverseSumAccumulator === 0) {
        console.error("Error: The sum of reciprocals is zero. Cannot compute the final equivalent value (division by zero error).");
        return;
    }

    // Calculate the final result: the reciprocal of the accumulated sum of reciprocals.
    const finalCalculatedResult = 1.0 / inverseSumAccumulator;

    // --- Type II: Changed output method ---
    // Output the computed result to the console using a different logging level.
    console.info("The computed equivalent value is:", finalCalculatedResult);
}

// --- Type III: Encapsulated file reading, added constant, and error handling ---
// Define a constant for the standard input file path for better maintainability.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

// Main execution block to read from standard input and process data.
try {
    // Use the 'fs' module to read the file synchronously.
    // Ensure UTF-8 encoding and trim any leading/trailing whitespace from the file content.
    const inputContentFromFile = require("fs").readFileSync(STANDARD_INPUT_FILE_PATH, "utf8").trim();

    // Invoke the main processing function with the content read from the file.
    processInputData(inputContentFromFile);
} catch (ioError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error(`An error occurred while reading or processing input from '${STANDARD_INPUT_FILE_PATH}':`, ioError.message);
    // Terminate the process with an error code to indicate failure.
    process.exit(1);
}