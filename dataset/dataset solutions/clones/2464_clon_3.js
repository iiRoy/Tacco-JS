"use strict";

// --- Input Processing Module ---
// This self-executing function creates a factory for input data readers.
const InputProcessor = (function() {
    /**
     * Factory function to create a new data reader instance.
     * @param {string} rawInputString - The complete input as a single string.
     * @returns {DataReader} A new DataReader object.
     */
    function createInputReader(rawInputString) {
        return new DataReader(rawInputString);
    }

    /**
     * DataReader class: Manages parsing input lines and extracting various data types.
     * @class
     */
    function DataReader(inputSourceString) {
        // Internal storage for all input lines, split by newline and trimmed.
        // Each line will be further processed as needed.
        this._inputLines = inputSourceString.trim().split("\n");
        // Current line index being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next number (or string token) from the current line, consuming from right to left.
     * If the current line is exhausted, it moves to the next line.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number|null} The token, or null if no more input.
     */
    DataReader.prototype.readNextToken = function(returnAsString = false) {
        let currentLineData = this._inputLines[this._currentLineIndex];

        // Ensure currentLineData is an array of tokens, split and reversed if it hasn't been already.
        // This allows popping from the "right" (original last element) efficiently.
        if (typeof currentLineData === "string") {
            currentLineData = currentLineData.split(" ").reverse();
            this._inputLines[this._currentLineIndex] = currentLineData; // Update internal state
        }

        // Check if there are tokens left on the current line
        if (currentLineData && currentLineData.length > 0) {
            const extractedToken = currentLineData.pop(); // Get the "rightmost" (originally last) token

            // If the line is now empty, advance to the next line for future reads
            if (currentLineData.length === 0) {
                this._currentLineIndex++;
            }

            // Return based on the desired type
            return returnAsString ? extractedToken : Number(extractedToken);
        } else {
            // If the current line is exhausted or invalid, try the next one.
            // This handles cases where a line might have been empty from the start or completely consumed.
            this._currentLineIndex++;
            if (this._currentLineIndex < this._inputLines.length) {
                // Recursive call to try reading from the new line
                return this.readNextToken(returnAsString);
            }
            // No more input lines available
            return null; // Or throw an error, depending on desired behavior
        }
    };

    /**
     * Reads the entire current line, splits it by space, and returns elements as numbers or strings.
     * Advances the line index.
     * @param {boolean} [returnAsStringArray=false] - If true, returns string array; otherwise, number array.
     * @returns {Array<string|number>} An array of parsed elements from the line.
     */
    DataReader.prototype.readEntireLine = function(returnAsStringArray = false) {
        let lineContent = this._inputLines[this._currentLineIndex++];
        if (lineContent === undefined) {
            return []; // Return empty array if no more lines
        }
        // If it's an array, it means `readNextToken` has already processed it and reversed it.
        // Reverse it back to original order for `readEntireLine`.
        const tokens = Array.isArray(lineContent) ? lineContent.reverse() : lineContent.split(" ");
        
        if (returnAsStringArray) {
            return tokens;
        } else {
            // Explicitly convert each token to a number
            return tokens.map(token => Number(token));
        }
    };

    /**
     * Reads 'count' number of subsequent lines, splitting each into tokens.
     * Returns a 2D array (matrix) of numbers or strings. Advances line index by 'count'.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnAsStringMatrix=false] - If true, returns string matrix; otherwise, number matrix.
     * @returns {Array<Array<string|number>>} A 2D array of parsed elements.
     */
    DataReader.prototype.readMatrix = function(count, returnAsStringMatrix = false) {
        const matrixRows = [];
        const endIndex = this._currentLineIndex + count;
        // Iterate and read each line individually
        while (this._currentLineIndex < endIndex && this._currentLineIndex < this._inputLines.length) {
            matrixRows.push(this.readEntireLine(returnAsStringMatrix));
        }
        return matrixRows;
    };

    /**
     * Reads 'count' number of raw lines without splitting, returning them as strings or numbers.
     * Advances line index by 'count'.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnAsStringArray=false] - If true, returns string array; otherwise, number array.
     * @returns {Array<string|number>} An array of raw lines.
     */
    DataReader.prototype.readLinesRaw = function(count, returnAsStringArray = false) {
        const rawLines = [];
        const startIndex = this._currentLineIndex;
        const endIndex = Math.min(startIndex + count, this._inputLines.length);

        for (let i = startIndex; i < endIndex; i++) {
            const lineData = this._inputLines[i];
            // Ensure lineData is a string, even if it was previously an array from readNextToken.
            // If it's an array, join it back to a string for "raw" reading.
            const processedLine = Array.isArray(lineData) ? lineData.reverse().join(" ") : lineData;
            rawLines.push(returnAsStringArray ? processedLine : Number(processedLine));
        }
        this._currentLineIndex = endIndex; // Update the line index after reading
        return rawLines;
    };

    return createInputReader;
})();

