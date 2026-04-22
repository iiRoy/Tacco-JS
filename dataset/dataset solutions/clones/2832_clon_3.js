const InputFacade = (initialText) => {
    // The InputSource class encapsulates logic for reading and parsing input data.
    // It processes lines sequentially and can extract various data types.
    class InputSource {
        constructor(sourceText) {
            // Basic validation for the input string.
            if (typeof sourceText !== 'string') {
                throw new Error("Input source must be a string for processing.");
            }
            // Store raw input lines, splitting by newline and trimming whitespace.
            this._storedLines = sourceText.trim().split("\n");
            // Pointer to keep track of the current line being processed.
            this._lineIndexPointer = 0;

            // Internal helper to convert values to numbers, handling potential NaN.
            this._castToNumber = (value) => {
                const numericValue = Number(value);
                // For competitive programming, inputs are usually clean, so NaN implies an error.
                // Returning 0 or throwing an error are common strategies.
                return isNaN(numericValue) ? 0 : numericValue;
            };
        }

        // Method to extract a single token from the current line.
        // It processes tokens from right-to-left within a line, similar to a stack.
        // If 'returnAsText' is true, the raw string token is returned; otherwise, it's converted to a number.
        extractNextValue(returnAsText = false) {
            // Ensure we haven't exhausted all input lines.
            if (this._lineIndexPointer >= this._storedLines.length) {
                // Return undefined or throw an error if no more input is available.
                return undefined;
            }

            let currentLineReference = this._storedLines[this._lineIndexPointer];
            let tokenToReturn;

            // If the current line is still a string, it means it hasn't been split into tokens yet.
            // Split it, reverse the order (for right-to-left popping), and update the internal cache.
            if (typeof currentLineReference === "string") {
                this._storedLines[this._lineIndexPointer] = currentLineReference.split(" ").reverse();
                currentLineReference = this._storedLines[this._lineIndexPointer]; // Update reference
            }

            // Pop the last token from the (possibly reversed) array.
            tokenToReturn = currentLineReference.pop();

            // If the current line's token buffer is now empty, advance to the next line.
            if (currentLineReference.length === 0) {
                this._lineIndexPointer++;
            }

            // Return the token, applying number conversion if requested.
            return returnAsText ? tokenToReturn : this._castToNumber(tokenToReturn);
        }

        // Method to read an entire line and return its tokens as an array.
        // If 'asStrings' is true, tokens remain strings; otherwise, they are converted to numbers.
        fetchLineTokens(asStrings = false) {
            if (this._lineIndexPointer >= this._storedLines.length) {
                return []; // No more lines to read.
            }

            // Fetch the current line content and immediately advance the pointer.
            // Note: This method assumes the line has not been partially consumed by `extractNextValue`.
            // If `extractNextValue` was used on the same line, this might try to split an array.
            // The original code has this potential behavior, so we mimic it.
            const lineContent = this._storedLines[this._lineIndexPointer++];

            // Split the line into individual tokens.
            const tokens = String(lineContent).split(" "); // Ensure it's a string before splitting.
            return asStrings ? tokens : tokens.map(val => this._castToNumber(val));
        }

        // Method to read a specified number of lines and parse them into a matrix (array of arrays).
        // 'numLines' specifies how many lines to read.
        // If 'outputAsStrings' is true, matrix elements remain strings; otherwise, they are numbers.
        retrieveMatrix(numLines, outputAsStrings = false) {
            if (numLines <= 0) {
                return []; // No rows to read.
            }

            // Extract the relevant slice of lines from the stored input.
            const selectedRows = this._storedLines.slice(this._lineIndexPointer, this._lineIndexPointer + numLines);
            this._lineIndexPointer += numLines; // Advance the line pointer.

            // Process each selected line into an array of tokens.
            const processedMatrix = selectedRows.map(line => {
                const tokens = String(line).split(" ");
                return outputAsStrings ? tokens : tokens.map(val => this._castToNumber(val));
            });
            return processedMatrix;
        }

        // Method to read a specified number of lines directly without splitting tokens.
        // 'count' specifies how many raw lines to read.
        // If 'outputAsStrings' is true, lines remain strings; otherwise, they are converted to numbers.
        fetchRawLines(count, outputAsStrings = false) {
            if (count <= 0) {
                return []; // No lines to read.
            }

            // Extract the raw lines.
            const rawData = this._storedLines.slice(this._lineIndexPointer, this._lineIndexPointer + count);
            this._lineIndexPointer += count; // Advance the line pointer.
            return outputAsStrings ? rawData : rawData.map(val => this._castToNumber(val));
        }
    }

    return new InputSource(initialText);
};

// Helper function to read file content from a given path.
const loadInputFileContent = (filePath) => {
    if (typeof filePath !== 'string' || filePath.length === 0) {
        throw new Error("A valid file path is required to load input.");
    }
    // Using Node.js 'fs' module to read the file.
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync(filePath, "utf8");
};

