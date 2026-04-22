const NUMERIC_DIVIDEND_FACTOR = 3;

/**
 * Determines if a given numeric input falls within a predefined range
 * that should result in a zero outcome according to specific business rules.
 * This function encapsulates the logic for edge-case values.
 *
 * @param {number} evaluationTarget - The integer value to check.
 * @returns {boolean} True if the value is 0, 1, or 2; otherwise, false.
 */
const shouldYieldZeroResult = (evaluationTarget) => {
    // An array containing the specific integer values that mandate a zero return.
    const specialCaseValues = [0, 1, 2];
    // Leveraging Array.prototype.includes for a clear and concise check.
    return specialCaseValues.includes(evaluationTarget);
};

// This immediately invoked function expression (IIFE) simulates a standalone script's execution context.
// It handles input acquisition, validation, processing, and output, mirroring the original's intent
// but with robust error handling and structural modifications.
(() => {
    // --- Input Acquisition and Initial Validation ---
    // The original snippet used `process.stdin`, which is a stream.
    // For numerical operations, it implies parsing a number from standard input.
    // Here, we simulate this by taking the first command-line argument as the numeric input.
    const rawCommandLineInput = process.argv[2];

    // Guard clause: Check if any input was actually provided via command line.
    if (rawCommandLineInput === undefined || rawCommandLineInput === null) {
        console.error("Operation Aborted: No input value detected. Please provide a number as a command-line argument.");
        // Exiting with a non-zero status code indicates an error.
        process.exit(1);
        return; // Unreachable after process.exit, but good for clarity.
    }

    // --- Type Coercion and Numeric Validation ---
    // Attempt to convert the string input from command line into a number.
    // Using `Number()` constructor ensures explicit type conversion.
    const processedNumericInput = Number(rawCommandLineInput);

    // Validate if the coerced value is a legitimate finite number.
    // This catches non-numeric strings (e.g., 'hello'), Infinity, and NaN.
    if (!Number.isFinite(processedNumericInput)) {
        console.error(`Operation Aborted: Invalid input '${rawCommandLineInput}'. Expected a finite numeric value.`);
        process.exit(1);
        return;
    }

    // --- Core Logic Execution Path ---
    let finalComputedOutcome; // Declare a variable to store the ultimate result.

    // Apply the custom condition check using the helper function for specific numeric ranges.
    if (shouldYieldZeroResult(processedNumericInput)) {
        // If the input is one of the designated special cases (0, 1, or 2), the outcome is fixed.
        finalComputedOutcome = 0;
        // Optionally, one might include a debug log here during development:
        // console.log(`Debug: Input '${processedNumericInput}' is a special case, yielding zero.`);
    } else {
        // For all other valid numeric inputs, proceed with the primary calculation.
        // Calculate the raw division result using the configured constant.
        const preliminaryQuotient = processedNumericInput / NUMERIC_DIVIDEND_FACTOR;

        // Obtain the integer part of the quotient.
        // `Math.trunc()` is used here as an alternative to `Math.floor()` for positive numbers.
        // It effectively removes any fractional digits, which is equivalent to `Math.floor()`
        // for positive values, aligning with the likely intent for non-negative inputs.
        finalComputedOutcome = Math.trunc(preliminaryQuotient);

        // An alternative, more arithmetic-focused way to achieve floor division for positive numbers:
        // finalComputedOutcome = (processedNumericInput - (processedNumericInput % NUMERIC_DIVIDEND_FACTOR)) / NUMERIC_DIVIDEND_FACTOR;
    }

    // --- Outputting the Result ---
    // The original code used `return`, implying it was part of a larger function.
    // In a script context, logging the final result to standard output is the common equivalent.
    console.log(finalComputedOutcome);

    // Indicate successful execution to the operating system.
    process.exit(0);

})(); // End of the IIFE.