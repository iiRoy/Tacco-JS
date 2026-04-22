const fileSystem = require('fs');

/**
 * Safely parses a string value into an integer.
 * Includes basic validation for non-numeric input and provides a default fallback.
 * @param {string} strValue The string to parse.
 * @param {number} radix The base (e.g., 10 for decimal).
 * @param {number} defaultValue The value to return if parsing fails.
 * @returns {number} The parsed integer or the default value.
 */
function parseAndValidateInteger(strValue, radix = 10, defaultValue = 0) {
    const parsedNumber = parseInt(strValue, radix);
    if (isNaN(parsedNumber)) {
        // In a production scenario, one might throw an error or handle this more robustly.
        // For this clone, we log a warning and use the default value to proceed.
        console.warn(`Warning: Input component "${strValue}" could not be interpreted as an integer. Defaulting to ${defaultValue}.`);
        return defaultValue;
    }
    return parsedNumber;
}

/**
 * Processes a line of input containing two space-separated numbers.
 * It computes their sum, difference, and product, then determines the maximum
 * among these three results, with a specific adjustment for negative zero.
 * @param {string} inputLine The raw string read from input, e.g., "5 3".
 */
function calculateAndDisplayMaximum(inputLine) {
    // Trim whitespace and split the input string by one or more spaces.
    // Filter out any empty strings that might arise from leading/trailing/multiple spaces.
    const stringComponents = inputLine.trim().split(/\s+/).filter(Boolean);

    // Implement a guard clause to ensure the input format is as expected.
    if (stringComponents.length !== 2) {
        console.error("Input format error: Expected two space-separated numerical values. Received:", stringComponents.join(' '));
        // Exit early or return a specific error indicator if input is malformed.
        // For this exercise, we'll just log and proceed with defaults (from parseAndValidateInteger).
        return;
    }

    // Parse the two primary numerical operands using the helper function.
    const firstOperand = parseAndValidateInteger(stringComponents[0]);
    const secondOperand = parseAndValidateInteger(stringComponents[1]);

    // Store the operands in a structured way for clarity and potential future reuse.
    const numericOperands = {
        val1: firstOperand,
        val2: secondOperand
    };

    // Perform the required arithmetic operations.
    const resultOfAddition = numericOperands.val1 + numericOperands.val2;
    const resultOfSubtraction = numericOperands.val1 - numericOperands.val2;
    const resultOfMultiplication = numericOperands.val1 * numericOperands.val2;

    // Aggregate all intermediate results into an array.
    const allCalculatedOutcomes = [
        resultOfAddition,
        resultOfSubtraction,
        resultOfMultiplication
    ];

    // Find the largest value among the collected outcomes.
    // The spread operator (`...`) is used to pass array elements as individual arguments.
    let finalOverallMaximum = Math.max(...allCalculatedOutcomes);

    // Special handling for the case of negative zero (-0).
    // While `===` treats -0 and 0 as equal, `Object.is` distinguishes them.
    // The original code implies converting -0 to 0.
    if (Object.is(finalOverallMaximum, -0)) {
        finalOverallMaximum = 0; // Normalize -0 to +0 for consistent output.
    }

    // Display the computed ultimate maximum value.
    console.log(finalOverallMaximum);
}

/**
 * Retrieves the entire content from standard input.
 * Includes basic error handling for file system operations.
 * @returns {string} The content read from stdin.
 */
function fetchStandardInputContent() {
    try {
        // Attempt to synchronously read the entire standard input stream.
        const stdinBuffer = fileSystem.readFileSync('/dev/stdin');
        return stdinBuffer.toString('utf8'); // Convert buffer to UTF-8 string.
    } catch (ioError) {
        console.error("An error occurred while attempting to read from standard input:", ioError.message);
        // In case of an error, return an empty string to prevent further processing issues.
        return "";
    }
}

// --- Script Execution Entry Point ---
const inputFromSystem = fetchStandardInputContent();
calculateAndDisplayMaximum(inputFromSystem);