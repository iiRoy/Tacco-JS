const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input as a UTF-8 string.

/**
 * Computes (baseVal ^ exponentVal) modulo primeModulus using binary exponentiation (exponentiation by squaring).
 * This function is optimized for BigInts.
 * @param {bigint} baseVal - The base number.
 * @param {bigint} exponentVal - The exponent.
 * @returns {bigint} The result of (baseVal ^ exponentVal) % primeModulus.
 */
function powerModulo(baseVal, exponentVal) {
    let resultAccumulator = 1n; // Initialize the result to 1 (multiplicative identity).
    let currentBase = baseVal;  // Use a temporary variable for the base.

    // Loop while the exponent is positive.
    while (exponentVal > 0n) {
        // If the least significant bit of the exponent is 1 (i.e., exponentVal is odd).
        if (exponentVal & 1n) {
            resultAccumulator = (resultAccumulator * currentBase) % primeModulus;
        }
        // Square the current base and take modulo.
        currentBase = (currentBase * currentBase) % primeModulus;
        // Right shift the exponent by 1 (equivalent to integer division by 2).
        exponentVal >>= 1n;
    }
    return resultAccumulator;
}

/**
 * Calculates the modular multiplicative inverse of a number 'val' modulo 'primeModulus'.
 * It uses Fermat's Little Theorem, which states that for a prime modulus 'p',
 * a^(p-2) % p is the modular inverse of 'a' (if 'a' is not a multiple of 'p').
 * @param {bigint} val - The number for which to find the inverse.
 * @returns {bigint} The modular inverse of 'val'.
 */
function modularInverse(val) {
    // The modular inverse of 1 is always 1.
    if (val === 1n) {
        return 1n;
    }
    // Apply Fermat's Little Theorem.
    return powerModulo(val, primeModulus - 2n);
}

// Define the prime modulus used for all calculations.
const primeModulus = 998244353n;

// This is an Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
((inputContent) => {
    // Split the entire input string into an array of individual lines.
    const inputLines = inputContent.split('\n');
    // Parse the first line, splitting by space and converting parts to BigInts.
    let [numElements, multiplierVal, limitK] = inputLines[0].split(' ').map(BigInt);

    let finalAnswer = 0n; // Initialize the variable to store the final accumulated answer.
    let factorialA = 1n;  // Accumulator for the first factorial-like term.
    let factorialB = 1n;  // Accumulator for the second factorial-like term.

    // Iterate from 0 up to and including limitK.
    for (let loopCounter = 0n; loopCounter <= limitK; loopCounter++) {
        // Update factorialA. The (loopCounter || 1n) handles the k=0 case, making it 1.
        // The original code had a commented-out modulo here, so we omit it.
        factorialA = factorialA * (loopCounter || 1n);

        // Update factorialB, applying modulo at each step.
        // (numElements - (loopCounter || (numElements - 1n))) handles the k=0 case.
        factorialB = (factorialB * (numElements - (loopCounter || (numElements - 1n)))) % primeModulus;
        
        // Calculate an intermediate term: factorialB multiplied by the modular inverse of factorialA.
        // We take modulo here to keep the intermediate value within bounds.
        let intermediateTerm = (factorialB * modularInverse(factorialA)) % primeModulus;
        
        // Calculate the current term to be added to the final answer.
        // This involves modular exponentiation and multiplication, with modulo applied at the end of the term.
        let currentTerm = (intermediateTerm * powerModulo((multiplierVal - 1n), (numElements - (loopCounter + 1n))) % primeModulus * multiplierVal) % primeModulus;
        
        // Add the current term to the final answer. The finalAnswer itself is not taken modulo primeModulus
        // at each step, only the term being added is.
        finalAnswer = finalAnswer + currentTerm;
    }

    // Output the final answer, ensuring it's modulo primeModulus, and convert it to a string.
    console.log((finalAnswer % primeModulus).toString());
 
})(rawData); // Pass the raw input data to the IIFE.