// Instantiate the input reader with data from standard input.
const dataStream = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Modular Arithmetic Utilities ---
// The modulus value for all calculations.
const MODULUS_VALUE = 998244353;

/**
 * Calculates the product of multiple numbers modulo MODULUS_VALUE.
 * This function uses an optimized multiplication method to prevent overflow
 * when intermediate products exceed Number.MAX_SAFE_INTEGER, assuming
 * factors and modulus fit within 32-bit integers.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The modular product.
 */
function calculateModularProduct(...factors) {
    if (!factors || factors.length === 0) {
        return 1; // Product of no numbers is 1 (identity for multiplication)
    }
    let currentProduct = factors[0] % MODULUS_VALUE; // Start with the first factor, already modulo

    for (let i = 1; i < factors.length; i++) {
        let factor = factors[i] % MODULUS_VALUE; // Ensure current factor is also modulo

        // Optimized modular multiplication: (A * B) % M
        // Splits 'currentProduct' (A) into high (A_h) and low (A_l) parts: A = A_h * 2^16 + A_l
        // Then A * B = (A_h * 2^16 + A_l) * B = (A_h * B * 2^16) + (A_l * B)
        // This is done modulo M to prevent intermediate overflow.
        // Using `>>> 16` for unsigned right shift and `& 0xFFFF` for low 16 bits.
        const highPartA = currentProduct >>> 16; // A_h
        const lowPartA = currentProduct & 0xFFFF; // A_l

        const term1 = (highPartA * factor) % MODULUS_VALUE; // (A_h * B) % M
        const term2 = (lowPartA * factor) % MODULUS_VALUE; // (A_l * B) % M

        // Combine terms: (term1 * 2^16 + term2) % M
        currentProduct = (calculateModularProduct(term1, 65536) + term2) % MODULUS_VALUE;
    }
    // Ensure the result is non-negative
    return (currentProduct + MODULUS_VALUE) % MODULUS_VALUE;
}

// Cache for precomputed factorials (n!) and their modular inverses.
let currentFactorial = 1; // Stores n! % MODULUS_VALUE for the largest n precomputed
const inverseFactorialsCache = []; // Stores (i!)^-1 % MODULUS_VALUE

/**
 * Precomputes factorials and their modular inverses up to a given limit.
 * This function handles two different precomputation strategies based on the limit.
 * It populates `currentFactorial` and `inverseFactorialsCache`.
 * @param {number} limitValue - The upper limit for precomputation.
 */
