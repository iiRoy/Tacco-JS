const DataStreamProcessor = (function () {
    /**
     * Factory function to create an input stream processor instance.
     * @param {string} rawInputString - The entire input data as a single string.
     * @returns {StreamHandler} A new instance configured to handle the input.
     */
    function createProcessor(rawInputString) {
        return new StreamHandler(rawInputString);
    }

    /**
     * Manages reading and parsing of input lines.
     * @class
     * @param {string} initialInput - The raw string input.
     */
    function StreamHandler(initialInput) {
        // All input lines, stripped of leading/trailing whitespace.
        this.inputLinesRaw = initialInput.trim().split("\n");
        // Index of the line currently being processed.
        this.currentLineIndex = 0;
        // Internal cache for pre-split and reversed tokens of a line, for efficient popping.
        this.reversedTokenCache = new Array(this.inputLinesRaw.length).fill(null);
    }

    /**
     * Extracts a single token (word) from the current line.
     * Advances the internal pointer.
     * @param {boolean} [retrieveAsString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The extracted token. Returns empty string or NaN on error.
     */
    StreamHandler.prototype.extractToken = function (retrieveAsString = false) {
        if (this.currentLineIndex >= this.inputLinesRaw.length) {
            console.error("Input stream exhausted. Cannot extract more tokens.");
            return retrieveAsString ? "" : NaN;
        }

        let lineData = this.reversedTokenCache[this.currentLineIndex];

        // If the current line's tokens haven't been prepared, split and reverse them.
        if (lineData === null) {
            lineData = this.inputLinesRaw[this.currentLineIndex].split(" ").reverse();
            this.reversedTokenCache[this.currentLineIndex] = lineData; // Cache for subsequent calls.
        }

        const valueExtracted = lineData.pop();

        // If the line is now empty, move to the next line for future reads.
        if (lineData.length === 0) {
            this.currentLineIndex++;
            this.reversedTokenCache[this.currentLineIndex - 1] = null; // Clear cache for consumed line.
        }

        return retrieveAsString ? valueExtracted : Number(valueExtracted);
    };

    /**
     * Reads and parses an entire line of space-separated values.
     * Advances the line index.
     * @param {boolean} [retrieveAsString=false] - If true, returns elements as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all values from the line. Returns an empty array on error.
     */
    StreamHandler.prototype.readFullLine = function (retrieveAsString = false) {
        if (this.currentLineIndex >= this.inputLinesRaw.length) {
            console.error("Input stream exhausted. Cannot read full line.");
            return [];
        }

        const currentLineContent = this.inputLinesRaw[this.currentLineIndex++];
        // Clear the cache for the line just consumed.
        this.reversedTokenCache[this.currentLineIndex - 1] = null;

        const splitLine = currentLineContent.split(" ");
        return retrieveAsString ? splitLine : splitLine.map(item => Number(item));
    };

    /**
     * Reads a block of 'numberOfRows' lines, interpreting each as a row in a matrix.
     * Advances the line index by 'numberOfRows'.
     * @param {number} numberOfRows - The number of lines to read.
     * @param {boolean} [retrieveAsString=false] - If true, returns elements as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix. Returns an empty array on error.
     */
    StreamHandler.prototype.readMatrix = function (numberOfRows, retrieveAsString = false) {
        if (this.currentLineIndex + numberOfRows > this.inputLinesRaw.length) {
            console.error(`Attempted to read ${numberOfRows} lines for matrix, but only ${this.inputLinesRaw.length - this.currentLineIndex} remain.`);
            return [];
        }

        const slicedLines = this.inputLinesRaw.slice(this.currentLineIndex, this.currentLineIndex + numberOfRows);
        this.currentLineIndex += numberOfRows;

        const processedMatrix = slicedLines.map(line => {
            const rowElements = line.split(" ");
            return retrieveAsString ? rowElements : rowElements.map(val => Number(val));
        });
        return processedMatrix;
    };

    /**
     * Reads a specified number of lines as an array of raw string or converted number values.
     * Advances the line index by 'numberOfLines'.
     * @param {number} numberOfLines - The count of lines to read.
     * @param {boolean} [retrieveAsString=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of line contents. Returns an empty array on error.
     */
    StreamHandler.prototype.readRawLines = function (numberOfLines, retrieveAsString = false) {
        if (this.currentLineIndex + numberOfLines > this.inputLinesRaw.length) {
            console.error(`Attempted to read ${numberOfLines} raw lines, but only ${this.inputLinesRaw.length - this.currentLineIndex} remain.`);
            return [];
        }

        const linesBlock = this.inputLinesRaw.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
        this.currentLineIndex += numberOfLines;

        return retrieveAsString ? linesBlock : linesBlock.map(val => Number(val));
    };

    return createProcessor;
})();

// Instantiate the input processor by reading from standard input.
const inputDataHandler = DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Modular Arithmetic Constants and Helper Functions ---
/**
 * The prime modulus used for all modular arithmetic operations.
 * @type {number}
 */
