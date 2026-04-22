const PRIMARY_MODULUS_VALUE = 1000000007;

/**
 * Computes the modular exponentiation (base ^ exponent) % modulus
 * using an iterative binary exponentiation algorithm.
 * All core arithmetic operations are performed with BigInts to prevent
 * potential overflow issues with large intermediate products,
 * especially when the base or modulus are large.
 *
 * @param {number} initialBase The base value for the exponentiation.
 * @param {number} powerExponent The exponent value.
 * @param {number} modulusValue The modulus by which the result is divided.
 * @returns {number} The final computed result, converted back to a standard JavaScript number.
 */
function computeModularPower(initialBase, powerExponent, modulusValue) {
    // --- Input validation and edge case handling ---

    // Ensure the modulus is a positive integer.
    if (modulusValue <= 0) {
        console.error("Error: The modulus for modular exponentiation must be a positive integer.");
        return NaN; // Indicate an invalid computation.
    }

    // If the exponent is zero, any non-zero base to the power of zero is 1.
    // 0^0 is typically undefined or 1 depending on context; here we assume 1.
    if (powerExponent === 0) {
        return 1;
    }

    // If the base is zero, 0 to any positive power is 0.
    if (initialBase === 0) {
        return 0;
    }

    // --- Convert inputs to BigInt for safe arithmetic ---
    let currentBase = BigInt(initialBase);
    let currentExponent = BigInt(powerExponent);
    const effectiveModulus = BigInt(modulusValue);

    // Optimize: Reduce the base modulo the modulus from the start.
    // This keeps the base value within manageable limits throughout the calculation.
    currentBase %= effectiveModulus;

    // Initialize an accumulator for the final result.
    // It starts at 1 because anything multiplied by 1 doesn't change value,
    // and this serves as the identity element for multiplication.
    let resultAccumulator = 1n; // 'n' suffix denotes a BigInt literal.

    // --- Iterative Binary Exponentiation Algorithm ---
    // This loop processes the exponent bit by bit (from right to left).
    // If a bit is 1, it means that power of the base contributes to the product.
    while (currentExponent > 0n) {
        // Check if the least significant bit of the exponent is 1 (i.e., exponent is odd).
        if ((currentExponent % 2n) === 1n) {
            // If odd, multiply the current `resultAccumulator` by `currentBase` and take modulo.
            // This incorporates the current power of the base into the final result.
            resultAccumulator = (resultAccumulator * currentBase) % effectiveModulus;
        }

        // Square the `currentBase` and take modulo.
        // This prepares the base for the next bit of the exponent (effectively `base^(2^k)`).
        currentBase = (currentBase * currentBase) % effectiveModulus;

        // Right-shift the exponent by one bit (integer division by 2).
        // This moves to the next bit of the exponent for processing.
        currentExponent /= 2n;
    }

    // Convert the BigInt result back to a standard JavaScript number.
    // This is safe as long as the modulus result fits within `Number.MAX_SAFE_INTEGER`.
    return Number(resultAccumulator);
}

// --- Main script execution flow ---

// Retrieve the File System module for input operations.
const fileSystem = require('fs');

// Define the standard input file path, common in competitive programming environments.
const standardInputFilePath = '/dev/stdin';

let rawInputString; // Variable to hold the raw text data read from the input source.
try {
    // Synchronously read the content of the standard input file.
    // 'utf8' encoding ensures the data is read as a human-readable string.
    rawInputString = fileSystem.readFileSync(standardInputFilePath, 'utf8');
} catch (readOperationError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and terminate the program gracefully.
    console.error("Error reading input from standard input file:", readOperationError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// --- Input parsing and validation ---

// Remove any leading or trailing whitespace from the raw input string,
// then split it into an array of string tokens using space as a delimiter.
const inputTokens = rawInputString.trim().split(" ");

// Basic validation: Check if at least two numeric tokens were provided.
// We expect a base and an exponent.
if (inputTokens.length < 2) {
    console.error("Input format error: Expected at least two space-separated numbers (base and exponent).");
    process.exit(1);
}

// Parse the string tokens into integer numbers.
// `parseInt` with radix 10 ensures proper decimal conversion.
const parsedBase = parseInt(inputTokens[0], 10);
const parsedExponent = parseInt(inputTokens[1], 10);

// Further validation: Check if the parsed values are indeed valid numbers.
if (isNaN(parsedBase) || isNaN(parsedExponent)) {
    console.error("Input parsing error: Base and exponent must be valid integers.");
    process.exit(1);
}

// --- Computation and Output ---

// Call the modular power function with the parsed inputs and the predefined modulus.
const finalComputedAnswer = computeModularPower(parsedBase, parsedExponent, PRIMARY_MODULUS_VALUE);

// Print the final result to standard output.
console.log(finalComputedAnswer);