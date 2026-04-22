'use strict'; // Enforce strict mode for cleaner and safer code execution.

// Import the Node.js file system module, aliased for better readability.
const fileSystemUtilities = require('fs');

/**
 * Retrieves and meticulously validates the numeric input parameters from standard input.
 * This function ensures that exactly two valid numbers are provided and that they
 * adhere to the logical constraints required for the subsequent calculation.
 *
 * @returns {{initialValue: number, threshold: number}} An object containing the
 *          parsed and validated initial numeric value and the upper threshold.
 * @throws {Error} If the input format is incorrect, values are non-numeric,
 *         or if logical conditions (like positive initial value for non-negative threshold) are violated.
 */
function acquireAndVerifyInputData() {
    // Read the entire content from stdin as a UTF-8 encoded string.
    // This is a synchronous operation, suitable for script startup.
    const rawStreamContent = fileSystemUtilities.readFileSync('/dev/stdin', 'utf8');

    // Clean up the raw content by removing leading/trailing whitespace.
    // Then, split the string into an array of potential numeric tokens,
    // accommodating one or more whitespace characters as delimiters.
    const processedInputTokens = rawStreamContent.trim().split(/\s+/);

    // Perform an initial validation: ensure that exactly two tokens were provided.
    // This prevents errors from missing or extra input values.
    if (processedInputTokens.length !== 2) {
        throw new Error('Input parsing failure: Expected precisely two numeric values separated by whitespace.');
    }

    // Convert the first token to a floating-point number, representing the starting point.
    const parsedInitialValue = parseFloat(processedInputTokens[0]);
    // Convert the second token to a floating-point number, representing the upper limit.
    const parsedMaximumThreshold = parseFloat(processedInputTokens[1]);

    // Validate that both conversion attempts resulted in actual numbers (not NaN).
    if (isNaN(parsedInitialValue) || isNaN(parsedMaximumThreshold)) {
        throw new Error('Data type mismatch: One or both provided input tokens are not valid numbers.');
    }

    // Implement a critical logical validation:
    // The core doubling algorithm would enter an infinite loop if the initial value is zero or negative
    // while the threshold is non-negative (e.g., 0, 10 or -5, 10).
    // This guard clause prevents such an undesirable state, ensuring termination.
    if (parsedInitialValue <= 0 && parsedMaximumThreshold >= 0) {
        throw new Error('Constraint violation: Initial value must be positive when the threshold is non-negative to ensure meaningful exponential growth and calculation termination.');
    }

    // Return the successfully validated and parsed numeric parameters.
    return {
        initialValue: parsedInitialValue,
        threshold: parsedMaximumThreshold
    };
}

/**
 * Computes the minimum number of times an initial value must be doubled
 * until it strictly surpasses a given upper limit.
 *
 * This function encapsulates the primary calculation logic.
 * @param {number} startingOperand The base numeric value to begin doubling.
 * @param {number} upperBoundary The target value that the startingOperand must exceed.
 * @returns {number} The count of doubling operations. Returns 0 if the startingOperand
 *         already meets or exceeds the upperBoundary without any operations.
 */
function calculateDoublingIterationsToExceed(startingOperand, upperBoundary) {
    // Define the constant factor for multiplication, enhancing clarity.
    const MULTIPLICATION_FACTOR = 2;
    let currentProgressiveValue = startingOperand; // Tracks the value as it doubles.
    let operationCounter = 0; // Counts how many doubling operations are performed.

    // Early exit condition: if the initial value already exceeds the boundary,
    // no operations are required. This is an explicit optimization.
    if (currentProgressiveValue > upperBoundary) {
        return 0;
    }

    // The main iterative process: keep doubling the current value
    // as long as it has not yet strictly surpassed the upper boundary.
    while (currentProgressiveValue <= upperBoundary) {
        currentProgressiveValue *= MULTIPLICATION_FACTOR; // Apply the doubling factor.
        operationCounter++; // Increment the counter for each completed doubling step.
    }

    return operationCounter; // Return the final tally of operations.
}

// Main application execution block.
try {
    // Attempt to acquire and validate the input parameters.
    const applicationParameters = acquireAndVerifyInputData();

    // Execute the core calculation using the validated input.
    const computedResult = calculateDoublingIterationsToExceed(
        applicationParameters.initialValue,
        applicationParameters.threshold
    );

    // Output the final result to standard output.
    // Using a template literal for consistent string output.
    console.log(`${computedResult}`);

} catch (executionError) {
    // If any error occurs during input processing or validation,
    // catch it here, log an informative error message to stderr,
    // and exit the process with a non-zero status code to indicate failure.
    console.error(`Runtime Error Encountered: ${executionError.message}`);
    process.exit(1); // Signal an abnormal termination.
}