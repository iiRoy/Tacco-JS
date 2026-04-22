const InputParserFactory = (function () {
    // This module provides a flexible way to parse input data from a string.

    /**
     * Creates an InputProcessor instance from a raw string.
     * @param {string} rawInputString - The complete input as a single string.
     * @returns {InputProcessor} An instance capable of reading structured data.
     */
    function createInputProcessor(rawInputString) {
        return new InputProcessor(rawInputString);
    }

    /**
     * @class InputProcessor
     * Handles parsing of input lines and tokens.
     */
    function InputProcessor(inputContent) {
        // Store input lines, filtering out any empty lines that might result from split.
        this._sourceLines = inputContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        this._currentLineIndex = 0; // Pointer to the current line being processed.
        this._currentTokenBuffer = []; // Buffer for tokens on the current line, read from right to left.
    }

    /**
     * Extracts a single token (number or string) from the current line.
     * If the current line's buffer is empty, it processes the next available line.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to number.
     * @returns {string|number|null} The extracted token, or NaN if no more numerical input.
     */
    InputProcessor.prototype.extractSingleValue = function (returnAsString = false) {
        // Populate the token buffer if it's empty and there are more lines.
        while (this._currentTokenBuffer.length === 0 && this._currentLineIndex < this._sourceLines.length) {
            const currentLine = this._sourceLines[this._currentLineIndex];
            // Split by one or more whitespace characters, filter out empty strings, then reverse to pop from end.
            this._currentTokenBuffer = currentLine.split(/\s+/).filter(Boolean);
            this._currentTokenBuffer.reverse(); // Prepare for popping from the end.

            // If the line was empty or only whitespace, move to the next line immediately.
            if (this._currentTokenBuffer.length === 0) {
                this._currentLineIndex++;
            }
        }

        if (this._currentTokenBuffer.length === 0) {
            // No more tokens left in the input.
            return returnAsString ? "" : NaN;
        }

        const extractedToken = this._currentTokenBuffer.pop();

        // If the buffer is now empty after popping, advance to the next line.
        if (this._currentTokenBuffer.length === 0) {
            this._currentLineIndex++;
        }

        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads all tokens from the current line and advances to the next line.
     * This method clears any pending tokens in _currentTokenBuffer for the current line.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of tokens from the line. Returns an empty array if no more lines.
     */
    InputProcessor.prototype.fetchLineArray = function (returnAsString = false) {
        if (this._currentLineIndex >= this._sourceLines.length) {
            return []; // No more lines to read.
        }

        // Clear any remaining tokens from a previous extractSingleValue call for this line.
        this._currentTokenBuffer = [];

        const lineData = this._sourceLines[this._currentLineIndex++];
        const tokens = lineData.split(/\s+/).filter(Boolean); // Split by multiple spaces, filter empty.

        return returnAsString ? tokens : tokens.map(token => Number(token));
    };

    /**
     * Reads a block of 'numLines' lines, interpreting each as an array of tokens (matrix-like).
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {Array<Array<string|number>>} A 2D array of tokens. Returns an empty array if numLines is non-positive.
     */
    InputProcessor.prototype.acquireMultiLineData = function (numLines, returnAsString = false) {
        if (numLines <= 0) {
            return [];
        }

        const dataBlock = [];
        for (let i = 0; i < numLines; i++) {
            if (this._currentLineIndex >= this._sourceLines.length) {
                break; // Ran out of lines prematurely.
            }
            dataBlock.push(this.fetchLineArray(returnAsString));
        }
        return dataBlock;
    };

    /**
     * Reads a block of 'numLines' as raw strings or converted numbers.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns raw strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of lines. Returns an empty array if numLines is non-positive.
     */
    InputProcessor.prototype.retrieveLineBlock = function (numLines, returnAsString = false) {
        if (numLines <= 0) {
            return [];
        }

        // Clear any pending tokens for the current line before reading raw lines.
        this._currentTokenBuffer = [];

        const endIndex = Math.min(this._currentLineIndex + numLines, this._sourceLines.length);
        const rawLines = this._sourceLines.slice(this._currentLineIndex, endIndex);
        this._currentLineIndex = endIndex; // Advance the line pointer.

        return returnAsString ? rawLines : rawLines.map(line => Number(line));
    };

    return createInputProcessor;
})();

// Initialize the input scanner by reading from standard input.
const inputScanner = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function is a replacement for the original 'xArray' which used eval,
 * offering a safer and more maintainable way to create dynamic arrays.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., rows, columns, depth).
 * @returns {Array} A multi-dimensional array.
 */
function createDynamicArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue; // Base case: innermost element is the initial value.
    }
    const currentDimSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Create an array for the current dimension and recursively fill it.
    return Array(currentDimSize).fill(null).map(() => createDynamicArray(initialValue, ...remainingDimensions));
}

// Define a prime modulus for arithmetic operations to prevent integer overflow.
const PRIME_MOD = 1e9 + 7;

/**
 * Performs modular multiplication for multiple numbers.
 * It multiplies all provided numbers modulo PRIME_MOD.
 * @param {...number} numbers - The numbers to multiply.
 * @returns {number} The product modulo PRIME_MOD. Returns 1 if no numbers are provided.
 */
function modularMultiply(...numbers) {
    if (numbers.length === 0) {
        return 1; // Multiplicative identity.
    }

    let result = 1;
    for (const num of numbers) {
        // Defensive check: ensure num is a valid number.
        if (typeof num !== 'number' || isNaN(num)) {
            console.error("Invalid input for modularMultiply: not a number.", num);
            return NaN; // Indicate an error or handle as per specific requirements.
        }
        result = (result * num) % PRIME_MOD;
        // Ensure result stays positive after modulo, as JS modulo can return negative for negative dividends.
        if (result < 0) {
            result += PRIME_MOD;
        }
    }
    return result;
}

// Cache for memoized factorial values modulo PRIME_MOD.
const factorialCache = [1, 1]; // Initialize with 0! = 1 and 1! = 1.

/**
 * Calculates the factorial of a number modulo PRIME_MOD, using memoization to optimize repeated calls.
 * @param {number} n - The number for which to calculate the factorial. Must be a non-negative integer.
 * @returns {number} n! modulo PRIME_MOD. Returns 0 if n is negative.
 */
function getFactorialModulo(n) {
    if (n < 0) {
        return 0; // Factorial is not typically defined for negative numbers in this context.
    }
    // Calculate factorials up to n if not already cached.
    for (let i = factorialCache.length; i <= n; i++) {
        factorialCache[i] = modularMultiply(factorialCache[i - 1], i);
    }
    return factorialCache[n];
}

/**
 * Calculates "n choose r" (combinations: nCr) modulo PRIME_MOD.
 * nCr is defined as n! / (r! * (n-r)!).
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} nCr modulo PRIME_MOD. Returns 0 if r is out of bounds (r < 0 or r > n).
 */
function combinationsModulo(n, r) {
    // Standard combinatorial rules for edge cases.
    if (r < 0 || r > n) {
        return 0;
    }
    if (r === 0 || r === n) {
        return 1;
    }
    // Optimization: nCr = nC(n-r), choose the smaller 'r' to reduce computation.
    if (r > n / 2) {
        r = n - r;
    }

    const nFact = getFactorialModulo(n);
    const rFactInv = calculateModInverse(getFactorialModulo(r));
    const nMinusRFactInv = calculateModInverse(getFactorialModulo(n - r));

    // nCr = n! * (r!)^-1 * ((n-r)!)^-1 (mod P)
    return modularMultiply(nFact, rFactInv, nMinusRFactInv);
}

/**
 * Calculates the modular multiplicative inverse of 'num' modulo PRIME_MOD
 * using the Extended Euclidean Algorithm. This is used for division in modular arithmetic.
 * @param {number} num - The number for which to find the inverse. Must be coprime with PRIME_MOD.
 * @returns {number} The modular inverse of 'num'.
 */
