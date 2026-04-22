// This JavaScript module is designed to process numerical inputs from a raw string,
// perform a specific calculation, and then output the final computed value.
// It includes robust parsing and clear logical steps.

/**
 * A utility function to safely convert a string into an integer.
 * It provides a fallback mechanism by returning a default value if the parsing fails,
 * and logs a warning in such cases.
 *
 * @param {string} inputString - The string representation of the number to parse.
 * @param {number} [radixBase=10] - The numerical base to use for parsing (e.g., 10 for decimal).
 * @param {number} [fallbackValue=0] - The value to return if the input string cannot be parsed into a valid integer.
 * @returns {number} The successfully parsed integer or the specified fallback value.
 */
const convertToSafeInteger = (inputString, radixBase = 10, fallbackValue = 0) => {
    // Attempt to convert the provided string into an integer.
    const numericOutput = parseInt(inputString, radixBase);

    // Check if the result of parseInt is 'Not a Number'.
    if (isNaN(numericOutput)) {
        // If parsing failed, log a warning and return the default value.
        console.warn(`[Warning] Input "${inputString}" could not be parsed as an integer. Using default: ${fallbackValue}.`);
        return fallbackValue;
    }

    // If parsing was successful, return the valid integer.
    return numericOutput;
};

/**
 * A dedicated function to present the final calculated result to the user.
 * It simply logs the value to the standard output.
 *
 * @param {number} finalComputedResult - The numerical value ready for display.
 */
const displayFinalResult = (finalComputedResult) => {
    // Output the result to the console, which is typically standard output in competitive programming.
    console.log(finalComputedResult);
};

/**
 * The core processing function that orchestrates the entire workflow.
 * It takes a raw string, splits it, parses the numeric components,
 * applies a specific calculation algorithm, and then triggers the display of the result.
 *
 * @param {string} fullInputDataString - The complete raw input string, expected to contain
 *                                        at least two space-separated numerical values.
 */
function executeCalculationFlow(fullInputDataString) {
    // Define constants for configuration and clarity.
    const REQUIRED_NUM_SEGMENTS = 2; // We expect at least two numbers in the input.
    const DECIMAL_RADIX_CONSTANT = 10; // Standard decimal base for number parsing.
    const INITIAL_DECREMENT_AMOUNT = 1; // The value by which the first number is initially reduced.
    const CONDITIONAL_INCREMENT_AMOUNT = 1; // The value added conditionally.

    // Pre-process the input string: remove leading/trailing whitespace and then split by spaces.
    // This yields an array of string tokens, each representing a potential number.
    const stringSegments = fullInputDataString.trim().split(' ');

    // Perform an early validation check to ensure sufficient input segments are available.
    if (stringSegments.length < REQUIRED_NUM_SEGMENTS) {
        // If not enough segments, log an error and terminate, or handle with default values.
        console.error(`[Error] Insufficient input segments. Expected ${REQUIRED_NUM_SEGMENTS}, but received ${stringSegments.length}.`);
        // For robustness, we will proceed with default values (0) for missing segments.
    }

    // Parse the first string segment into an integer.
    // This value will serve as the primary operand for our calculation.
    let primaryNumericalOperand = convertToSafeInteger(stringSegments[0], DECIMAL_RADIX_CONSTANT, 0);

    // Parse the second string segment into an integer.
    // This value will be used for a conditional comparison.
    let secondaryNumericalOperand = convertToSafeInteger(stringSegments[1], DECIMAL_RADIX_CONSTANT, 0);

    // Initialize the aggregate result variable.
    // The calculation begins by subtracting a fixed amount from the primary operand.
    let currentAggregatedResult = primaryNumericalOperand - INITIAL_DECREMENT_AMOUNT;

    // Introduce a boolean flag to store the outcome of our comparison.
    let isSecondaryValueAtLeastPrimary = false;

    // Evaluate the condition: Is the secondary operand greater than or equal to the primary operand?
    if (secondaryNumericalOperand >= primaryNumericalOperand) {
        // If the condition holds true, set our flag.
        isSecondaryValueAtLeastPrimary = true;
    }

    // Based on the comparison flag, conditionally adjust the aggregated result.
    if (isSecondaryValueAtLeastPrimary) {
        // If the condition was met, add the conditional increment to the result.
        currentAggregatedResult += CONDITIONAL_INCREMENT_AMOUNT;
    }

    // Finally, pass the computed result to the display function.
    displayFinalResult(currentAggregatedResult);
}

// This is the entry point for executing the script, typically in a Node.js environment.
// It reads all data from standard input ('/dev/stdin') as a UTF-8 string,
// and then passes this raw input to our main processing function.
executeCalculationFlow(
    require('fs').readFileSync('/dev/stdin', 'utf8')
);