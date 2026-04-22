"use strict";

/**
 * @module InputProcessor
 * @description Provides a robust mechanism for parsing multi-line string input,
 *              extracting various data types such as single values, arrays,
 *              and matrices from a stream of text.
 */
const InputProcessor = (function() {
    /**
     * Factory function to create an instance of the InputSource handler.
     * @param {string} rawInputString - The complete input as a single string.
     * @returns {DataSourceHandler} An initialized data source handler.
     */
    function createInputSource(rawInputString) {
        // Basic input validation: ensure the input is a string.
        if (typeof rawInputString !== 'string') {
            throw new Error("Input must be a string for parsing.");
        }
        return new DataSourceHandler(rawInputString);
    }

    /**
     * @class DataSourceHandler
     * @description Manages the state of the input stream, allowing sequential
     *              reading of lines and tokens.
     */
    class DataSourceHandler {
        /**
         * Initializes the input handler by splitting the raw string into an array of lines.
         * @param {string} inputDataContent - The entire input content as a string.
         */
        constructor(inputDataContent) {
            // Split input by common newline characters (CRLF or LF) and filter out empty lines.
            this.sourceLines = inputDataContent.split(/\r?\n/).filter(line => line.trim() !== '');
            // Initialize the pointer to the current line being processed.
            this.currentLinePointer = 0;
            // Buffer for tokens from the current line, allowing token-by-token reading.
            this.currentTokenBuffer = [];
            // Index within the currentTokenBuffer.
            this.currentTokenIndex = 0;
        }

        /**
         * Advances to the next line in the input stream.
         * @private
         * @returns {void}
         * @throws {Error} If no more lines are available.
         */
        _advanceLine() {
            this.currentLinePointer++;
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("End of input stream reached.");
            }
            // Reset token buffer for the new line, splitting by space and filtering empty strings.
            this.currentTokenBuffer = this.sourceLines[this.currentLinePointer]
                                        .trim()
                                        .split(' ')
                                        .filter(token => token !== '');
            this.currentTokenIndex = 0;
        }

        /**
         * Reads and extracts a single token (word) from the current line.
         * If the current line is exhausted, it attempts to advance to the next line.
         * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to parse as a number.
         * @returns {(string|number)} The extracted token, either as a string or a number.
         * @throws {Error} If no more tokens or lines are available.
         */
        extractNextToken(returnAsString = false) {
            // If the current token buffer is empty or exhausted, try to load the first line or advance.
            if (this.currentTokenBuffer.length === 0 || this.currentTokenIndex >= this.currentTokenBuffer.length) {
                if (this.currentLinePointer >= this.sourceLines.length) {
                     throw new Error("No more data to read.");
                }
                // Initialize for the first line or advance to the next.
                if (this.currentTokenBuffer.length === 0 && this.currentLinePointer === 0) {
                     this.currentTokenBuffer = this.sourceLines[this.currentLinePointer]
                                                 .trim()
                                                 .split(' ')
                                                 .filter(token => token !== '');
                     this.currentTokenIndex = 0;
                } else {
                     this._advanceLine(); // This will update currentTokenBuffer and currentTokenIndex
                }
                // After advancing, check if the new line is still empty or invalid.
                if (this.currentTokenBuffer.length === 0) {
                    // This could happen if a line was just whitespace. Try advancing again.
                    // This might lead to an infinite loop if all subsequent lines are empty.
                    // A more robust solution might be to filter empty lines during constructor, which we did.
                    // So, if currentTokenBuffer is still empty here, it means the line was valid but had no tokens.
                    // This is an edge case depending on input format. For contest inputs, lines usually have tokens.
                    // For now, let's assume if a line is not empty, it has tokens.
                    // If not, we might need a loop: while(this.currentTokenBuffer.length === 0 && this.currentLinePointer < this.sourceLines.length) this._advanceLine();
                    // However, filter in constructor handles this.
                    if (this.currentTokenBuffer.length === 0) {
                        throw new Error("Encountered an empty line after advancement while expecting tokens.");
                    }
                }
            }

            const token = this.currentTokenBuffer[this.currentTokenIndex];
            this.currentTokenIndex++; // Move to the next token on the current line.

            return returnAsString ? token : Number(token);
        }

        /**
         * Reads the entire current line, splits it into tokens, and parses them.
         * Advances the line pointer after reading.
         * @param {boolean} [asStringArray=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of tokens from the line.
         */
        parseLineAsTokens(asStringArray = false) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("Cannot read line: end of input stream.");
            }
            const line = this.sourceLines[this.currentLinePointer++].trim();
            const tokens = line.split(' ').filter(token => token !== '');

            // Reset token buffer and index, as this method consumes the entire line.
            this.currentTokenBuffer = [];
            this.currentTokenIndex = 0;

            return asStringArray ? tokens : tokens.map(Number);
        }

        /**
         * Reads a specified number of lines and parses them into a 2D array (matrix).
         * Advances the line pointer by `numRows`.
         * @param {number} numRows - The number of rows to read for the matrix.
         * @param {boolean} [asStringMatrix=false] - If true, returns string matrix; otherwise, number matrix.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
         */
        readMatrixBlock(numRows, asStringMatrix = false) {
            if (this.currentLinePointer + numRows > this.sourceLines.length) {
                throw new Error(`Cannot read ${numRows} rows: not enough lines remaining.`);
            }
            const matrixRows = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + numRows)
                                .map(line => line.trim().split(' ').filter(token => token !== ''));
            this.currentLinePointer += numRows;
            // Reset token buffer as multiple lines were consumed.
            this.currentTokenBuffer = [];
            this.currentTokenIndex = 0;

            return asStringMatrix ? matrixRows : matrixRows.map(row => row.map(Number));
        }

        /**
         * Reads a specified number of lines as a flat array of values.
         * Each line is treated as a single value.
         * Advances the line pointer by `numItems`.
         * @param {number} numItems - The number of lines to read.
         * @param {boolean} [asStringArray=false] - If true, returns string array; otherwise, number array.
         * @returns {Array<string|number>} An array where each element is a line.
         */
        readArrayOfLines(numItems, asStringArray = false) {
            if (this.currentLinePointer + numItems > this.sourceLines.length) {
                throw new Error(`Cannot read ${numItems} lines: not enough lines remaining.`);
            }
            const lines = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + numItems)
                                .map(line => line.trim());
            this.currentLinePointer += numItems;
            // Reset token buffer.
            this.currentTokenBuffer = [];
            this.currentTokenIndex = 0;

            return asStringArray ? lines : lines.map(Number);
        }
    }

    return createInputSource;
})();