// Utility to create a multi-dimensional array initialized with a specific value.
// The dimensions are provided as subsequent arguments.
const createNestedArray = (initialValue, ...dimensions) => {
    // Guard clause for invalid or empty dimension array.
    if (!dimensions || dimensions.length === 0) {
        return initialValue; // Or an empty array, depending on desired behavior for 0 dimensions.
    }

    // Recursive helper to build the array structure.
    const buildArrayRecursively = (currentDimensionIndex) => {
        // Base case: if we are at the innermost dimension, create a flat array filled with the initial value.
        if (currentDimensionIndex === dimensions.length - 1) {
            return Array(dimensions[currentDimensionIndex]).fill(initialValue);
        } else {
            // Recursive step: create an array and fill it with nested arrays.
            // Using `fill(null).map` ensures new array instances for each nested level.
            return Array(dimensions[currentDimensionIndex]).fill(null).map(() => buildArrayRecursively(currentDimensionIndex + 1));
        }
    };

    return buildArrayRecursively(0);
};

// Define a common modulo constant, frequently used in competitive programming.
const ARITHMETIC_MODULO = 1000000007; // Represents 10^9 + 7.

// Helper for applying modulo operation, ensuring results stay within the range [0, ARITHMETIC_MODULO - 1].
const applyModulo = (value) => {
    return value % ARITHMETIC_MODULO;
};

// --- Main Program Execution ---

// Initialize the input processor by loading data from standard input.
const dataStreamReader = InputFacade(loadInputFileContent("/dev/stdin"));

// Log the result of the main problem-solving function.
console.log(executeSolution());

// The primary function encapsulating the problem's logic.
function executeSolution() {
    // Read problem dimensions: N and M.
    const numRows = dataStreamReader.extractNextValue(); // N
    const numCols = dataStreamReader.extractNextValue(); // M

    // Basic input validation for dimensions.
    if (numRows < 0 || numCols < 0) {
        console.error("Input dimensions (N or M) cannot be negative. Exiting.");
        return 0; // Or throw an error.
    }
    if (numRows === 0 || numCols === 0) {
        // If either dimension is zero, there are no matching subsequences beyond the empty one (counted as 1).
        return 1;
    }

    // Read the two sequences (arrays of numbers).
    const sequenceA = dataStreamReader.fetchLineTokens(); // S
    const sequenceB = dataStreamReader.fetchLineTokens(); // T

    // Initialize the dynamic programming table.
    // It's sized (N+1) x (M+1) to accommodate 1-based indexing for convenience.
    const dpTable = createNestedArray(0, numRows + 1, numCols + 1);

    // Initialize the cumulative answer. The problem often starts with 1 for the empty subsequence.
    let finalAnswerAccumulator = 1;

    // Iterate through the first sequence (corresponding to rows of the DP table).
    for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
        // This variable accumulates sums for the current row, specifically for non-matching characters.
        // It's crucial that this accumulator is NOT modded until it's used in the dpTable update,
        // mirroring the original code's behavior which allowed it to grow beyond ARITHMETIC_MODULO.
        let rowSumTracker = 0;

        // Iterate through the second sequence (corresponding to columns of the DP table).
        for (let colIndex = 0; colIndex < numCols; ++colIndex) {
            // Fetch values from adjacent DP cells for clarity.
            const valueFromAbove = dpTable[rowIndex][colIndex + 1];
            const valueFromLeft = dpTable[rowIndex + 1][colIndex];
            const valueFromDiagonal = dpTable[rowIndex][colIndex];

            // Check if the characters at the current positions in both sequences match.
            if (sequenceA[rowIndex] === sequenceB[colIndex]) {
                // If characters match:
                // 1. Update the row-specific sum tracker.
                rowSumTracker += (valueFromDiagonal + 1);

                // 2. Update the overall final answer, applying modulo.
                finalAnswerAccumulator = applyModulo(finalAnswerAccumulator + valueFromDiagonal + 1);

                // 3. Calculate the new DP table value for the current cell (1-indexed).
                // The sum might temporarily exceed ARITHMETIC_MODULO before the final modulo step.
                dpTable[rowIndex + 1][colIndex + 1] = valueFromLeft + valueFromAbove + 1;
            } else {
                // If characters do not match:
                // The DP value depends on the rowSumTracker and the value from the cell directly above.
                // This sum might also temporarily exceed ARITHMETIC_MODULO.
                dpTable[rowIndex + 1][colIndex + 1] = rowSumTracker + valueFromAbove;
            }

            // Apply modulo to the newly calculated DP table cell value to keep it within bounds.
            dpTable[rowIndex + 1][colIndex + 1] = applyModulo(dpTable[rowIndex + 1][colIndex + 1]);
        }
    }

    // Return the final accumulated answer.
    return finalAnswerAccumulator;
}