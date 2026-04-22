// This module provides a robust mechanism for processing a sequence of
// numerical inputs, applying a series of transformations, and deriving
// a specific minimum value based on custom logical conditions.
// It includes input validation, error handling, and structured data manipulation.

/**
 * Retrieves raw input data from the standard input stream.
 * @returns {string} The raw string content from stdin.
 * @throws {Error} If input data cannot be read.
 */
const acquireExternalData = () => {
    try {
        // Utilizing Node.js 'fs' module to read synchronously from /dev/stdin.
        // The data is expected to be UTF-8 encoded text.
        const acquiredContent = require("fs").readFileSync("/dev/stdin", "utf8");
        return acquiredContent;
    } catch (ioError) {
        // Log the specific I/O error and re-throw a more general one.
        console.error(`ERROR: Failed to read from standard input. Details: ${ioError.message}`);
        throw new Error("Input acquisition process failed unexpectedly.");
    }
};

/**
 * Parses and validates a raw string of space-separated numbers, then
 * performs a series of calculations to determine a final metric.
 * @param {string} rawStringData - The raw input string containing numbers.
 * @returns {number} The calculated metric, or NaN if input is invalid.
 */
const calculateFinalMetric = (rawStringData) => {
    // --- Input Validation and Parsing ---

    // Early exit for invalid or empty input.
    if (typeof rawStringData !== 'string' || rawStringData.trim().length === 0) {
        console.warn("Input string is empty or not a string. Cannot proceed.");
        return Number.NaN;
    }

    // Normalize whitespace and split into string components.
    // Using a regular expression to handle multiple spaces as a single delimiter.
    const stringComponents = rawStringData.trim().split(/\s+/);

    // Ensure we have precisely three components as expected by the problem.
    const EXPECTED_COMPONENT_COUNT = 3;
    if (stringComponents.length !== EXPECTED_COMPONENT_COUNT) {
        console.warn(`Input must contain exactly ${EXPECTED_COMPONENT_COUNT} numbers separated by spaces. Found ${stringComponents.length}.`);
        return Number.NaN;
    }

    // Convert string components to numbers.
    // Using `map` with the `Number` constructor for explicit type conversion,
    // then destructuring the array into distinct constant variables.
    const [valX, valY, valZ] = stringComponents.map(Number);

    // Validate that all components successfully converted to numbers.
    // If any conversion resulted in NaN, it indicates an invalid numerical input.
    if (isNaN(valX) || isNaN(valY) || isNaN(valZ)) {
        console.warn("One or more input components could not be converted to valid numbers.");
        return Number.NaN;
    }

    // --- Core Calculation Logic ---

    // Initialize two primary intermediate values based on the input operands.
    // These correspond to 'd' and 'e' in the original problem context.
    let intermediateResultOne = valX - valY;
    let intermediateResultTwo = valZ - 1;

    // Calculate a critical difference that dictates subsequent conditional logic.
    // This value corresponds to (c - b) in the original problem.
    const keyDifferenceBasis = valZ - valY;

    // Determine the parity of the key difference. This boolean will be reused.
    const isBasisEven = (keyDifferenceBasis % 2 === 0);

    // Initialize a variable to hold the common adjustment value, defaulting to zero.
    // Using a float literal (0.0) for clarity, though JavaScript numbers are floats by default.
    let currentAdjustmentFactor = 0.0;

    // Conditional calculation of the adjustment factor.
    // This block refactors the original nested if-else structure into a more linear flow
    // by first checking parity, then magnitude within each branch.
    if (isBasisEven) {
        // If the basis is even, a specific threshold of 2 is relevant.
        const requiredEvenThreshold = 2;
        if (keyDifferenceBasis >= requiredEvenThreshold) {
            // Calculate the adjustment based on the even threshold.
            currentAdjustmentFactor = (keyDifferenceBasis - requiredEvenThreshold) / 2;
        }
        // If keyDifferenceBasis is even but less than 2 (i.e., 0 or negative even),
        // currentAdjustmentFactor remains 0, as per original logic.
    } else {
        // If the basis is odd, a specific threshold of 1 is relevant.
        const requiredOddThreshold = 1;
        if (keyDifferenceBasis >= requiredOddThreshold) {
            // Calculate the adjustment based on the odd threshold.
            currentAdjustmentFactor = (keyDifferenceBasis - requiredOddThreshold) / 2;
        }
        // If keyDifferenceBasis is odd but less than 1 (i.e., negative odd),
        // currentAdjustmentFactor remains 0, as per original logic.
    }

    // Apply the calculated adjustment to both primary intermediate results.
    intermediateResultOne -= currentAdjustmentFactor;
    intermediateResultTwo -= currentAdjustmentFactor;

    // Calculate the initial minimum of the two adjusted intermediate results.
    let finalOutputValue = Math.min(intermediateResultOne, intermediateResultTwo);

    // --- Final Conditional Refinement ---

    // If the key difference basis was even, perform an additional comparison
    // to potentially update the final minimum value. This mirrors a distinct
    // step in the original algorithm.
    if (isBasisEven) {
        // Introduce a new helper variable for the value used in this final comparison.
        const comparisonTerm = keyDifferenceBasis / 2;
        // Update the final output if the comparison term is smaller.
        finalOutputValue = Math.min(comparisonTerm, finalOutputValue);
    }

    // Return the meticulously calculated final metric.
    return finalOutputValue;
};

// --- Program Execution Entry Point ---
// This Immediately Invoked Function Expression (IIFE) orchestrates
// the entire program flow: acquiring input, performing calculations,
// and handling output or errors.
(() => {
    try {
        const rawInputString = acquireExternalData();
        const calculatedValue = calculateFinalMetric(rawInputString);

        // Only print the result if it's a valid number.
        // `Number.isNaN` is used for robustness against NaN values.
        if (!Number.isNaN(calculatedValue)) {
            console.log(calculatedValue);
        } else {
            // If the calculated value is NaN, it implies an error or invalid input
            // that was already logged by `calculateFinalMetric`.
            // Exit with a non-zero status code to signal an error to the operating system.
            process.exit(1);
        }
    } catch (executionError) {
        // Catch any uncaught errors that might occur during the overall execution flow.
        console.error(`CRITICAL ERROR: Program terminated due to unhandled exception: ${executionError.message}`);
        // Ensure a non-zero exit code for system-level error reporting.
        process.exit(1);
    }
})();