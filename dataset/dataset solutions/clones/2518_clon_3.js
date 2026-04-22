// This module is designed to perform a specific numerical transformation
// on a single integer value provided via standard input.
// It computes the ratio of the rounded half of the input number to the number itself,
// ensuring robust handling of various input scenarios.

const fileSystemOperations = require('fs'); // Access the Node.js file system utilities.

/**
 * Orchestrates the process of reading input, validating it, performing the core calculation,
 * and displaying the final computed ratio.
 */
function processAndOutputNumericRatio() {
    let rawInputBuffer;
    try {
        // Attempt to synchronously read the entire byte content from the standard input stream.
        rawInputBuffer = fileSystemOperations.readFileSync('/dev/stdin');
    } catch (ioReadError) {
        // If an error occurs during file reading (e.g., /dev/stdin is not available or readable),
        // log the error details and terminate the process with a non-zero exit code.
        console.error("Critical error encountered while trying to read from standard input:", ioReadError.message);
        process.exit(1);
    }

    // Convert the raw buffer content into a human-readable string using UTF-8 encoding.
    // Then, split this string into an array of individual lines based on newline characters.
    const allReceivedLines = rawInputBuffer.toString('utf-8').split('\n');

    let effectiveNumericString = '';
    // Iterate through the array of lines to find the first non-empty line.
    // This provides resilience against leading/trailing empty lines or multiple newlines.
    for (let lineIndex = 0; lineIndex < allReceivedLines.length; lineIndex++) {
        const currentLineTrimmed = allReceivedLines[lineIndex].trim();
        if (currentLineTrimmed.length > 0) {
            effectiveNumericString = currentLineTrimmed;
            break; // Once a non-empty line is found, we use it and stop searching.
        }
    }

    // If, after checking all lines, no valid non-empty string was found,
    // it indicates missing or improper input.
    if (effectiveNumericString === '') {
        console.error("Error: No discernible numeric input was provided on standard input.");
        return; // Exit the function gracefully without performing calculations.
    }

    // Attempt to convert the extracted string into an integer.
    // The radix (10) is explicitly specified for robust parsing.
    const primaryNumericOperand = parseInt(effectiveNumericString, 10);

    // Validate if the parsing operation was successful. If `parseInt` returns NaN,
    // it means the input string was not a valid integer.
    if (isNaN(primaryNumericOperand)) {
        console.error(`Input validation failed: "${effectiveNumericString}" is not a valid integer.`);
        return;
    }

    // Declare a constant for the divisor, making the division operation clear.
    const divisionConstant = 2;

    // Calculate the intermediate value: the input number divided by the constant.
    const interimHalfValue = primaryNumericOperand / divisionConstant;

    // Round the intermediate value to the nearest whole number.
    // Math.round() adheres to standard rounding rules (0.5 rounds up to the next integer).
    const roundedValueForNumerator = Math.round(interimHalfValue);

    let finalComputedResult;

    // Implement a guard clause to prevent division by zero, which is mathematically undefined.
    // If the primary operand is zero, assign NaN (Not a Number) to the result.
    if (primaryNumericOperand === 0) {
        console.warn("Warning: The input number is zero. Division by zero leads to an undefined result.");
        finalComputedResult = NaN;
    } else {
        // Perform the final calculation: the rounded half value divided by the original operand.
        finalComputedResult = roundedValueForNumerator / primaryNumericOperand;
    }

    // Output the final computed numerical result to the standard output stream.
    console.log(finalComputedResult);
}

// Invoke the main function to start the execution flow.
processAndOutputNumericRatio();