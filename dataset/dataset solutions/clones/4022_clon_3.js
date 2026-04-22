const INPUT_SOURCE_FILE = "/dev/stdin"; // Defines the standard input file path for reading data.
const MODULO_DIVISOR_CONSTANT = 500; // Represents a fixed divisor used in the core calculation.

/**
 * Parses a string value into an integer. If the parsing fails or the input
 * is invalid, it defaults to zero to prevent NaN propagation.
 * This function also trims whitespace from the input string.
 * @param {string} inputString - The string to be converted to an integer.
 * @returns {number} The parsed integer, or 0 if parsing is unsuccessful.
 */
function robustIntegerParser(inputString) {
    // Validate that the input is indeed a string and not empty after trimming.
    if (typeof inputString !== 'string' || inputString.trim().length === 0) {
        // In a production scenario, one might log an error or throw an exception.
        // For this context, returning 0 maintains execution flow.
        return 0;
    }
    const parsedValue = parseInt(inputString.trim(), 10); // Use radix 10 for explicit decimal parsing.
    // Check if the result of parseInt is NaN (Not-a-Number).
    return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Core processing function that evaluates a financial or inventory constraint.
 * It reads two numerical values from a multi-line string input, performs
 * a modulo operation on the first value, and compares the result against the second.
 * Based on this comparison, it prints a status message ("YES" or "NO").
 * @param {string} completeInputData - A string containing all input lines, separated by newlines.
 * @returns {void} This function does not return a value; it prints directly to the console.
 */
function analyzeResourceAllocation(completeInputData) {
    // Preliminary check for valid input type and content.
    if (typeof completeInputData !== 'string' || completeInputData.length === 0) {
        console.error("Processing aborted: Input data is empty or not a string.");
        return; // Halt execution for invalid input.
    }

    // Split the entire input string into an array of individual lines.
    const dataLinesArray = completeInputData.split('\n');

    // Ensure that there are at least two lines of data as expected by the logic.
    if (dataLinesArray.length < 2) {
        console.error("Processing aborted: Insufficient data lines. Expected at least two distinct values.");
        return; // Halt execution if critical data is missing.
    }

    // Extract the primary item valuation from the first line of input.
    // Utilizes the robust parser to handle potential non-numeric inputs gracefully.
    const primaryItemValuation = robustIntegerParser(dataLinesArray[0]);

    // Extract the allowable variance or threshold from the second line.
    const permissibleVariance = robustIntegerParser(dataLinesArray[1]);

    // Calculate the remainder when the primary valuation is divided by the predefined constant.
    const calculatedRemainder = primaryItemValuation % MODULO_DIVISOR_CONSTANT;

    let finalDecisionMessage; // Declare a variable to hold the outcome string.

    // Evaluate the condition: Is the calculated remainder less than or equal to the permissible variance?
    if (calculatedRemainder <= permissibleVariance) {
        finalDecisionMessage = "YES"; // The condition is met.
    } else {
        finalDecisionMessage = "NO";  // The condition is not met.
    }

    // Output the conclusive message to standard output.
    console.log(finalDecisionMessage);
}

// --- Application Entry Point ---
// The following block initiates the data acquisition and processing.

try {
    // Synchronously read the entire content of the specified input file.
    // 'utf8' encoding is crucial for correct character interpretation.
    const rawInputBufferContent = require("fs").readFileSync(INPUT_SOURCE_FILE, "utf8");

    // Invoke the main analysis function with the content read from the file.
    analyzeResourceAllocation(rawInputBufferContent);
} catch (error) {
    // Catches any errors that might occur during file reading or subsequent processing.
    console.error(`An error occurred during input processing: ${error.message}`);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}