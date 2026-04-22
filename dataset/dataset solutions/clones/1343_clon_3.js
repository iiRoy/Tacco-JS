// This module provides a robust method for calculating modular exponentiation (a^b mod n).
// It leverages the "square and multiply" algorithm, which efficiently computes powers
// by iteratively squaring the base and multiplying only when the corresponding bit
// in the exponent is set. For example, a^22 = a^(10110 in binary) = a^16 * a^4 * a^2.
function computeModularExponentiation(baseTerm, exponentFactor, moduloDivisor) {
    // Validate inputs for robustness
    if (moduloDivisor <= 0n) {
        throw new Error("Modulo divisor must be a positive BigInt.");
    }
    if (moduloDivisor === 1n) {
        return 0n; // Any number modulo 1 is 0
    }
    if (exponentFactor < 0n) {
        // For negative exponents, one would typically calculate (a^(-b)) mod n = (a^(b))^(-1) mod n.
        // This requires modular inverse, which is not part of the current algorithm's scope.
        throw new Error("Negative exponents are not supported by this modular exponentiation implementation.");
    }
    if (exponentFactor === 0n) {
        return 1n; // a^0 = 1 for any a (even 0^0 is often defined as 1 in modular arithmetic contexts)
    }

    let accumulatorResult = 1n; // Initialize the result accumulator
    let currentBase = baseTerm % moduloDivisor; // Ensure base is within modulo range from the start

    // The main loop processes the exponent bit by bit
    while (exponentFactor > 0n) {
        // If the least significant bit of the exponent is 1, multiply the current result
        // by the current base (which is a^(2^k) for some k)
        if (exponentFactor % 2n === 1n) {
            let intermediateProduct = accumulatorResult * currentBase; // Intermediate step
            accumulatorResult = intermediateProduct % moduloDivisor;
        }

        // Square the base for the next iteration (effectively a^(2*k) -> a^(4*k))
        let squaredBase = currentBase * currentBase; // Intermediate step
        currentBase = squaredBase % moduloDivisor;

        // Right shift the exponent by 1 bit (equivalent to dividing by 2)
        exponentFactor = exponentFactor / 2n; // Or exponentFactor >>= 1n;
    }

    return accumulatorResult; // Return the final computed modular power
}

// This constant defines the standard modulus used in the problem, typically a large prime.
const PROGRAM_MODULUS_VALUE = 1000000007n;

// Orchestrates the program's logic: reading input, parsing, calculating, and printing output.
function executeProgramLogic(rawInputData) {
    // Basic input validation
    if (!rawInputData || rawInputData.trim().length === 0) {
        console.error("Error: No input data provided.");
        return;
    }

    const inputLines = rawInputData.split("\n"); // Split the entire input string into an array of lines

    // Ensure there's at least one line of input data
    if (inputLines.length === 0 || inputLines[0].trim().length === 0) {
        console.error("Error: Input data is empty or malformed.");
        return;
    }

    const parsedNumbersString = inputLines[0].split(" "); // Get the first line and split it by space

    // Validate that we have exactly two numbers on the first line
    if (parsedNumbersString.length < 2) {
        console.error("Error: Insufficient numbers provided on the first line. Expected two.");
        return;
    }

    // Parse the numbers from string to integer, performing validation
    const firstNumStr = parsedNumbersString[0];
    const secondNumStr = parsedNumbersString[1];

    const parsedFirstNumber = parseInt(firstNumStr, 10);
    const parsedSecondNumber = parseInt(secondNumStr, 10);

    // Check if parsing was successful
    if (isNaN(parsedFirstNumber) || isNaN(parsedSecondNumber)) {
        console.error("Error: Failed to parse numbers from input. Please provide valid integers.");
        return;
    }

    // Convert the parsed integers to BigInt for large number arithmetic
    const initialBase = BigInt(parsedFirstNumber);
    const initialExponent = BigInt(parsedSecondNumber);

    let finalResult;
    try {
        // Perform the modular exponentiation calculation
        finalResult = computeModularExponentiation(initialBase, initialExponent, PROGRAM_MODULUS_VALUE);
        console.log(finalResult.toString()); // Output the result as a string
    } catch (calculationError) {
        console.error(`An error occurred during calculation: ${calculationError.message}`);
    }
}

// This section handles reading from standard input and invoking the main logic.
// It should remain untouched for typical competitive programming environments.
executeProgramLogic(require("fs").readFileSync("/dev/stdin", "utf8"));