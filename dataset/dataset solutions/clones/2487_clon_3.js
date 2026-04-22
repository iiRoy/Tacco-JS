var InputReaderFactory = (function () {
    /**
     * Represents a stream-like processor for input lines.
     * It manages the raw input content, allowing sequential reading of tokens or entire lines.
     * @param {string} rawInputContent - The raw string input, typically from a source like `fs.readFileSync`.
     */
    function LineStreamProcessor(rawInputContent) {
        // Validate the input content to prevent errors from empty or non-string data.
        if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
            this._lineCache = []; // Initialize with an empty array if input is invalid.
        } else {
            // Trim the entire content to remove leading/trailing newlines/whitespace,
            // then split into an array of individual lines.
            // This cache can be mutated by `consumeTokenFromLine` when processing a line.
            this._lineCache = rawInputContent.trim().split('\n');
        }
        // Initialize the current line index to the beginning of the input.
        this._currentLineIndex = 0;
    }

    /**
     * Helper method to prepare the current line for token consumption.
     * If the current line in `_lineCache` is still a string, it splits it into an array of tokens
     * and reverses the array. This allows `pop()` to effectively extract tokens from the
     * original start of the line, consuming them from left to right.
     * This method modifies the `_lineCache` in place, replacing the string line with its token array.
     * @returns {string[] | null} An array of tokens for the current line, or `null` if no more lines are available.
     */
    LineStreamProcessor.prototype._prepareCurrentLineTokens = function() {
        // Check if the current line index is out of bounds.
        if (this._currentLineIndex >= this._lineCache.length) {
            return null; // Indicates no more lines to process.
        }

        let currentLineEntry = this._lineCache[this._currentLineIndex];
        // If the current line is still a string, it means it hasn't been processed by `consumeTokenFromLine` yet.
        if (typeof currentLineEntry === 'string') {
            // Split the line by one or more whitespace characters (`\s+`),
            // filter out any resulting empty strings (e.g., from multiple spaces),
            // and then reverse the array. Reversing allows `pop()` to extract tokens from the original beginning of the line.
            this._lineCache[this._currentLineIndex] = currentLineEntry.split(/\s+/).filter(Boolean).reverse();
        }
        // Return the (potentially newly created) array of tokens for the current line.
        return this._lineCache[this._currentLineIndex];
    };

    /**
     * Reads and consumes a single value (token) from the current line of the input stream.
     * If the current line is exhausted after reading the token, it automatically advances to the next line.
     * @param {boolean} [returnAsString=false] - If `true`, the extracted value is returned as a string.
     *                                           Otherwise, it attempts to parse the value as a number.
     * @returns {string|number|undefined} The extracted value, or `undefined` if no more input tokens are available.
     */
    LineStreamProcessor.prototype.consumeTokenFromLine = function (returnAsString = false) {
        let currentTokens = this._prepareCurrentLineTokens();

        // If `currentTokens` is `null` (no more lines) or an empty array (e.g., a blank line was encountered),
        // there are no tokens to consume.
        if (!currentTokens || currentTokens.length === 0) {
            // Advance the line index if the current line was empty, then return undefined.
            if (currentTokens && currentTokens.length === 0) {
                 this._currentLineIndex++; // Consume the empty line.
            }
            return undefined;
        }

        // Extract the last element from the reversed tokens array, which corresponds to the first original token.
        const extractedValue = currentTokens.pop();

        // If the current line's token array is now empty, it means all tokens from this line have been consumed.
        // Advance to the next line for subsequent reads.
        if (currentTokens.length === 0) {
            this._currentLineIndex++;
        }

        // Return the value, either as a string or parsed as a number.
        // `Number(undefined)` results in `NaN`, which is handled correctly by `Math.max` in the main logic.
        return returnAsString ? extractedValue : (extractedValue !== undefined ? Number(extractedValue) : undefined);
    };

    /**
     * Reads an entire line from the input stream and returns its space-separated values.
     * This method always advances the internal line index by one, consuming the current line.
     * It assumes the line has not been partially consumed by `consumeTokenFromLine`.
     * @param {boolean} [keepAsStrings=false] - If `true`, values are returned as strings.
     *                                          Otherwise, values are parsed as numbers.
     * @returns {string[]|number[]} An array of values from the consumed line. Returns an empty array if no more lines.
     */
    LineStreamProcessor.prototype.fetchLineData = function (keepAsStrings = false) {
        // If there are no more lines to read, return an empty array.
        if (this._currentLineIndex >= this._lineCache.length) {
            return [];
        }
        
        // Retrieve the raw content of the current line and immediately advance the line index.
        // We ensure it's treated as a string, even if `_lineCache` was mutated by `consumeTokenFromLine`
        // (though this method assumes it's called on an unconsumed line).
        const rawLineContent = String(this._lineCache[this._currentLineIndex]);
        this._currentLineIndex++;

        // Split the line by one or more whitespace characters and filter out empty strings.
        const parts = rawLineContent.split(/\s+/).filter(Boolean);
        // Map the parts to numbers if `keepAsStrings` is false, otherwise return as strings.
        return keepAsStrings ? parts : parts.map(Number);
    };

    /**
     * Reads a specified number of lines from the input stream, interpreting each line as a row
     * in a matrix, with values separated by spaces.
     * This method advances the line index by `numRows`.
     * @param {number} numRows - The number of rows (lines) to read for the matrix.
     * @param {boolean} [keepAsStrings=false] - If `true`, matrix elements are strings; otherwise, they are numbers.
     * @returns {string[][]|number[][]} A 2D array representing the matrix. Returns an empty array if `numRows` is invalid or no lines can be read.
     */
    LineStreamProcessor.prototype.readDataMatrix = function (numRows, keepAsStrings = false) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + numRows;

        // Validate `numRows` and check if enough lines are available.
        if (numRows <= 0 || endIdx > this._lineCache.length) {
            return []; // Return an empty matrix if invalid request or insufficient data.
        }

        // Extract the relevant lines and then update the current line index.
        const relevantLines = this._lineCache.slice(startIdx, endIdx);
        this._currentLineIndex = endIdx;

        // Process each line: split into parts and convert to numbers if required.
        const matrixData = relevantLines.map(line => {
            const parts = String(line).split(/\s+/).filter(Boolean);
            return keepAsStrings ? parts : parts.map(Number);
        });

        return matrixData;
    };

    /**
     * Reads a specified number of lines from the input, returning each line's content as a single value.
     * This method assumes each line contains a single value that should be parsed.
     * It advances the line index by `count`.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [keepAsStrings=false] - If `true`, values are returned as strings; otherwise, parsed as numbers.
     * @returns {string[]|number[]} An array of values, one per line. Returns an empty array if `count` is invalid or no lines can be read.
     */
    LineStreamProcessor.prototype.fetchLinesAsArray = function (count, keepAsStrings = false) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + count;

        // Validate `count` and check if enough lines are available.
        if (count <= 0 || endIdx > this._lineCache.length) {
            return []; // Return an empty array if invalid request or insufficient data.
        }

        // Extract the lines to process and then update the current line index.
        const linesToProcess = this._lineCache.slice(startIdx, endIdx);
        this._currentLineIndex = endIdx;

        // Map each line: trim it, then convert to string or number based on `keepAsStrings`.
        return keepAsStrings ? linesToProcess.map(String) : linesToProcess.map(line => Number(String(line).trim()));
    };

    /**
     * Factory function to create and return a new `LineStreamProcessor` instance.
     * This is the primary way to obtain an input reader.
     * @param {string} inputData - The raw string data to be processed.
     * @returns {LineStreamProcessor} A new instance configured with the provided input data.
     */
    function createReaderInstance(inputData) {
        return new LineStreamProcessor(inputData);
    }

    // The IIFE returns the factory function, making it the public interface of the module.
    return createReaderInstance;
})();