// Initialize the primary data source handler using file system input.
// This is typically for competitive programming environments reading from stdin.
const problemInput = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This is a recursive implementation to avoid the use of `eval`.
 *
 * @param {*} initialValue - The value to initialize all elements of the array with.
 * @param {...number} dimensions - A list of numbers representing the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createNthDimArray(initialValue, ...dimensions) {
  // Inner recursive helper function
  function buildRecursiveArray(remainingDimensions) {
    // Base case: if no more dimensions, return the initial value.
    if (remainingDimensions.length === 0) {
      return initialValue;
    }

    // Get the size of the current dimension.
    const currentDimensionSize = remainingDimensions[0];
    // Get the remaining dimensions for the next recursive call.
    const subsequentDimensions = remainingDimensions.slice(1);

    // Create a new array for the current dimension.
    const dimensionArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
      // Recursively fill each element with a nested array or the initial value.
      dimensionArray[i] = buildRecursiveArray(subsequentDimensions);
    }
    return dimensionArray;
  }

  // Start the recursive process with all provided dimensions.
  return buildRecursiveArray(dimensions);
}


// --- Mathematical Utility Functions for Modular Arithmetic ---

/**
 * The prime modulus constant used for all modular arithmetic operations.
 * This value is 998244353, a common prime in competitive programming.
 */
const PRIME_MODULUS = 998244353;

/**
 * Ensures a value is within the [0, PRIME_MODULUS - 1] range.
 * Useful after subtractions that might result in negative numbers.
 * @param {number} value - The number to normalize.
 * @returns {number} The normalized value modulo PRIME_MODULUS.
 */
