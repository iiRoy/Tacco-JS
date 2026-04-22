const createInputParser = (() => {
    /**
     * @class InputSourceBuffer
     * @description Manages parsing of input string, providing methods to read various data formats.
     */
    class InputSourceBuffer {
        /**
         * @param {string} rawInputString - The complete input content as a single string.
         */
        constructor(rawInputString) {
            // Split the raw input into an array of lines, removing leading/trailing whitespace from the whole input.
            this._sourceLines = rawInputString.trim().split("\n");
            // Pointer to the current line being processed.
            this._currentLineIndex = 0;
            // Buffer to hold tokens (words) from the current line, allowing efficient 'pop' operations.
            this._currentTokenBuffer = [];
        }

        /**
         * Ensures the token buffer is populated with elements from the current line.
         * Splits the current line and reverses it so `pop()` can read from left to right.
         * Advances `_currentLineIndex` if the line is fully consumed.
         */
        _ensureTokenBuffer() {
            // Only populate if the buffer is empty and there are more lines to read.
            if (this._currentTokenBuffer.length === 0 && this._currentLineIndex < this._sourceLines.length) {
                const currentLineContent = this._sourceLines[this._currentLineIndex];
                // Split by space and reverse to enable `pop()` to act like `shift()` for sequential token reading.
                this._currentTokenBuffer = currentLineContent.split(" ").reverse();
            }
        }

        /**
         * Reads the next single scalar value from the input.
         * If the current line's buffer is empty, it advances to the next line.
         * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, attempts to convert to a number.
         * @returns {string|number} The extracted scalar value.
         * @throws {Error} If attempting to read beyond the end of the input.
         */
        fetchNextScalar(returnAsString = false) {
            // Guard clause: Prevent reading past the end of the source lines.
            if (this._currentLineIndex >= this._sourceLines.length && this._currentTokenBuffer.length === 0) {
                throw new Error("Input buffer exhausted: No more scalar values to read.");
            }

            this._ensureTokenBuffer();

            // If, after ensuring the buffer, it's still empty, it means the current line was empty.
            // Advance and try again.
            if (this._currentTokenBuffer.length === 0) {
                this._currentLineIndex++;
                return this.fetchNextScalar(returnAsString); // Recursive call to handle empty lines
            }

            const extractedToken = this._currentTokenBuffer.pop();

            // If the current line's tokens are now exhausted, prepare to advance to the next line for future reads.
            if (this._currentTokenBuffer.length === 0) {
                this._currentLineIndex++;
            }

            return returnAsString ? extractedToken : Number(extractedToken);
        }

        /**
         * Reads an entire line of space-separated values.
         * @param {boolean} returnRaw - If true, returns the array of strings; otherwise, maps to numbers.
         * @returns {string[]|number[]} An array of values from the line.
         * @throws {Error} If attempting to read beyond the end of the input.
         */
        readNumericLine(returnRaw = false) {
            // Guard clause: Check for input exhaustion before accessing line.
            if (this._currentLineIndex >= this._sourceLines.length) {
                throw new Error("Input buffer exhausted: No more lines to read for numeric line.");
            }
            // Clear the token buffer as we're explicitly reading a full line.
            this._currentTokenBuffer = [];
            const lineData = this._sourceLines[this._currentLineIndex++].split(" ");
            return returnRaw ? lineData : lineData.map(val => Number(val));
        }

        /**
         * Reads a block of 'rowCount' lines, treating each line as a row in a matrix.
         * @param {number} rowCount - The number of lines (rows) to read.
         * @param {boolean} asStrings - If true, returns a matrix of strings; otherwise, maps all cells to numbers.
         * @returns {string[][]|number[][]} A 2D array (matrix) of values.
         * @throws {Error} If attempting to read more rows than available.
         */
        obtainMatrix(rowCount, asStrings = false) {
            // Guard clause: Ensure enough lines are available for the requested matrix.
            if (this._currentLineIndex + rowCount > this._sourceLines.length) {
                throw new Error(`Input buffer exhausted: Not enough lines (${rowCount}) available for matrix read.`);
            }
            this._currentTokenBuffer = []; // Clear buffer for multi-line read operation.
            const matrixSlice = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + rowCount);
            this._currentLineIndex += rowCount; // Advance the line pointer.

            const parsedMatrix = matrixSlice.map(line => line.split(" "));
            return asStrings ? parsedMatrix : parsedMatrix.map(row => row.map(cell => Number(cell)));
        }

        /**
         * Reads a specified number of lines directly.
         * @param {number} count - The number of lines to read.
         * @param {boolean} parseToNumbers - If true, attempts to convert each line to a number.
         * @returns {string[]|number[]} An array of lines (strings or numbers).
         * @throws {Error} If attempting to read more lines than available.
         */
        grabLines(count, parseToNumbers = false) {
            // Guard clause: Ensure sufficient lines are present.
            if (this._currentLineIndex + count > this._sourceLines.length) {
                throw new Error(`Input buffer exhausted: Not enough lines (${count}) available for raw line grab.`);
            }
            this._currentTokenBuffer = []; // Clear buffer for multi-line read.
            const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + count);
            this._currentLineIndex += count; // Update line pointer.
            return parseToNumbers ? lines.map(line => Number(line)) : lines;
        }
    }

    // This immediately invoked function returns the factory function.
    return (inputStr) => new InputSourceBuffer(inputStr);
})();

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function avoids `eval` for safer and more predictable behavior.
 * @param {*} initialValue - The value to initialize all elements of the array with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
