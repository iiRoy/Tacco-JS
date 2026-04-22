// This file contains a JavaScript implementation for a specific
// recursive sequence calculation and input processing logic.

/*
 * A global object to store previously computed results of the
 * recursive sequence. This mechanism is known as memoization,
 * significantly improving performance by avoiding redundant calculations.
 */
let memoCache = {};

// Initialize the very first terms of our custom sequence.
// These are the base cases required for the recursive definition.
memoCache[0] = 1;
memoCache[1] = 1;
memoCache[2] = 2;


/**
 * Computes the Nth term of a specialized three-term recursive sequence.
 * It leverages memoization to efficiently retrieve already calculated values.
 *
 * @param {number} positionIndex The zero-based index of the term to compute.
 * @returns {number} The numerical value of the sequence term at the given index.
 */
function calculateRecursiveValue(positionIndex) {
    // Check if the result for this specific 'positionIndex' is already present
    // in our 'memoCache'. If so, we can return it immediately.
    if (positionIndex in memoCache) {
        return memoCache[positionIndex];
    }

    // If the value is not cached, we compute it using the recurrence relation:
    // S(n) = S(n-1) + S(n-2) + S(n-3).
    // Then, we store this newly computed value in 'memoCache' before returning it.
    memoCache[positionIndex] = calculateRecursiveValue(positionIndex - 1)
                             + calculateRecursiveValue(positionIndex - 2)
                             + calculateRecursiveValue(positionIndex - 3);

    // Finally, return the computed term's value.
    return memoCache[positionIndex];
}


/**
 * Takes an input number, calculates its corresponding sequence value,
 * and then applies a series of arithmetic operations to format the final output.
 * The operations involve division and rounding up.
 *
 * @param {number} inputArg The numeric argument to process.
 * @returns {number} The final, processed, and rounded-up numerical result.
 */
function computeAndFormatResult(inputArg) {
    // First, obtain the raw sequence value for 'inputArg' using our recursive function.
    const sequenceValue = calculateRecursiveValue(inputArg);

    // Now, perform the required scaling: divide by 10, then by 365,
    // and finally round the result upwards to the nearest whole number.
    const finalCalculatedFigure = Math.ceil(sequenceValue / 10 / 365);

    return finalCalculatedFigure;
}


// Utilize Node.js's native 'fs' (File System) module to handle input.
require("fs")
  .readFileSync("/dev/stdin", "utf-8") // Read all data from standard input, interpreting as UTF-8.
  .split("\n") // Divide the entire input string into an array of individual lines.
  .forEach(function(currentLineItem) { // Iterate over each line in the parsed input array.

    // Convert the string representation of the line into a numeric type.
    // The unary plus operator is a common shorthand for this conversion.
    let numericInputVal = +currentLineItem;

    // If the converted numeric value is zero, we consider it a sentinel
    // or end-of-input marker for this particular processing loop,
    // and thus skip further processing for this specific line.
    if (numericInputVal === 0) {
      return; // Exit the current iteration of the forEach loop.
    }

    // Call the main processing function with the valid numeric input
    // and print its returned value to the console (standard output).
    console.log(computeAndFormatResult(numericInputVal));
  });