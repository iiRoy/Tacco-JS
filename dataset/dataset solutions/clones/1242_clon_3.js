// This module facilitates numerical computations involving large integers obtained from standard input.
// It performs and presents three distinct division outcomes:
// 1. Mathematical floor division (rounds towards negative infinity).
// 2. The standard BigInt remainder.
// 3. The standard BigInt truncating division (rounds towards zero).

const operatingSystemInterface = require('node:fs'); // Utilizing the Node.js file system module for I/O.
const standardInputPath = '/dev/stdin'; // Defines the source for input data.
const textDataEncoding = 'utf8'; // Specifies the character encoding for input interpretation.

/**
 * Computes the mathematical floor division for two BigInt numbers.
 * This function correctly handles negative numbers, ensuring the result
 * is always rounded towards negative infinity, consistent with Math.floor.
 *
 * @param {bigint} numeratorValue The dividend.
 * @param {bigint} denominatorValue The divisor.
 * @returns {bigint} The result of the floor division.
 * @throws {Error} If division by zero is attempted.
 */
function calculateBigIntFloorDivision(numeratorValue, denominatorValue) {
    // Implement a crucial guard clause to prevent division by zero,
    // which would otherwise lead to a runtime error.
    if (denominatorValue === 0n) {
        throw new Error('Attempted division by zero: The divisor cannot be zero.');
    }

    // Perform the standard BigInt division, which truncates towards zero.
    const truncatingQuotient = numeratorValue / denominatorValue;
    // Calculate the remainder of the BigInt division.
    const computedRemainder = numeratorValue % denominatorValue;

    // If there's a non-zero remainder and the numerator and denominator have
    // different signs, the standard BigInt division (truncating) will have
    // rounded towards zero when floor division requires rounding towards
    // negative infinity. In such cases, we need to subtract 1 from the quotient.
    // Example: -7n / 3n results in -2n (truncating). Floor division should be -3n.
    if (computedRemainder !== 0n && ((numeratorValue < 0n) !== (denominatorValue < 0n))) {
        return truncatingQuotient - 1n;
    }

    // Otherwise, the truncating division already matches the floor division.
    return truncatingQuotient;
}

// Main execution block: Orchestrates the input reading, processing, and output generation.
try {
    // Read the entire content from the standard input as a string.
    const rawInputBufferContents = operatingSystemInterface.readFileSync(standardInputPath, textDataEncoding);

    // Split the input string by spaces to obtain an array of string representations of numbers.
    const numberStringComponents = rawInputBufferContents.split(' ');

    // Validate the input format to ensure exactly two numbers were provided.
    // This is an added robustness check.
    if (numberStringComponents.length !== 2) {
        console.error("Input parsing failed: Expected two space-separated numeric values.");
        process.exit(1); // Terminate with an error code.
    }

    // Convert the string components into BigInt values for arbitrary precision arithmetic.
    const primaryDividend = BigInt(numberStringComponents[0]); // Explicit conversion for the first number.
    const secondaryDivisor = BigInt(numberStringComponents[1]); // Explicit conversion for the second number.

    // Calculate the required results using the custom helper function and BigInt operators.
    const resultantFloorDivision = calculateBigIntFloorDivision(primaryDividend, secondaryDivisor);
    const resultantRemainder = primaryDividend % secondaryDivisor; // Standard BigInt remainder operation.
    const resultantTruncatingDivision = primaryDividend / secondaryDivisor; // Standard BigInt truncating division.

    // Construct the final output string using a template literal for clear formatting.
    // The results are space-separated as per common competitive programming output styles.
    const formattedOutputString = `${resultantFloorDivision} ${resultantRemainder} ${resultantTruncatingDivision}`;

    // Print the composed output string to standard output.
    console.log(formattedOutputString);

} catch (operationError) {
    // Catch and report any errors that occur during file operations or calculations.
    console.error(`An unexpected runtime error occurred: ${operationError.message}`);
    process.exit(1); // Terminate with an error code upon encountering an exception.
}

// End of script execution.