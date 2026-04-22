/**
 * This module is designed to process numerical input from standard input (stdin)
 * and perform a specific iterative calculation. It reads a maximum divisor value (N)
 * and two pairs of integers (A, B) and (C, D).
 *
 * The core logic iterates from 1 up to N, using each iteration value as a 'divisor'.
 * For each divisor, it calculates a unique 'quotient-remainder' distance for
 * the pair (A, B) and then for the pair (C, D). These two distances are summed,
 * and the program keeps track of the overall minimum sum encountered across all divisors.
 *
 * The final minimum combined distance is printed to standard output.
 */

// Import the Node.js file system utility module, aliased for clarity.
const ioHandler = require('fs');

// Define constants for standard file descriptors and common encodings.
const STDIN_FILE_DESCRIPTOR = process.stdin.fd;
const UTF8_ENCODING = 'utf8';
const INITIAL_MINIMUM_VALUE = Infinity; // Represents the starting point for finding the smallest value.

/**
 * Calculates a custom 'quotient-remainder' distance between two numbers
 * based on a given divisor. This distance is the sum of the absolute
 * difference of their remainders and the absolute difference of their
 * floor-divided quotients.
 *
 * @param {number} valueOne The first integer operand.
 * @param {number} valueTwo The second integer operand.
 * @param {number} currentDivisor The divisor to use for modulo and division operations.
 * @returns {number} The calculated quotient-remainder distance, or Infinity if divisor is zero.
 */
function computeQuotientRemainderDistance(valueOne, valueTwo, currentDivisor) {
    // A guard clause to prevent division by zero, which would result in NaN or Infinity errors.
    if (currentDivisor === 0) {
        console.warn("Warning: Attempted division by zero in distance calculation. Returning Infinity.");
        return Infinity;
    }

    const remainderDifference = Math.abs(valueOne % currentDivisor - valueTwo % currentDivisor);
    const quotientDifference = Math.abs(Math.floor(valueOne / currentDivisor) - Math.floor(valueTwo / currentDivisor));

    return remainderDifference + quotientDifference;
}

try {
    // Step 1: Determine the size of the standard input stream.
    const inputStatistics = ioHandler.fstatSync(STDIN_FILE_DESCRIPTOR);
    const totalInputSize = inputStatistics.size;

    // Early exit if no input data is available.
    if (totalInputSize === 0) {
        console.error("Error: Standard input stream is empty. No data to process.");
        process.exit(1); // Indicate an error occurred.
    }

    // Step 2: Allocate a buffer and read the entire content from stdin.
    const rawInputBuffer = Buffer.alloc(totalInputSize); // Explicitly allocate buffer.
    const effectiveBytesRead = ioHandler.readSync(STDIN_FILE_DESCRIPTOR, rawInputBuffer, 0, totalInputSize, 0);

    // Step 3: Convert the buffer content to a UTF-8 string and split it into individual lines.
    const inputContentString = rawInputBuffer.toString(UTF8_ENCODING, 0, effectiveBytesRead);
    const inputDataLines = inputContentString.split('\n');

    // Step 4: Validate the minimum number of input lines required.
    if (inputDataLines.length < 3) {
        console.error("Error: Insufficient input lines provided. Expected at least 3 lines (N, A B, C D).");
        process.exit(1);
    }

    // Step 5: Parse the numerical parameters from the processed input lines.
    // N (maximum divisor value) from the first line.
    const maxDivisorValue = parseInt(inputDataLines[0].trim(), 10);
    // Basic validation for N.
    if (isNaN(maxDivisorValue) || maxDivisorValue <= 0) {
        console.error(`Error: The first input line ('${inputDataLines[0].trim()}') must be a positive integer for the maximum divisor value.`);
        process.exit(1);
    }

    // A and B from the second line.
    const firstPairStringValues = inputDataLines[1].trim().split(' ');
    const operandA = parseInt(firstPairStringValues[0], 10);
    const operandB = parseInt(firstPairStringValues[1], 10);

    // C and D from the third line.
    const secondPairStringValues = inputDataLines[2].trim().split(' ');
    const operandC = parseInt(secondPairStringValues[0], 10);
    const operandD = parseInt(secondPairStringValues[1], 10);

    // Consolidated validation for all parsed operands.
    if ([operandA, operandB, operandC, operandD].some(val => isNaN(val))) {
        console.error("Error: Input values for operands A, B, C, D must all be valid integers.");
        process.exit(1);
    }

    // Initialize the variable to store the smallest combined distance found.
    let minimumCombinedDistance = INITIAL_MINIMUM_VALUE;

    // Step 6: Main computation loop. Iterate from 1 up to the maximum divisor value.
    for (let currentDivisor = 1; currentDivisor <= maxDivisorValue; ++currentDivisor) {
        // Calculate the custom distance for the first pair (A, B).
        const distanceAB = computeQuotientRemainderDistance(operandA, operandB, currentDivisor);

        // Calculate the custom distance for the second pair (C, D).
        const distanceCD = computeQuotientRemainderDistance(operandC, operandD, currentDivisor);

        // Sum the distances for the current divisor.
        const currentTotalDistance = distanceAB + distanceCD;

        // Update the overall minimum if the current total distance is smaller.
        if (currentTotalDistance < minimumCombinedDistance) {
            minimumCombinedDistance = currentTotalDistance;
        }
    }

    // Step 7: Output the final calculated minimum combined distance.
    console.log(minimumCombinedDistance);

} catch (processingError) {
    // Catch any unexpected errors during file system operations or parsing.
    console.error(`An unexpected error occurred during input processing or calculation: ${processingError.message}`);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}