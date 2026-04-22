/*
 * This module provides a factory for creating input data parsers.
 * It's designed to read structured input from a string, typically
 * representing lines of text with space-separated values, in a competitive programming context.
 */
var InputParserFactory = (function () {
    /**
     * Creates and returns a new parser instance for the given raw input string.
     * This is the public interface of the InputParserFactory.
     * @param {string} rawInputString The complete input content as a single string.
     * @returns {TextDataReader} An instance of TextDataReader ready to parse.
     */
    function createParserInstance(rawInputString) {
        // Delegate the actual parsing logic to the TextDataReader class.
        return new TextDataReader(rawInputString);
    }

    /**
     * Internal class responsible for processing textual input data line by line.
     * It manages the state of the input stream (current line, current position within line).
     * @class
     * @param {string} content The raw string content to be parsed.
     */
    function TextDataReader(content) {
        // Store lines of content, trimming leading/trailing whitespace and splitting into an array.
        // Each element initially is a string, which might be further processed into an array of tokens.
        this._contentLines = content.trim().split("\n");
        // Keeps track of the index of the current line being processed in `_contentLines`.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next available numerical value from the input stream.
     * If the current line has been fully consumed or hasn't been processed yet,
     * it prepares the current line for token extraction.
     *
     * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, as a number.
     * @returns {number|string|undefined} The parsed value, or undefined if end of input is reached.
     */
    TextDataReader.prototype.readNextValue = function (returnAsString = false) {
        // Check if we have processed all available lines.
        if (this._currentLineIndex >= this._contentLines.length) {
            console.warn("InputParser Warning: Attempted to read past end of input data.");
            return undefined; // Indicate no more data.
        }

        let currentLineEntry = this._contentLines[this._currentLineIndex];

        // If the current line is still a string, it means it hasn't been split into tokens yet.
        // Split it into tokens and reverse the array. This allows `pop()` to retrieve tokens
        // in their original order (left-to-right) efficiently.
        if (typeof currentLineEntry === "string") {
            this._contentLines[this._currentLineIndex] = currentLineEntry.split(" ").reverse();
        }

        // Now, `_contentLines[this._currentLineIndex]` is guaranteed to be an array of tokens (strings).
        let tokensArray = this._contentLines[this._currentLineIndex];

        // Retrieve the last token from the reversed array.
        let valueStr = tokensArray.pop();

        // If the current line (tokensArray) is now empty after popping, it means we've consumed all tokens
        // from this line. Advance to the next line for subsequent reads.
        if (tokensArray.length === 0) {
            this._currentLineIndex++;
        }

        // Return the value, converting to a number if not explicitly requested as a string.
        return returnAsString ? valueStr : Number(valueStr);
    };

    /**
     * Reads all space-separated values from the *entire* current line as an array.
     * Advances the internal line pointer to the next line after reading.
     * This method assumes the current line has not been partially consumed by `readNextValue`.
     *
     * @param {boolean} [returnAsString=false] If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<number|string>} An array of parsed values from the line.
     */
    TextDataReader.prototype.readLineValues = function (returnAsString = false) {
        // Check for end of input.
        if (this._currentLineIndex >= this._contentLines.length) {
            console.warn("InputParser Warning: Attempted to read past end of input data with readLineValues.");
            return [];
        }

        // Get the raw string for the current line and immediately advance the line pointer.
        // It's crucial here that `_contentLines[this._currentLineIndex]` is still a string,
        // not an array of tokens from a partial `readNextValue` call.
        let rawLine = this._contentLines[this._currentLineIndex++];
        if (typeof rawLine !== 'string') {
             console.error("InputParser Error: Inconsistent line state. A line was expected as string but was pre-processed. This might indicate mixed usage of readNextValue and readLineValues on the same line.");
             // Attempt to recover by converting the array back to string or just return empty.
             // For robustness, let's assume it was already an array of tokens and join them.
             rawLine = Array.isArray(rawLine) ? rawLine.reverse().join(" ") : "";
        }

        let values = rawLine.split(" ");
        // Return the array of values, converting to numbers if required.
        return returnAsString ? values : values.map(Number);
    };

    /**
     * Reads a block of lines as a matrix (array of arrays).
     * This method reads `rowCount` number of lines starting from the current line.
     *
     * @param {number} rowCount The number of rows to read for the matrix.
     * @param {boolean} [returnAsString=false] If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<number|string>>} The parsed matrix. Returns an empty array if rowCount is invalid.
     */
    TextDataReader.prototype.readMatrixBlock = function (rowCount, returnAsString = false) {
        // Guard clause: Ensure rowCount is a positive integer.
        if (typeof rowCount !== 'number' || !Number.isInteger(rowCount) || rowCount <= 0) {
            console.warn("InputParser Warning: Attempted to read a matrix with invalid rowCount:", rowCount, ". Returning an empty matrix.");
            return [];
        }

        // Ensure we don't read beyond the available lines.
        const actualRowCount = Math.min(rowCount, this._contentLines.length - this._currentLineIndex);
        if (actualRowCount < rowCount) {
            console.warn(`InputParser Warning: Requested ${rowCount} rows for matrix, but only ${actualRowCount} available.`);
        }

        // Extract the slice of lines that form the matrix.
        let matrixRawLines = this._contentLines.slice(this._currentLineIndex, this._currentLineIndex + actualRowCount);
        // Advance the line pointer by the number of lines read for the matrix.
        this._currentLineIndex += actualRowCount;

        // Process each line in the matrix slice.
        let processedMatrix = matrixRawLines.map(lineStr => {
            let rowValues = lineStr.split(" ");
            return returnAsString ? rowValues : rowValues.map(Number);
        });
        return processedMatrix;
    };

    // The original `g.prototype.r` method (read lines as numbers without splitting individual tokens)
    // was not used in the `main` function. As a Type III change, it has been deleted to streamline the code.

    return createParserInstance;
})();

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function provides a recursive, `eval`-free implementation for creating arrays
 * of arbitrary dimensions, replacing the original string-based `eval` approach.
 *
 * @param {*} initialValue The value to recursively fill the array with at its deepest level.
 * @param {...number} dimensions A list of integers representing the dimensions of the array (e.g., width, height, depth).
 * @returns {Array} A multi-dimensional array structured according to the provided dimensions.
 */
function createMultiDimArray(initialValue, ...dimensions) {
    // Base case: If no more dimensions are specified, return the initial value.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    // Guard clause: Ensure the current dimension size is a positive integer.
    if (typeof currentDimensionSize !== 'number' || !Number.isInteger(currentDimensionSize) || currentDimensionSize <= 0) {
        console.error("MultiDimArray Error: Invalid dimension size provided:", currentDimensionSize, ". Returning an empty array for this level.");
        return []; // Return an empty array for an invalid dimension.
    }

    // Recursively call for the remaining dimensions.
    const remainingDimensions = dimensions.slice(1);
    const result = new Array(currentDimensionSize); // Pre-allocate array for efficiency.

    // Fill the current level of the array by recursively building sub-arrays.
    for (let idx = 0; idx < currentDimensionSize; idx++) {
        result[idx] = createMultiDimArray(initialValue, ...remainingDimensions);
    }
    return result;
}

// Define the modulus as a constant for clarity, immutability, and easy modification.
const MODULUS_VALUE = 1e9 + 7;

/**
 * Helper function to add two numbers and apply the modulus.
 * Ensures the result stays within the modular arithmetic bounds (0 to MODULUS_VALUE - 1).
 *
 * @param {number} numA First operand.
 * @param {number} numB Second operand.
 * @returns {number} (numA + numB) % MODULUS_VALUE.
 */
function addWithModulo(numA, numB) {
    // Ensure numbers are non-negative before addition to prevent potential negative results from % operator
    // if intermediate sum is negative, though JS '%' handles negative numbers correctly for positive divisor.
    return (numA + numB) % MODULUS_VALUE;
}

/**
 * Calculates the product of multiple numbers and applies a modulo operation at each step
 * to prevent overflow and keep the result within the modulus.
 * This function simplifies the original `abmod` which used bitwise operations specific to 32-bit
 * integer multiplication. JavaScript's numbers handle up to 2^53 safely, so direct multiplication
 * is efficient and correct as long as intermediate products don't exceed this before modulo.
 * Given MODULUS_VALUE is 10^9, products like (10^9)*(10^9) are approx 10^18, which fits within
 * JavaScript's safe integer range (Number.MAX_SAFE_INTEGER is 2^53 - 1, approx 9 * 10^15).
 * For values potentially larger than safe integers, BigInt would be needed, but not for this problem.
 *
 * @param {...number} factors An array of numbers to be multiplied.
 * @returns {number} The final product modulo MODULUS_VALUE. Returns 0 if no factors are provided.
 */
function calculateProductModulo(...factors) {
    // Guard clause: If no factors are provided, the multiplicative identity is 1, but
    // given its usage in this problem, an empty list of factors is likely an error.
    if (factors.length === 0) {
        console.error("ProductModulo Error: calculateProductModulo requires at least one factor.");
        return 0; // Or throw new Error("No factors provided");
    }

    // Start with the first factor, already reduced modulo.
    let currentProduct = factors[0] % MODULUS_VALUE;

    // Iterate through the remaining factors, multiplying and applying modulo at each step.
    for (let i = 1; i < factors.length; i++) {
        let factor = factors[i] % MODULUS_VALUE; // Reduce current factor modulo.
        currentProduct = (currentProduct * factor) % MODULUS_VALUE;
    }
    return currentProduct;
}

// Obtain a parser instance by reading the standard input.
// This line uses `require` and `fs`, which are Node.js specific modules
// for file system operations. It's executed once to set up the input stream.
var parserInstance = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * The primary function that solves the problem.
 * This function encapsulates the core logic, reading input, performing dynamic programming calculations,
 * and returning the final result according to the problem statement.
 *
 * @returns {number} The final calculated answer modulo MODULUS_VALUE.
 */
function solveProblem() {
    // Read problem parameters from the input stream.
    // totalItems (N): The total number of items to consider.
    const totalItems = parserInstance.readNextValue();
    // initialValueX (X): The starting value for the dynamic programming state.
    const initialValueX = parserInstance.readNextValue();
    // sortedDivisors (S): A list of divisors, which are sorted in descending order
    // as required by the problem's algorithm logic.
    const sortedDivisors = parserInstance.readLineValues().sort((valA, valB) => valB - valA);

    // --- Input Validation Guard Clauses (Type III addition for robustness) ---
    if (typeof totalItems !== 'number' || totalItems < 0) {
        console.error("SolveProblem Error: Invalid totalItems value:", totalItems);
        return 0;
    }
    if (typeof initialValueX !== 'number' || initialValueX < 0) {
        console.error("SolveProblem Error: Invalid initialValueX value:", initialValueX);
        return 0;
    }
    if (!Array.isArray(sortedDivisors) || sortedDivisors.length === 0) {
        console.error("SolveProblem Error: Divisors array is empty or invalid.");
        return 0;
    }
    // Optional warning if N doesn't match S.length, assuming N items implies N divisors.
    if (totalItems !== sortedDivisors.length) {
        console.warn(`SolveProblem Warning: Number of items (N=${totalItems}) does not match the count of provided divisors (S.length=${sortedDivisors.length}). Proceeding with N items.`);
    }
    // -------------------------------------------------------------------------

    // Initialize the dynamic programming state.
    // Using `Object.create(null)` creates a truly empty object without a prototype chain,
    // which is suitable for use as a hash map where keys are numbers (treated as strings).
    let currentDPState = Object.create(null);
    // The initial state begins with `initialValueX` having a count of 1.
    currentDPState[initialValueX] = 1;

    // Iterate through each item (divisor) from the `sortedDivisors` array.
    // `itemIndex` represents the index of the current divisor being processed.
    for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
        // Create a new DP state object for the results of the current iteration.
        let nextDPState = Object.create(null);
        // Calculate the number of remaining items yet to be processed.
        const remainingItemsCount = totalItems - itemIndex - 1;

        // Iterate over the keys (which represent remainders) in the current DP state.
        // `Object.keys()` ensures we iterate only over own enumerable properties, and `for...of` is modern JS.
        for (const currentRemainderStr of Object.keys(currentDPState)) {
            const currentRemainder = Number(currentRemainderStr); // Convert key string back to number.
            const currentCount = currentDPState[currentRemainderStr]; // Get the count for this remainder.

            // Case 1: We 'skip' the current item (divisor) `sortedDivisors[itemIndex]`.
            // If we skip this item, the `currentRemainder` remains unchanged.
            // The count for this state is multiplied by the number of `remainingItemsCount`
            // that could potentially be skipped or chosen in subsequent steps.
            const skipContribution = calculateProductModulo(currentCount, remainingItemsCount);
            // Add this contribution to the `nextDPState` for `currentRemainder`.
            // Use `|| 0` to handle cases where `nextDPState[currentRemainder]` might not exist yet.
            nextDPState[currentRemainder] = addWithModulo(nextDPState[currentRemainder] || 0, skipContribution);

            // Case 2: We 'use' the current item (divisor) `sortedDivisors[itemIndex]`.
            // If we use this item, the `currentRemainder` is updated by taking its modulo
            // with the `currentDivisor`.
            const currentDivisor = sortedDivisors[itemIndex];
            // Guard against division by zero if a divisor is 0, though problem constraints usually prevent this.
            // If divisor is 0, remainder should conceptually be the number itself (or undefined behavior).
            // For safety, if divisor is 0, newRemainder remains currentRemainder.
            const newRemainder = (currentDivisor === 0) ? currentRemainder : (currentRemainder % currentDivisor);

            // The count for this `newRemainder` state is simply the `currentCount` from the previous state.
            nextDPState[newRemainder] = addWithModulo(nextDPState[newRemainder] || 0, currentCount);
        }
        // After processing all remainders for the current item, update the DP state for the next iteration.
        currentDPState = nextDPState;
    }

    // Calculate the final answer by summing `(remainder * count)` for all final states in `currentDPState`.
    let finalAnswer = 0;
    for (const remainderStr of Object.keys(currentDPState)) {
        const remainder = Number(remainderStr);
        const count = currentDPState[remainderStr];
        // Multiply the remainder by its count and add to the total, ensuring modulo is applied at each step.
        finalAnswer = addWithModulo(finalAnswer, calculateProductModulo(remainder, count));
    }

    // Return the final answer, ensuring it's within the modulus range (0 to MODULUS_VALUE - 1).
    return finalAnswer % MODULUS_VALUE;
}

// Execute the main problem-solving function and print its result to the standard output.
console.log(solveProblem());