/**
 * Orchestrates the main program flow, parsing input and calculating the modular power.
 * This function reads numerical parameters from the provided raw input string,
 * defines key constants for modular arithmetic, and then invokes a specialized
 * modular exponentiation function to compute the result.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
    // --- Input Processing and Validation ---
    // Basic check for empty or invalid input data.
    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Error: Provided input data is empty, null, or not a string.");
        return; // Terminate execution if input is unusable.
    }

    // Split the raw input into individual lines and clean up whitespace.
    const cleanedLines = rawData.trim().split("\n");
    if (cleanedLines.length === 0) {
        console.error("Error: No meaningful data lines found after processing input.");
        return;
    }

    // Extract the first line which should contain the base and exponent values.
    const firstLineParts = cleanedLines[0].split(" ");
    if (firstLineParts.length < 2) {
        console.error("Error: The first line of input does not contain sufficient numerical parameters (expected at least two).");
        return;
    }

    // Parse the base value (originally 'm').
    const baseValStr = firstLineParts[0];
    const baseVal = parseInt(baseValStr, 10);
    if (isNaN(baseVal)) {
        console.error(`Error: Failed to parse the base value from input string: '${baseValStr}'.`);
        return;
    }

    // Parse the exponent value (originally 'n').
    const exponentValStr = firstLineParts[1];
    const exponentVal = parseInt(exponentValStr, 10);
    // Validate that the exponent is a non-negative integer.
    if (isNaN(exponentVal) || exponentVal < 0) {
        console.error(`Error: Failed to parse a valid non-negative exponent value from input string: '${exponentValStr}'.`);
        return;
    }

    // --- Define Program Constants ---
    // Define a large prime modulus, frequently used in modular arithmetic problems
    // to keep results within a manageable range and prevent overflow.
    const modulusP = 1000000000 + 7; // Equivalent to 1e9 + 7

    // Define a splitting factor used within the modular multiplication algorithm.
    // This helps in breaking down large multiplication into smaller parts
    // to avoid intermediate overflows before applying the modulo.
    const modSplitter = 500000; // Equivalent to 1e5 * 5

    // --- Core Calculation and Output ---
    // Execute the modular exponentiation to compute (baseVal ^ exponentVal) % modulusP.
    // The specialized `computeModularPower` function handles this efficiently.
    const finalCalculatedPower = computeModularPower(baseVal, exponentVal, modulusP, modSplitter);

    // Output the final computed result to the console.
    console.log(finalCalculatedPower);
}

/**
 * Computes (baseNum ^ powerExp) % moduloVal efficiently using modular exponentiation
 * (also known as binary exponentiation or exponentiation by squaring).
 * It uses the `performModularMultiplication` helper for all multiplication operations.
 * @param {number} baseNum - The base number.
 * @param {number} powerExp - The exponent. Must be a non-negative integer.
 * @param {number} moduloVal - The modulus for the operation.
 * @param {number} splitFactor - An auxiliary factor for modular multiplication.
 * @returns {number} The result of (baseNum ^ powerExp) % moduloVal.
 */