// Initialize the input processor by reading content from standard input.
// `require("fs").readFileSync` is a Node.js specific method to read files synchronously.
var inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specified value.
 * This function is implemented recursively to avoid the use of `eval()`,
 * enhancing security and readability.
 * @param {any} initialValue - The value that will fill all elements of the array.
 * @param {...number} dimensions - A variable number of arguments representing the sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array, filled with `initialValue`.
 */
function initializeMultiDimArray(initialValue, ...dimensions) {
    /**
     * Recursive helper function to build the nested array structure.
     * @param {number[]} currentDimensions - An array of remaining dimension sizes to process.
     * @param {any} fillValue - The value to place at the innermost level of the array.
     * @returns {Array|any} A nested array structure, or the `fillValue` if no more dimensions.
     */
    const buildArrayRecursive = (currentDimensions, fillValue) => {
        // Base case: If there are no more dimensions, we've reached the innermost level,
        // so return the `fillValue`.
        if (currentDimensions.length === 0) {
            return fillValue;
        }

        // Get the size for the current dimension from the front of the `currentDimensions` array.
        const currentDimSize = currentDimensions[0];
        // Create a new array for the current dimension.
        const newArray = new Array(currentDimSize);
        // Get the rest of the dimensions for the next recursive call.
        const remainingDimensions = currentDimensions.slice(1);

        // Populate the `newArray` by recursively calling `buildArrayRecursive` for each element.
        for (let i = 0; i < currentDimSize; i++) {
            newArray[i] = buildArrayRecursive(remainingDimensions, fillValue);
        }
        return newArray;
    };

    // If no dimensions are provided, simply return the `initialValue` itself.
    if (dimensions.length === 0) {
        return initialValue;
    }

    // Start the recursive process to build the multi-dimensional array.
    return buildArrayRecursive(dimensions, initialValue);
}

// Entry point for the problem's solution logic.
// The result of `solveProblem()` is printed to the console.
console.log(solveProblem());

/**
 * Main function containing the problem-solving logic.
 * This function reads two numerical values from the input stream, performs a calculation,
 * and returns the result. It includes basic input validation.
 * @returns {number} The calculated result, which is `max(0, firstValue - (2 * secondValue))`.
 *                   Returns 0 if input values are not valid numbers.
 */
function solveProblem() {
    // Read the first numerical value from the input.
    // `consumeTokenFromLine()` extracts one token and attempts to convert it to a number.
    const firstValue = inputProcessor.consumeTokenFromLine();

    // Read the second numerical value from the input.
    // This will consume the next available token, either from the same line or the next.
    const secondValue = inputProcessor.consumeTokenFromLine();

    // Perform validation on the input values to ensure they are valid numbers.
    // If either value is not a number or is NaN, it indicates invalid input.
    if (typeof firstValue !== 'number' || isNaN(firstValue) ||
        typeof secondValue !== 'number' || isNaN(secondValue)) {
        // For robustness, returning 0 or throwing an error is appropriate for invalid input.
        // In competitive programming, problems often guarantee valid input, but this adds resilience.
        return 0;
    }

    // Calculate an intermediate product: double the second value.
    const doubledSecondValue = 2 * secondValue;

    // Calculate the difference between the first value and the doubled second value.
    const calculatedDifference = firstValue - doubledSecondValue;

    // The problem requires returning the maximum of 0 and the calculated difference.
    // This ensures the final result is never negative.
    return Math.max(0, calculatedDifference);
}