function precomputeFactorials(limitValue) {
    // A heuristic threshold for switching between iterative calculation and a precomputed value.
    // The original code used 8500000. This is kept as a specific constant, but renamed and commented.
    const PRECOMPUTATION_THRESHOLD = 8500000;

    // Initialize cache for inverses with base cases.
    // 0! = 1, (0!)^-1 = 1
    // 1! = 1, (1!)^-1 = 1
    inverseFactorialsCache.length = limitValue + 1; // Ensure array size
    inverseFactorialsCache[0] = 1;
    inverseFactorialsCache[1] = 1;

    let startingFactorialValue = 1;
    let startingIndex = 2;

    if (limitValue >= PRECOMPUTATION_THRESHOLD) {
        // For larger limits, the original code used a hardcoded value for 8500000!
        // This implies some prior knowledge or a specific problem constraint.
        // We'll use this precomputed value and continue from there.
        startingFactorialValue = 488985182; // This is a magic number derived from the original context.
        startingIndex = PRECOMPUTATION_THRESHOLD + 1;
    }

    // Calculate factorials iteratively.
    for (let i = startingIndex; i <= limitValue; i++) {
        startingFactorialValue = calculateModularProduct(startingFactorialValue, i);
    }
    currentFactorial = startingFactorialValue; // Store the largest factorial calculated.

    // Calculate the modular inverse of the largest factorial.
    inverseFactorialsCache[limitValue] = modularInverse(currentFactorial);

    // Calculate inverse factorials for smaller numbers by working backwards.
    // (i-1)!^-1 = i!^-1 * i
    for (let i = limitValue; i >= 2; i--) {
        inverseFactorialsCache[i - 1] = calculateModularProduct(inverseFactorialsCache[i], i);
    }
}

/**
 * Computes the modular multiplicative inverse of 'num' modulo MODULUS_VALUE
 * using the Extended Euclidean Algorithm.
 * Assumes MODULUS_VALUE is a prime number.
 * @param {number} num - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'num'.
 */
function modularInverse(num) {
    let currentA = num;
    let currentB = MODULUS_VALUE;
    let xCoefficient0 = 1, yCoefficient0 = 0; // Coefficients for 'currentA'
    let xCoefficient1 = 0, yCoefficient1 = 1; // Coefficients for 'currentB'

    while (currentB !== 0) {
        const quotient = Math.floor(currentA / currentB);
        let tempA = currentA;
        currentA = currentB;
        currentB = tempA % currentB;

        let tempX = xCoefficient0;
        xCoefficient0 = xCoefficient1;
        xCoefficient1 = tempX - quotient * xCoefficient1;

        let tempY = yCoefficient0;
        yCoefficient0 = yCoefficient1;
        yCoefficient1 = tempY - quotient * yCoefficient1;
    }

    // At this point, 'currentA' is the GCD(num, MODULUS_VALUE).
    // If GCD is not 1, inverse doesn't exist (or MODULUS_VALUE is not prime, which is assumed).
    // xCoefficient0 is the inverse. Ensure it's positive.
    return (xCoefficient0 % MODULUS_VALUE + MODULUS_VALUE) % MODULUS_VALUE;
}

/**
 * Computes (base^exponent) % MODULUS_VALUE using binary exponentiation (exponentiation by squaring).
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of (base^exponent) % MODULUS_VALUE.
 */
function modularExponentiation(base, exponent) {
    let resultPower = 1;
    let currentBase = base % MODULUS_VALUE; // Ensure base is within modulus range

    // Handle negative exponent (if context allowed, though usually not for standard modular arithmetic)
    if (exponent < 0) {
        // For example, if we need a^-n, it's (a^-1)^n
        currentBase = modularInverse(currentBase);
        exponent = Math.abs(exponent);
    }

    while (exponent > 0) {
        // If exponent is odd, multiply result by current base
        if (exponent % 2 === 1) { // Equivalent to (exponent & 1)
            resultPower = calculateModularProduct(resultPower, currentBase);
        }
        // Square the current base
        currentBase = calculateModularProduct(currentBase, currentBase);
        // Halve the exponent
        exponent = Math.floor(exponent / 2); // Equivalent to (exponent >>= 1)
    }
    return resultPower;
}

/**
 * Computes combinations (nCr) modulo MODULUS_VALUE.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 % MODULUS_VALUE.
 * Requires `precomputeFactorials` to have been called for `n`.
 * @param {number} totalItems - The total number of items (n).
 * @param {number} itemsToChoose - The number of items to choose (r).
 * @returns {number} The result of nCr % MODULUS_VALUE.
 */