function computeModularPower(baseNum, powerExp, moduloVal, splitFactor) {
    // Normalize the base to be within the modulo range from the start.
    // This handles cases where baseNum might be negative or larger than moduloVal.
    let currentBase = baseNum % moduloVal;
    if (currentBase < 0) { // Ensure result is positive if baseNum was negative
        currentBase += moduloVal;
    }

    let finalResult = 1; // Initialize the result. For any x, x^0 = 1.
    let tempExponent = powerExp; // Use a temporary variable to manipulate the exponent without altering the original.

    // --- Guard Clauses for Edge Cases ---
    // If the exponent is 0, the result is 1 (as initialized).
    if (tempExponent === 0) {
        return finalResult;
    }
    // If the exponent is 1, the result is the base modulo the modulus.
    if (tempExponent === 1) {
        return currentBase;
    }

    // --- Binary Exponentiation Loop ---
    // Iterate while the temporary exponent is greater than zero.
    // This loop processes the exponent's binary representation from right to left.
    while (tempExponent > 0) {
        // Check if the least significant bit of the exponent is 1.
        // If it is, this means the current power of `currentBase` contributes to the `finalResult`.
        if ((tempExponent & 1) === 1) {
            // Multiply the accumulated `finalResult` by `currentBase` (which is baseNum^(2^k))
            // and apply modulo at each step using the helper function.
            finalResult = performModularMultiplication(finalResult, currentBase, moduloVal, splitFactor);
        }

        // Square the `currentBase` for the next iteration.
        // `currentBase` effectively becomes baseNum^(2^(k+1)) from baseNum^(2^k).
        currentBase = performModularMultiplication(currentBase, currentBase, moduloVal, splitFactor);

        // Right-shift the exponent by 1 bit, equivalent to integer division by 2.
        // This moves to the next bit of the exponent.
        tempExponent >>= 1;
    }

    return finalResult;
}

/**
 * Performs modular multiplication (factorX * factorY) % modulusZ
 * using a specific optimization involving `splitDivisor`.
 * This method helps prevent intermediate overflow when `factorX * factorY` might
 * exceed standard JavaScript number limits before the modulo operation.
 * It's based on the identity: (A * B) % M = ( (A * (B_q * S)) % M + (A * B_r) % M ) % M
 * where B = B_q * S + B_r, B_q = floor(B / S), B_r = B % S.
 * @param {number} factorX - The first operand.
 * @param {number} factorY - The second operand.
 * @param {number} modulusZ - The modulus.
 * @param {number} splitDivisor - The divisor used to split `factorY`.
 * @returns {number} The result of (factorX * factorY) % modulusZ.
 */
function performModularMultiplication(factorX, factorY, modulusZ, splitDivisor) {
    let quotientPart, remainderPart;
    let intermediateProduct1, intermediateProduct2;
    let finalCalculatedValue;

    // Calculate the quotient part of factorY when divided by splitDivisor.
    // Math.floor ensures an integer result.
    quotientPart = Math.floor(factorY / splitDivisor);

    // Calculate the remainder part of factorY.
    remainderPart = factorY - (quotientPart * splitDivisor);

    // --- First part of the multiplication: (factorX * quotientPart * splitDivisor) % modulusZ ---
    // Apply modulo at each multiplication step to prevent potential overflow.
    intermediateProduct1 = (factorX * quotientPart);
    intermediateProduct1 %= modulusZ; // (A * B_q) % M
    intermediateProduct1 *= splitDivisor;
    intermediateProduct1 %= modulusZ; // ((A * B_q) % M * S) % M

    // --- Second part of the multiplication: (factorX * remainderPart) % modulusZ ---
    // Apply modulo to the second product.
    intermediateProduct2 = (factorX * remainderPart);
    intermediateProduct2 %= modulusZ; // (A * B_r) % M

    // Sum the two intermediate products and apply the final modulo.
    finalCalculatedValue = (intermediateProduct1 + intermediateProduct2);
    finalCalculatedValue %= modulusZ;

    // Ensure the final result is non-negative, as JavaScript's % operator can yield negative results
    // if the dividend is negative.
    if (finalCalculatedValue < 0) {
        finalCalculatedValue += modulusZ;
    }

    return finalCalculatedValue;
}

// --- Program Entry Point ---
// This block handles reading input from standard input and initiating the main processing.
// It includes a basic error handling mechanism for file system operations.
try {
    const fileSystem = require("fs");
    // Synchronously read the entire content of standard input as a UTF-8 string.
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Pass the acquired input content to the main processing function.
    ProcessInput(inputContent);
} catch (error) {
    // Log an error if reading from /dev/stdin fails (e.g., file not found, permissions).
    console.error("Failed to read input from /dev/stdin:", error.message);
    // In a real-world scenario, one might provide default input or exit gracefully here.
}