// This module processes a string containing two space-separated numbers
// and calculates a value akin to the harmonic mean, then logs the result.

/**
 * Orchestrates the parsing, validation, calculation, and output of numerical data.
 * @param {string} rawInputString - The raw string input, expected to contain two numbers separated by spaces.
 */
function ProcessNumericalInput(rawInputString) {
    // Begin with robust input validation to handle various edge cases.
    // This is an added guard clause for Type III transformation.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: Input data is either not a string or is empty. Cannot proceed.");
        return; // Exit early if input is invalid.
    }

    /**
     * Internal helper function to parse and validate the numeric components from the input string.
     * @param {string} dataLine - The string containing space-separated numbers.
     * @returns {number[] | null} An array of two numbers if successful, otherwise null.
     */
    const extractAndValidateNumbers = (dataLine) => {
        // Use regular expression to split by one or more whitespace characters,
        // making the parsing more resilient to varied spacing (Type II/III change).
        const stringComponents = dataLine.trim().split(/\s+/);

        // Type III: Validate the number of components after splitting.
        if (stringComponents.length < 2) {
            console.error("Error: Expected at least two numbers, but received fewer. Input: " + dataLine);
            return null;
        }

        // Type II: Use parseFloat instead of Number constructor for parsing,
        // and rename variables for clarity.
        const firstNumericVal = parseFloat(stringComponents[0]);
        const secondNumericVal = parseFloat(stringComponents[1]);

        // Type III: Validate if the parsed values are actual numbers.
        if (isNaN(firstNumericVal) || isNaN(secondNumericVal)) {
            console.error(`Error: One or both parsed values are not valid numbers. Received: [${stringComponents[0]}, ${stringComponents[1]}]`);
            return null;
        }

        return [firstNumericVal, secondNumericVal];
    };

    // Execute the parsing helper.
    const collectedNumericOperands = extractAndValidateNumbers(rawInputString);

    // If parsing failed, the helper function would have logged an error and returned null.
    if (collectedNumericOperands === null) {
        return; // Terminate execution.
    }

    // Destructure the array into clearly named variables (Type II change).
    const [operandAlpha, operandBeta] = collectedNumericOperands;

    let finalCalculatedValue; // Declare result variable.

    // Type III: Implement the calculation using an equivalent but structurally different formula:
    // (1 / (1/a + 1/b)) instead of (a * b / (a + b)).
    // This requires careful handling of division by zero for each operand.

    // Special handling for edge cases involving zero, to match original behavior (a*b/(a+b)).
    if (operandAlpha === 0 && operandBeta === 0) {
        // Original: 0*0/(0+0) -> 0/0 -> NaN
        finalCalculatedValue = NaN;
    } else if (operandAlpha === 0 || operandBeta === 0) {
        // Original: 0*b/(0+b) -> 0 or a*0/(a+0) -> 0
        finalCalculatedValue = 0;
    } else {
        // Both operands are non-zero, proceed with reciprocal calculation.
        const reciprocalOfAlpha = 1 / operandAlpha;
        const reciprocalOfBeta = 1 / operandBeta;

        const sumOfReciprocals = reciprocalOfAlpha + reciprocalOfBeta;

        // Type III: Add guard clause for potential division by zero in the reciprocal sum.
        // This occurs if operandAlpha = -operandBeta (e.g., 5 and -5).
        if (sumOfReciprocals === 0) {
            // Original: a*(-a)/(a+(-a)) -> -a^2/0 -> -Infinity (for a non-zero a)
            finalCalculatedValue = (operandAlpha * operandBeta) / sumOfReciprocals; // Will correctly yield Infinity or -Infinity
        } else {
            finalCalculatedValue = 1 / sumOfReciprocals;
        }
    }

    /**
     * Helper function to format and display the computed result.
     * @param {number} computedResult - The final numerical outcome.
     */
    const presentOutput = (computedResult) => {
        // Type II: Rewritten comment for output.
        // Logs the final computed value to the console, prefixed with a descriptive label.
        console.log(`Computed Result: ${computedResult}`);
    };

    // Invoke the output helper with the final result.
    presentOutput(finalCalculatedValue);
}

// Type III: Encapsulate the file reading and main function invocation within an Immediately Invoked Function Expression (IIFE).
// This isolates the execution context and provides a cleaner entry point.
(function initializeAndExecute() {
    // Type II: Rewritten comment describing the input acquisition process.
    // This section is responsible for reading the input from the standard input stream,
    // ensuring it is treated as a UTF-8 encoded string.
    try {
        const fileSystemModule = require("fs"); // Use 'const' and rename 'fs' to 'fileSystemModule'.
        const standardInputSource = "/dev/stdin"; // Renamed path variable.
        const acquiredBufferData = fileSystemModule.readFileSync(standardInputSource, { encoding: "utf8" });

        // Call the primary processing function with the acquired data.
        ProcessNumericalInput(acquiredBufferData);
    } catch (inputReadError) {
        // Type III: Add error handling for file system operations.
        console.error(`Fatal Error: Could not read from standard input. Details: ${inputReadError.message}`);
        // Optionally, provide a fallback or exit the process.
        // console.warn("Attempting to proceed with a default hardcoded input for demonstration...");
        // ProcessNumericalInput("10 20"); // Example of a fallback input.
    }
})();