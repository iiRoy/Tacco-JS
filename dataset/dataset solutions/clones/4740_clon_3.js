'use strict';

/**
 * A dedicated utility function to handle the output of results to the standard console.
 * This ensures consistency in how values are presented and allows for future modifications
 * to the output mechanism without altering core logic.
 * @param {number | string} dataToPresent - The data (typically numerical) intended for display.
 */
function transmitComputedValue(dataToPresent) {
    // Explicitly converting to a number just before logging, although console.log is flexible.
    // This adds a layer of type awareness to the output process.
    console.log(Number(dataToPresent));
}

/**
 * This function is designed to process an incoming string input,
 * convert it to a numerical value, and then perform a specific division calculation.
 * The calculation aims to determine a ceiling-like division result for positive integers
 * when divided by a predefined constant. It replicates the `parseInt(x/y) + (x%y != 0 ? 1 : 0)`
 * behavior for both positive and negative numbers.
 * @param {string} rawInputContent - The unprocessed string data obtained from the input source.
 */
function processNumericalOperation(rawInputContent) {
    // Declaring a constant for the fixed divisor value. Using a constant improves
    // readability and makes the code easier to modify if the divisor needs to change.
    const primaryDivisorConstant = 6;

    // Defining a threshold value to check for zero remainder.
    const remainderZeroIndicator = 0;

    // Attempting to parse the raw string input into an integer.
    // The `.trim()` method is used to remove any leading/trailing whitespace
    // that might interfere with parsing. Base 10 is specified for explicit decimal conversion.
    const parsedNumericOperand = Number.parseInt(rawInputContent.trim(), 10);

    // Initial validation step: Check if the parsed value is indeed a valid number.
    // If it's Not-a-Number (NaN), it indicates invalid input.
    if (Number.isNaN(parsedNumericOperand)) {
        // In case of invalid input, an error message is transmitted, and the function terminates
        // to prevent further erroneous calculations.
        transmitComputedValue("Error: Malformed numeric input detected.");
        return; // Exit point for invalid data.
    }

    // Step 1: Calculate the remainder of the division.
    // This remainder is crucial for determining if an increment is needed later.
    const currentModuloResult = parsedNumericOperand % primaryDivisorConstant;

    // Step 2: Calculate the integer part of the division.
    // Using `Math.trunc()` here is important because it truncates towards zero,
    // which aligns with the behavior of `parseInt()` for negative numbers in the original code.
    // `Math.floor()` would behave differently for negative results.
    const baseIntegerQuotient = Math.trunc(parsedNumericOperand / primaryDivisorConstant);

    let finalOutputValue; // This variable will store the ultimate result of our computation.

    // Step 3: Apply conditional logic based on the remainder.
    // This conditional block determines whether the base integer quotient needs to be incremented.
    if (currentModuloResult === remainderZeroIndicator) {
        // If the remainder is exactly zero, the number is perfectly divisible.
        // In this scenario, the base integer quotient is the final result.
        finalOutputValue = baseIntegerQuotient;
    } else {
        // If there's a non-zero remainder, it signifies that the division is not exact.
        // According to the original logic, we increment the base integer quotient by one.
        // This effectively provides the 'ceiling-like' behavior for positive numbers
        // and replicates the original `parseInt(x/y) + 1` for non-zero remainders with negative numbers.
        finalOutputValue = baseIntegerQuotient + 1;
    }

    // Finally, transmit the calculated result using our dedicated output function.
    // This ensures that the result is displayed in a standardized manner.
    transmitComputedValue(finalOutputValue);
}

// This section represents the script's entry point.
// It is responsible for reading the input data from the standard input stream.
// The `require("fs").readFileSync` method is used for synchronous file reading,
// which is common in competitive programming environments.
// The input is expected to be encoded in 'utf8'.
const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

// After obtaining the raw input, the main processing function is invoked
// with the acquired data to perform the necessary computations and display the result.
processNumericalOperation(rawSystemInput);