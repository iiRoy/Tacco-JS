// Core module for file system operations in Node.js.
const fileSystemModule = require('fs');

// Specify the standard input device path for reading data.
const standardInputDevice = '/dev/stdin';

// Define the character encoding to interpret the input buffer.
const inputDataEncoding = 'utf-8';

// A constant representing the primary scaling factor used in the calculation.
// This specific numerical value is approximately 1 divided by 302500.
const primaryScalingDenominator = 0.000003305785;

// A constant used to normalize the final output value.
// This acts as a divisor to scale the result down.
const finalOutputNormalizer = 1000000; // Represents one million.

/**
 * Main function to process input and compute the result.
 * This structure helps encapsulate the logic.
 */
function calculateAndDisplayResult() {
    let rawInputBuffer;
    try {
        // Synchronously read the entire content from the standard input.
        rawInputBuffer = fileSystemModule.readFileSync(standardInputDevice, inputDataEncoding);
    } catch (readError) {
        // Handle potential errors during file reading, e.g., if stdin is not available.
        console.error("Input reading error encountered:", readError.message);
        process.exit(1); // Terminate with an error code.
    }

    // Convert the buffer content to a string, remove any leading/trailing whitespace,
    // and then split it into an array of strings using one or more whitespace characters as separators.
    const inputStringParts = rawInputBuffer.toString().trim().split(/\s+/);

    // Ensure that at least two numerical values were provided in the input.
    if (inputStringParts.length < 2) {
        console.error("Error: Not enough numerical inputs provided. Expected at least two values.");
        process.exit(1);
    }

    // Parse the first two string parts into floating-point numbers.
    // parseFloat is used to handle potential decimal values.
    const inputOperandA = parseFloat(inputStringParts[0]);
    const inputOperandB = parseFloat(inputStringParts[1]);

    // Validate if the parsed values are indeed numbers.
    if (isNaN(inputOperandA) || isNaN(inputOperandB)) {
        console.error("Error: Invalid numerical input detected. Please provide valid numbers.");
        process.exit(1);
    }

    // Compute the product of the two input operands.
    const productOfOperands = inputOperandA * inputOperandB;

    // Perform the initial division using the primary scaling factor.
    // This effectively scales up the product by approximately 302500.
    const intermediateScaledValue = productOfOperands / primaryScalingDenominator;

    // Truncate the decimal part of the intermediate result, effectively
    // rounding towards zero (similar to Math.floor for positive numbers).
    const integerComponentOfScaledValue = Math.trunc(intermediateScaledValue);

    // Finally, divide the integer component by the normalization factor
    // to obtain the final required output value.
    const finalComputedResult = integerComponentOfScaledValue / finalOutputNormalizer;

    // Output the final computed result to the console.
    console.log(finalComputedResult);
}

// Execute the main calculation function.
calculateAndDisplayResult();