function combinationsMod(totalItems, itemsToChoose) {
    // Basic input validation for combinations
    if (itemsToChoose < 0 || itemsToChoose > totalItems) {
        return 0; // Cannot choose a negative number of items or more items than available
    }
    if (itemsToChoose === 0 || itemsToChoose === totalItems) {
        return 1; // nC0 = 1, nCn = 1
    }
    // Optimization: nCr = nC(n-r)
    if (itemsToChoose > totalItems / 2) {
        itemsToChoose = totalItems - itemsToChoose;
    }

    // nCr = n! * (r!)^-1 * ((n-r)!)^-1
    // We rely on `precomputeFactorials(totalItems)` having been called earlier.
    // This ensures `currentFactorial` (n!) and `inverseFactorialsCache` are populated.
    
    // Check for precomputation coverage (guard clause)
    if (inverseFactorialsCache.length <= totalItems || inverseFactorialsCache[itemsToChoose] === undefined) {
        // This indicates precomputation was insufficient. In a real scenario,
        // one might re-run precomputeFactorials or throw an error.
        // For this specific problem structure, precomputeFactorials is called with `inputN` first,
        // so this check should ideally pass.
        console.error("Error: Factorials not precomputed up to required totalItems or itemsToChoose.");
        return 0; // Or handle error appropriately
    }

    const numeratorFactorial = currentFactorial; // This is n!
    const invDenominator1 = inverseFactorialsCache[itemsToChoose]; // This is (r!)^-1
    const invDenominator2 = inverseFactorialsCache[totalItems - itemsToChoose]; // This is ((n-r)!)^-1

    let result = calculateModularProduct(numeratorFactorial, invDenominator1);
    result = calculateModularProduct(result, invDenominator2);

    return result;
}

// --- Main Problem Solver ---
/**
 * Solves the main problem logic.
 * Reads input N, calculates a sum involving powers of 3 and combinations,
 * and returns the final result modulo MODULUS_VALUE.
 * @returns {number} The final calculated answer.
 */
function solveProblem() {
    // Read the single integer input N.
    const inputN = dataStream.readNextToken();

    // The problem asks for (3^N - sum(C(N, i) * 2^(N-i+1))) % MOD
    // Initial answer component is 3^N % MOD.
    let finalResult = modularExponentiation(3, inputN);

    // Precompute factorials and their inverses up to N, as required for combinations.
    precomputeFactorials(inputN);

    let powerOfTwoAccumulator = 1; // This variable will accumulate powers of 2.
                                   // It represents 2^(N-i+1) in the sum, starting from 2^1.
                                   // The original loop structure implies `p2` becomes `2^(N-i+1)` for each `i`.

    // The loop iterates from `inputN` down to `floor(inputN / 2) + 1`.
    // Example: if N=5, i goes 5, 4, 3. floor(5/2)=2. Loop `i > 2`.
    // Example: if N=4, i goes 4, 3. floor(4/2)=2. Loop `i > 2`.
    const halfNFloor = Math.floor(inputN / 2);
    for (let currentIdx = inputN; currentIdx > halfNFloor; currentIdx--) {
        // Double `powerOfTwoAccumulator` modulo MODULUS_VALUE for the next iteration.
        // This is equivalent to `powerOfTwoAccumulator = (powerOfTwoAccumulator * 2) % MODULUS_VALUE;`
        powerOfTwoAccumulator = calculateModularProduct(powerOfTwoAccumulator, 2);

        // Calculate the term to subtract for the current `currentIdx`: C(N, currentIdx) * powerOfTwoAccumulator
        const termToSubtract = calculateModularProduct(combinationsMod(inputN, currentIdx), powerOfTwoAccumulator);

        // Subtract the term from the final result, ensuring non-negative modulo result.
        finalResult = (finalResult - termToSubtract + MODULUS_VALUE) % MODULUS_VALUE;
    }

    // Ensure the final result is non-negative before returning.
    return (finalResult + MODULUS_VALUE) % MODULUS_VALUE;
}

// Execute the main problem-solving function and print its output to the console.
console.log(solveProblem());