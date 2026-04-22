/**
 * This module provides a utility to process a string containing numerical data.
 * It's designed to parse space-separated integers from an input source,
 * perform a specific arithmetic operation (subtraction of the second from the first),
 * and output the result.
 */

/**
 * Processes a raw input string expected to contain numerical values.
 * This function extracts the first two valid integers, computes their difference,
 * and logs the result to the console. It includes robust error handling and validation.
 *
 * @param {string} sourceDataString - The raw string data, typically from a file or user input.
 * @returns {number | null} The calculated difference between the first two numbers,
 *                          or `null` if processing fails due to invalid input or insufficient data.
 */
const processNumericalData = (sourceDataString) => {
    // --- Phase 1: Input Validation and Sanitization ---
    // A crucial step to ensure the input is in an expected format.
    if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Data Processing Error: Provided input is not a valid string or is empty. Please provide numerical data.");
        return null; // Indicate a clear failure to process.
    }

    // Define constants for parsing operations to enhance maintainability.
    const TOKEN_SEPARATOR = ' '; // Character used to split the input string into individual number tokens.
    const PARSING_RADIX = 10;    // The base (radix) to use for integer parsing (e.g., 10 for decimal).
    const REQUIRED_OPERANDS = 2; // Minimum number of numeric operands needed for the calculation.

    // --- Phase 2: Tokenization and Conversion to Numbers ---
    // Break down the raw string into individual potential number tokens.
    // The `trim()` method is used to remove any leading or trailing whitespace.
    const stringTokens = sourceDataString.trim().split(TOKEN_SEPARATOR);

    // Initialize a collection to store successfully parsed numbers.
    let validNumericOperands = [];

    // Iterate over each token to parse it into an integer and validate.
    for (const currentToken of stringTokens) {
        // Skip any empty strings that might result from multiple separators.
        if (currentToken.length === 0) {
            continue;
        }

        // Attempt to convert the string token into an integer.
        const parsedNumber = parseInt(currentToken, PARSING_RADIX);

        // Check if the parsing was successful (i.e., not NaN - Not-a-Number).
        if (!Number.isNaN(parsedNumber)) {
            validNumericOperands.push(parsedNumber);
        } else {
            // Optionally, log a warning if a token couldn't be parsed, for debugging purposes.
            // console.warn(`Warning: Encountered non-numeric token '${currentToken}'. This will be skipped.`);
        }
    }

    // --- Phase 3: Data Availability Check ---
    // Ensure that we have enough valid numbers to perform the intended calculation.
    if (validNumericOperands.length < REQUIRED_OPERANDS) {
        console.error(`Data Processing Error: Not enough valid numbers found. Expected at least ${REQUIRED_OPERANDS}, but detected only ${validNumericOperands.length}.`);
        return null; // Return null if the necessary data is absent.
    }

    // Extract the primary and secondary operands for the calculation.
    // Using descriptive variable names improves code clarity.
    const primaryValue = validNumericOperands[0];
    const secondaryValue = validNumericOperands[1];

    // --- Phase 4: Core Calculation Logic ---
    // Define a dedicated helper function for the arithmetic operation.
    // This abstracts the calculation, making it potentially reusable or easier to change.
    const calculateDifferenceBetweenTwoValues = (valA, valB) => {
        // Returns the result of subtracting the second value from the first.
        return valA - valB;
    };

    // Perform the actual subtraction using the extracted operands.
    const finalCalculationResult = calculateDifferenceBetweenTwoValues(primaryValue, secondaryValue);

    // --- Phase 5: Output and Return ---
    // Output the computed result to the standard console.
    // The output is simple, matching the original intent.
    console.log(finalCalculationResult);

    // Return the result, allowing the calling context to potentially use it further.
    return finalCalculationResult;
};

// --- Main Execution Block ---
// This conditional block ensures that the code inside it only runs when the script
// is executed directly (e.g., `node script.js`), and not when it's imported as a module
// into another script. This is a common pattern in Node.js applications.
if (require.main === module) {
    // Define the standard input path for this environment.
    const SYSTEM_INPUT_PATH = "/dev/stdin";
    let systemInputContent = ''; // Variable to hold the data read from the input source.

    try {
        // Attempt to read the entire content of the standard input file synchronously.
        // The 'utf8' encoding ensures that text is read correctly.
        systemInputContent = require("fs").readFileSync(SYSTEM_INPUT_PATH, "utf8");
    } catch (fileReadError) {
        // If an error occurs during file reading (e.g., file not found, permissions issue),
        // log the error and terminate the process with an error code.
        console.error(`Input Error: Failed to retrieve data from ${SYSTEM_INPUT_PATH}. Details: ${fileReadError.message}`);
        process.exit(1); // Exit with a non-zero status code to indicate an error.
    }

    // Invoke the primary data processing function with the content read from stdin.
    // The return value is captured but not explicitly used here as the function logs its own output.
    processNumericalData(systemInputContent);
}

// Optional: Export the main processing function for unit testing or modular integration.
// module.exports = { processNumericalData };