function ensurePositiveModulo(value) {
    return (value % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
}

/**
 * Calculates the modular product of two numbers.
 * Performs (a * b) % PRIME_MODULUS.
 * @param {number} factorA - The first factor.
 * @param {number} factorB - The second factor.
 * @returns {number} The modular product.
 */
function calculateModularProduct(factorA, factorB) {
    // Directly multiplying is safe as PRIME_MODULUS is less than 2^30,
    // so (a*b) won't exceed Number.MAX_SAFE_INTEGER for a,b < PRIME_MODULUS.
    return (factorA * factorB) % PRIME_MODULUS;
}

/**
 * Computes the modular inverse of a number 'a' modulo PRIME_MODULUS,
 * using the Extended Euclidean Algorithm.
 * Requires PRIME_MODULUS to be a prime number.
 * @param {number} num - The number for which to find the modular inverse.
 * @returns {number} The modular inverse of 'num'.
 * @throws {Error} If 'num' is 0 or not coprime with PRIME_MODULUS.
 */
function findModularInverse(num) {
    let currentA = num;
    let currentB = PRIME_MODULUS;
    let x0 = 1, y0 = 0; // Coefficients for currentA
    let x1 = 0, y1 = 1; // Coefficients for currentB

    // Ensure num is positive and within modulus range
    num = ensurePositiveModulo(num);
    if (num === 0) {
        throw new Error("Cannot compute modular inverse of 0.");
    }

    while (currentB !== 0) {
        const quotient = Math.floor(currentA / currentB);

        // Update currentA and currentB
        let tempA = currentA;
        currentA = currentB;
        currentB = tempA % currentB;

        // Update coefficients using Euclidean algorithm steps
        let tempX = x0;
        x0 = x1;
        x1 = tempX - quotient * x1;

        let tempY = y0;
        y0 = y1;
        y1 = tempY - quotient * y1;
    }

    // x0 now holds the modular inverse of the original 'num'
    // Ensure the result is positive
    return ensurePositiveModulo(x0);
}

/**
 * Calculates (base ^ exponent) % PRIME_MODULUS using binary exponentiation (exponentiation by squaring).
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of (base ^ exponent) % PRIME_MODULUS.
 */
function computeModularPower(base, exponent) {
    let result = 1;
    let currentBase = ensurePositiveModulo(base); // Ensure base is within modulus range

    while (exponent > 0) {
        // If exponent is odd, multiply result by current base
        if (exponent % 2 === 1) { // Same as (exponent & 1)
            result = calculateModularProduct(result, currentBase);
        }
        // Square the current base
        currentBase = calculateModularProduct(currentBase, currentBase);
        // Halve the exponent
        exponent = Math.floor(exponent / 2); // Same as (exponent >>= 1)
    }
    return result;
}


// --- Main Problem Solving Logic ---

console.log(executeCalculation());

/**
 * Main function to encapsulate the problem's logic.
 * Reads input, performs calculations, and returns the final result.
 * This specific problem seems to be a variation of a combinatorial sum
 * involving powers of 3 and 2, and binomial coefficients.
 * @returns {number} The final computed result.
 */
function executeCalculation() {
    // Read the primary input size 'N' for the problem.
    const problemSize = problemInput.extractNextToken();

    // Basic validation for the input size.
    if (typeof problemSize !== 'number' || !Number.isInteger(problemSize) || problemSize < 0) {
        throw new Error("Invalid problem size 'N' provided. Must be a non-negative integer.");
    }

    // Initialize the cumulative sum with 3^N.
    // This is the starting point for the combinatorial sum.
    let cumulativeSum = computeModularPower(3, problemSize);

    // Initialize the binomial coefficient term (n C 0 = 1).
    // This term will be iteratively updated to represent n C i.
    let binomialCoefficientTerm = 1;

    // Define the upper limit for the loop, which is floor(N/2).
    // This implies calculations are performed up to N/2.
    const loopLimit = Math.floor(problemSize / 2);

    // Loop through iterations from 0 up to (loopLimit - 1).
    // In each iteration, a term (n C i * 2^(i+1)) is subtracted from the cumulative sum.
    for (let iterationIndex = 0, currentPowerOfTwo = 1; iterationIndex < loopLimit; iterationIndex++) {
        // Update currentPowerOfTwo to 2^(iterationIndex + 1).
        // It starts as 2^1 in the first iteration (i=0).
        currentPowerOfTwo = calculateModularProduct(currentPowerOfTwo, 2);

        // Subtract the current term (n C iterationIndex * 2^(iterationIndex + 1)) from the total.
        // The `ensurePositiveModulo` function handles potential negative results from subtraction.
        cumulativeSum = ensurePositiveModulo(
            cumulativeSum - calculateModularProduct(binomialCoefficientTerm, currentPowerOfTwo)
        );

        // Update the binomial coefficient term for the next iteration.
        // It calculates n C (iterationIndex + 1) from n C iterationIndex using the formula:
        // n C (k+1) = (n C k) * (n - k) / (k + 1)
        binomialCoefficientTerm = calculateModularProduct(
            calculateModularProduct(binomialCoefficientTerm, problemSize - iterationIndex),
            findModularInverse(iterationIndex + 1)
        );
    }

    // Ensure the final result is positive and within the modulus range.
    return ensurePositiveModulo(cumulativeSum);
}