const PRIME_MODULUS = 998244353;

/**
 * Performs modular multiplication of two numbers.
 * Ensures the result is within [0, PRIME_MODULUS - 1].
 * @param {number} operandA - The first factor.
 * @param {number} operandB - The second factor.
 * @returns {number} (operandA * operandB) % PRIME_MODULUS.
 */
function multiplyModulo(operandA, operandB) {
    // JavaScript numbers can safely hold products up to (PRIME_MODULUS-1)^2 ~ 10^18,
    // which fits within the 2^53-1 safe integer limit.
    return (1.0 * operandA * operandB) % PRIME_MODULUS;
}

/**
 * Computes (baseValue ^ exponentValue) % PRIME_MODULUS using binary exponentiation.
 * Handles non-negative exponents.
 * @param {number} baseValue - The base number.
 * @param {number} exponentValue - The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
function powerModulo(baseValue, exponentValue) {
    let finalResult = 1;
    let currentBase = baseValue % PRIME_MODULUS;

    // Guard against negative exponents, which would require modular inverse.
    if (exponentValue < 0) {
        console.warn("Negative exponent provided to powerModulo. Returning 1 (or handle error).");
        return 1;
    }

    let tempExponent = exponentValue;

    // Loop using binary exponentiation (right-to-left method).
    while (tempExponent > 0) {
        // If the current bit of the exponent is 1, multiply it into the result.
        if (tempExponent % 2 === 1) {
            finalResult = multiplyModulo(finalResult, currentBase);
        }
        // Square the base for the next bit position.
        currentBase = multiplyModulo(currentBase, currentBase);
        // Move to the next bit of the exponent.
        tempExponent = Math.floor(tempExponent / 2);
    }
    return finalResult;
}

// Execute the main computation logic and print the output.
console.log(calculateMainResult());

/**
 * The primary function that implements the core algorithm.
 * Reads an input 'N' and performs a series of calculations involving modular arithmetic.
 * @returns {number} The final computed numerical result.
 */
function calculateMainResult() {
    // Read the main input parameter 'N' from the data stream.
    const N_PARAM = inputDataHandler.extractToken();

    // Input validation: N_PARAM must be a non-negative integer.
    if (isNaN(N_PARAM) || N_PARAM < 0 || !Number.isInteger(N_PARAM)) {
        console.error("Invalid input N_PARAM. Expected a non-negative integer.");
        return 0;
    }

    // Initialize the overall answer with 3^N_PARAM mod PRIME_MODULUS.
    let cumulativeAnswer = powerModulo(3, N_PARAM);

    // Initialize a term that will be iteratively subtracted.
    let subtractiveTerm = 2; // Initial value as per the problem logic.

    // Determine the upper limit for the loop, which is N_PARAM / 2.
    const loopUpperLimit = Math.floor(N_PARAM / 2);

    // Array to store precomputed modular inverses.
    // Sized to store inverses up to (loopUpperLimit + 1).
    const modularInverseCache = new Array(loopUpperLimit + 2);
    modularInverseCache[0] = 1; // Placeholder; inverse of 0 is undefined.
    modularInverseCache[1] = 1; // Inverse of 1 is 1.

    // Loop through a range to update the answer and compute inverses.
    for (let currentIterationIndex = 0; currentIterationIndex < loopUpperLimit;) {
        // Subtract the current 'subtractiveTerm' from the answer.
        // Add PRIME_MODULUS before taking modulo to ensure a positive result.
        cumulativeAnswer = (cumulativeAnswer - subtractiveTerm + PRIME_MODULUS) % PRIME_MODULUS;

        // The original logic increments 'i' *within* the calculation of 'fac'.
        // The `(N_PARAM - currentIterationIndex) * 2` part uses the value of `currentIterationIndex`
        // *before* it's incremented, but `modularInverseCache[incrementedIndex]` uses the *new* value.
        const numeratorFactor = (N_PARAM - currentIterationIndex) * 2;
        const inverseIndexToUse = ++currentIterationIndex; // `currentIterationIndex` is now `i+1` from `(N_PARAM - i)`

        // Update the 'subtractiveTerm' for the next iteration.
        subtractiveTerm = multiplyModulo(multiplyModulo(subtractiveTerm, numeratorFactor), modularInverseCache[inverseIndexToUse]);

        // Calculate the next modular inverse: inv[k] = (mod - (mod/k) * inv[mod%k]) % mod.
        const nextInverseTarget = inverseIndexToUse + 1;
        const remainderModInverse = PRIME_MODULUS % nextInverseTarget;
        const quotientModInverse = Math.floor(PRIME_MODULUS / nextInverseTarget);
        modularInverseCache[nextInverseTarget] = (PRIME_MODULUS - multiplyModulo(modularInverseCache[remainderModInverse], quotientModInverse)) % PRIME_MODULUS;
    }

    // Ensure the final answer is always positive by adding PRIME_MODULUS before the final modulo.
    cumulativeAnswer = (cumulativeAnswer % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;

    return cumulativeAnswer;
}