const initializeNestedArray = (initialValue, ...dimensions) => {
    // Base case: If no dimensions are provided, return the initial value itself.
    if (dimensions.length === 0) {
        return initialValue;
    }

    /**
     * Recursive helper function to build dimensions.
     * @param {number} currentDimensionIndex - The index of the dimension currently being created.
     * @returns {Array} A (sub)array for the current dimension.
     */
    const createDimension = (currentDimensionIndex) => {
        const currentDimSize = dimensions[currentDimensionIndex];

        // Ensure dimension size is a non-negative integer.
        if (typeof currentDimSize !== 'number' || !Number.isInteger(currentDimSize) || currentDimSize < 0) {
            throw new Error(`Invalid dimension size provided: ${currentDimSize}. Must be a non-negative integer.`);
        }

        // If this is the innermost dimension, fill it with the initial value.
        if (currentDimensionIndex === dimensions.length - 1) {
            return Array.from({ length: currentDimSize }, () => initialValue);
        } else {
            // For outer dimensions, recursively create the next level of arrays.
            return Array.from({ length: currentDimSize }, () => createDimension(currentDimensionIndex + 1));
        }
    };

    // Start the recursive creation process from the outermost dimension (index 0).
    return createDimension(0);
};

// Global instance for parsing input, initialized when the program starts.
let applicationInputReader;

/**
 * Executes the main program logic, including input reading and calculation.
 */
const executeProgram = () => {
    try {
        // Initialize the input reader with content from standard input.
        applicationInputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

        // Perform the core calculation.
        const finalCalculatedResult = computeMaximumPairwiseSum();

        // Output the final result.
        console.log(finalCalculatedResult);
    } catch (error) {
        // Centralized error handling for input or calculation issues.
        console.error("An error occurred during program execution:", error.message);
        // Depending on requirements, could exit with a non-zero status code.
        process.exit(1);
    }
};

/**
 * Implements the core logic to find the maximum pairwise sum based on the problem description.
 * Renamed from 'main'.
 * @returns {number} The maximum cumulative sum found.
 */
const computeMaximumPairwiseSum = () => {
    // Read the array size (N) from the input.
    const dataLength = applicationInputReader.fetchNextScalar();

    // Input validation: Ensure N is a valid positive integer.
    if (typeof dataLength !== 'number' || !Number.isInteger(dataLength) || dataLength < 1) {
        console.error("Critical: Invalid data length provided. Must be a positive integer.");
        return 0; // Return a default/error value or re-throw.
    }

    // Read the sequence of numbers (the array 's' in the original).
    const valueSequence = applicationInputReader.readNumericLine();

    // Initialize the variable to track the highest sum encountered.
    let maxCumulativeSum = 0;

    // Calculate the midpoint for the outer loop's upper bound.
    // Using Math.floor for clarity and robustness, equivalent to N >> 1 for positive N.
    const halfSize = Math.floor(dataLength / 2);

    // Outer loop: Iterates through possible step increments (i in original).
    // 'stepIncrement' represents the distance from the array boundaries or between elements.
    for (let stepIncrement = 1; stepIncrement < halfSize; stepIncrement++) {
        // Initialize the sum for the current 'stepIncrement' iteration.
        let currentIterationSum = 0;
        // A Set to keep track of indices already included in a pair within this specific 'stepIncrement' iteration.
        const processedIndices = new Set();

        // Inner loop: Iterates through possible 'leftIndex' (j in original).
        // 'leftIndex' starts from 'stepIncrement' and moves towards the center,
        // ensuring 'rightIndex' remains valid and distinct from 'leftIndex' for some cases.
        for (let leftIndex = stepIncrement; leftIndex < dataLength - stepIncrement; leftIndex += stepIncrement) {
            // Calculate the corresponding 'rightIndex' (t in original).
            // This is the symmetric index from the end of the array.
            const rightIndex = dataLength - 1 - leftIndex;

            // Guard condition: Check for already processed indices or self-pairing.
            // If an index has already been used in this 'stepIncrement' or if leftIndex == rightIndex (middle element),
            // we break from the inner loop. This implies we only consider the first valid sequence of pairs for a given step.
            if (processedIndices.has(leftIndex) || processedIndices.has(rightIndex) || leftIndex === rightIndex) {
                break;
            }

            // Add the values of the current pair to the iteration's sum.
            // Ensure indices are within bounds for safety, though loop conditions should handle this.
            if (leftIndex < valueSequence.length && rightIndex < valueSequence.length) {
                 currentIterationSum += valueSequence[leftIndex] + valueSequence[rightIndex];
            } else {
                 console.warn(`Index out of bounds for stepIncrement ${stepIncrement}: ${leftIndex}, ${rightIndex}`);
                 break; // Potentially problematic data, exit.
            }


            // Update the overall maximum sum if the current iteration's sum is greater.
            maxCumulativeSum = Math.max(maxCumulativeSum, currentIterationSum);

            // Mark both indices as processed for the current 'stepIncrement' to prevent reuse.
            processedIndices.add(leftIndex);
            processedIndices.add(rightIndex);
        }
    }

    return maxCumulativeSum;
};

// Initiate the program execution.
executeProgram();