function calculateModInverse(num) {
    let a = num;
    let b = PRIME_MOD;
    let u = 1, v = 0; // Coefficients for 'a' and 'b' respectively.
    let tempQuotient;

    // Extended Euclidean Algorithm loop.
    while (b !== 0) {
        tempQuotient = Math.floor(a / b);
        // Update a and u values based on Euclidean step.
        a -= tempQuotient * b;
        u -= tempQuotient * v;

        // Swap (a, b) and (u, v) using array destructuring.
        [a, b] = [b, a];
        [u, v] = [v, u];
    }

    // Ensure the resulting inverse is positive and within the modulo range.
    u %= PRIME_MOD;
    return u < 0 ? u + PRIME_MOD : u;
}

/**
 * Calculates the sum of an arithmetic series 1 + 2 + ... + (val-1).
 * This is equivalent to the formula val * (val - 1) / 2.
 * This function was originally named 'f'.
 * @param {number} val - The upper limit of the series (exclusive).
 * @returns {number} The sum of the series. Returns 0 if val is less than or equal to 1.
 */
function sumOfArithmeticSeriesUpToNMinusOne(val) {
    if (val <= 1) { // For val=0 or val=1, the sum is 0.
        return 0;
    }
    // For positive integers, a * (a - 1) / 2 produces an exact integer result in JavaScript.
    return (val * (val - 1)) / 2;
}


// Main execution logic of the program.
function executeMainLogic() {
    // Read problem parameters from the input stream.
    const rowsCount = inputScanner.extractSingleValue(); // Corresponds to 'n' in the original problem.
    const colsCount = inputScanner.extractSingleValue(); // Corresponds to 'm' in the original problem.
    const targetK = inputScanner.extractSingleValue();   // Corresponds to 'k' in the original problem.

    // Initialize a 2D grid (matrix) with all elements set to zero.
    const contributionGrid = createDynamicArray(0, rowsCount, colsCount);

    // Populate the grid based on the problem's specific formula.
    for (let colIndex = 0; colIndex < colsCount; colIndex++) {
        for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
            // Calculate the horizontal component of contribution for the current cell.
            const horizontalSeriesSum = sumOfArithmeticSeriesUpToNMinusOne(colIndex + 1) + sumOfArithmeticSeriesUpToNMinusOne(colsCount - colIndex);
            const totalHorizontalContribution = horizontalSeriesSum * rowsCount;

            // Calculate the vertical component of contribution for the current cell.
            const verticalSeriesSum = sumOfArithmeticSeriesUpToNMinusOne(rowIndex + 1) + sumOfArithmeticSeriesUpToNMinusOne(rowsCount - rowIndex);
            const totalVerticalContribution = verticalSeriesSum * colsCount;

            // Store the combined contributions for the current cell in the grid.
            contributionGrid[rowIndex][colIndex] = totalHorizontalContribution + totalVerticalContribution;
        }
    }

    // Sum up all the values in the contribution grid, applying modulo at each step.
    let finalAccumulatedResult = 0;
    for (let colIndex = 0; colIndex < colsCount; colIndex++) {
        for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
            finalAccumulatedResult = (finalAccumulatedResult + contributionGrid[rowIndex][colIndex]) % PRIME_MOD;
            // Ensure the result remains positive after modulo.
            if (finalAccumulatedResult < 0) {
                finalAccumulatedResult += PRIME_MOD;
            }
        }
    }

    // Calculate total number of cells in the grid.
    const totalCells = rowsCount * colsCount;

    // Guard clause for combinations: nCr(N, K) is 0 if K < 0 or K > N.
    // Here, we need combinationsModulo(totalCells - 2, targetK - 2).
    if (targetK < 2 || totalCells < 2 || targetK - 2 < 0 || targetK - 2 > totalCells - 2) {
        return 0;
    }

    // Calculate the combination term: (totalCells - 2) C (targetK - 2) modulo PRIME_MOD.
    const combinationsTerm = combinationsModulo(totalCells - 2, targetK - 2);

    // Calculate the modular inverse of 2, as the final result is divided by 2.
    const inverseOfTwo = calculateModInverse(2);

    // Perform the final modular multiplication steps.
    let intermediateResult = modularMultiply(finalAccumulatedResult, combinationsTerm);
    const finalAnswer = modularMultiply(intermediateResult, inverseOfTwo);

    return finalAnswer;
}

// Execute the main logic and print the final computed result to the console.
console.log(executeMainLogic());