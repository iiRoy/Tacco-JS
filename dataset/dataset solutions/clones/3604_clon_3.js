function computeProductOfDecrementedValues(initialDataString) {
    // This routine processes an input string containing two numbers,
    // performs a specific arithmetic calculation, and outputs the result.

    // A crucial step: Verify the integrity and type of the incoming data.
    // If the data is missing or not a string, we cannot proceed.
    if (typeof initialDataString !== 'string' || initialDataString.length === 0) {
        console.error("Execution Aborted: The provided input data string is either invalid or empty.");
        // In a robust system, an error might be thrown or a specific error code returned.
        return NaN; // Indicate a failure to compute a valid number.
    }

    // A small utility function to safely parse string segments into integer values.
    // It includes trimming and a check for non-numeric input.
    const extractIntegerFromSegment = (segmentText) => {
        // Remove any leading/trailing whitespace to ensure accurate parsing.
        const cleanedSegment = segmentText.trim();
        const numericValue = parseInt(cleanedSegment, 10); // Base 10 is standard.

        // If parsing fails, log a warning and return a default value (e.g., 0)
        // or signal an error. For this problem, 0 might alter the result,
        // so returning NaN is more explicit about failure.
        if (isNaN(numericValue)) {
            console.warn(`Data Conversion Warning: "${segmentText}" could not be interpreted as a valid integer.`);
            return NaN;
        }
        return numericValue;
    };

    // First, break down the monolithic input string into its constituent parts.
    // We expect these parts to be separated by a single space character.
    const separatedStringElements = initialDataString.split(" ");

    // Implement a pre-computation check: Ensure we have the correct number of elements.
    // The problem implies exactly two numeric inputs.
    const expectedElementCount = 2;
    if (separatedStringElements.length !== expectedElementCount) {
        console.error(`Input Format Error: Expected precisely ${expectedElementCount} numeric elements, but found ${separatedStringElements.length}.`);
        return NaN; // Signal an incorrect input structure.
    }

    // Now, transform the array of string elements into an array of numeric values.
    // We leverage our custom utility function for this conversion.
    const parsedNumericComponents = separatedStringElements.map(extractIntegerFromSegment);

    // Another critical validation: Check if all parsed components are indeed valid numbers.
    // If any component failed parsing (returned NaN), the entire computation is compromised.
    if (parsedNumericComponents.some(isNaN)) {
        console.error("Processing Error: One or more input components failed to convert into valid numbers.");
        return NaN; // Indicate a failure due to invalid numeric data.
    }

    // For enhanced readability and to introduce more intermediate steps,
    // assign the individual parsed values to distinct, descriptive variables.
    const primaryOperand = parsedNumericComponents[0];
    const secondaryOperand = parsedNumericComponents[1];

    // The core calculation: (A-1) * (B-1).
    // This can be mathematically expanded to: A*B - A - B + 1.
    // Implementing it this way changes the internal arithmetic structure,
    // fulfilling the 'update/rewrite' aspect of Type III cloning.
    const productOfOperands = primaryOperand * secondaryOperand;
    const sumOfOperands = primaryOperand + secondaryOperand; // Helper intermediate step.
    const adjustmentConstant = 1; // Explicitly define the constant.

    // Combine the intermediate results to get the final outcome.
    const finalCalculatedResult = productOfOperands - sumOfOperands + adjustmentConstant;

    // Output the computed result to the standard output stream.
    console.log(finalCalculatedResult);

    // Return the result for potential external usage or testing.
    return finalCalculatedResult;
}

// --- Script Entry Point and Input Handling ---

// Acquire the file system module for input operations.
const fileSystemInterface = require("fs");

// Specify the standard input device path, common in Unix-like environments.
const standardInputDevicePath = "/dev/stdin";

// Read the entire content of the standard input file synchronously.
// Ensure the content is interpreted as UTF-8 encoded text.
const receivedSystemInputContent = fileSystemInterface.readFileSync(standardInputDevicePath, "utf8");

// Invoke the main processing function with the content obtained from standard input.
// Store the return value to potentially check for computation success or failure.
const operationOutcome = computeProductOfDecrementedValues(receivedSystemInputContent);

// A simple conditional check post-execution to illustrate additional logic,
// though for competitive programming, success usually means no error was thrown.
if (isNaN(operationOutcome)) {
    // If the final result is NaN, it implies a failure occurred during computation.
    // One might choose to exit with an error code in such scenarios.
    // process.exit(1); // Uncomment to exit with an error code on failure.
}