"use strict"; // Enforces stricter parsing and error handling

/**
 * @module InputProcessor
 * @description A utility module for parsing structured input from a string, typically read from a file.
 * It provides methods to read various data types like single values, lines of values, and matrices.
 */
const InputProcessor = (function () {

    /**
     * Factory function to create a new input reader instance.
     * @param {string} rawInputString The entire input content as a single string.
     * @returns {LineStreamReader} An instance of the LineStreamReader.
     */
    function createReader(rawInputString) {
        return new LineStreamReader(rawInputString);
    }

    /**
     * Helper function to convert a string to a number, or return the string if conversion is not desired.
     * @param {string} valueString The string value to convert.
     * @param {boolean} keepAsString If true, returns the string as is; otherwise, converts to a number.
     * @returns {string|number} The converted number or the original string.
     */
    function parseValue(valueString, keepAsString) {
        // Use parseInt for explicit integer conversion.
        return keepAsString ? valueString : parseInt(valueString, 10);
    }

    /**
     * Represents a stream-like reader for processing input line by line.
     * @class LineStreamReader
     * @param {string} inputData The full input string.
     */
    function LineStreamReader(inputData) {
        // Trim leading/trailing whitespace from the entire input and split into an array of lines.
        // Filter out any empty lines that might result from multiple newlines or trailing newlines.
        this.sourceLines = inputData.trim().split("\n").filter(line => line.length > 0);
        this.currentLineIndex = 0; // Tracks the current line being processed.

        // Add a validation for effectively empty input
        if (this.sourceLines.length === 0 && inputData.trim().length > 0) {
            console.warn("InputProcessor: Input data contains only empty lines or whitespace after trimming.");
        }
    }

    /**
     * Reads a single "atom" (value) from the current line. It processes the current line
     * by splitting it into tokens and popping the last one. If the line becomes empty,
     * it advances to the next line. This emulates a stack-like reading from the end of a line.
     * @param {boolean} [returnAsString=false] If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The parsed atom.
     * @throws {Error} If attempting to read past the end of the input stream.
     */
    LineStreamReader.prototype.readSingleValue = function (returnAsString = false) {
        // Ensure there are lines left to read.
        if (this.currentLineIndex >= this.sourceLines.length) {
            throw new Error("InputProcessor: Attempted to read a single value past the end of input stream.");
        }

        let lineTokens = this.sourceLines[this.currentLineIndex];

        // If the current line is still a string, it means it hasn't been split into tokens yet by this method.
        // Split it by space and reverse to allow popping from the "right" (original last element).
        if (typeof lineTokens === "string") {
            // Store the processed line (now an array of tokens) back into sourceLines to avoid re-splitting on subsequent calls for the same line.
            this.sourceLines[this.currentLineIndex] = lineTokens.split(" ").reverse();
            lineTokens = this.sourceLines[this.currentLineIndex]; // Update reference to the array of tokens.
        }

        const extractedToken = lineTokens.pop(); // Get the last token from the reversed array.

        // If the current line (now an array of tokens) is exhausted, move the pointer to the next line.
        if (lineTokens.length === 0) {
            this.currentLineIndex++;
        }

        return parseValue(extractedToken, returnAsString);
    };

    /**
     * Reads an entire line of space-separated values.
     * @param {boolean} [keepAsStrings=false] If true, values are returned as strings; otherwise, converted to numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     * @throws {Error} If attempting to read past the end of the input stream.
     */
    LineStreamReader.prototype.readLineOfValues = function (keepAsStrings = false) {
        if (this.currentLineIndex >= this.sourceLines.length) {
            throw new Error("InputProcessor: Attempted to read a line of values past the end of input stream.");
        }

        // Retrieve the current line and immediately advance the line pointer.
        const currentLineContent = this.sourceLines[this.currentLineIndex++];
        const tokens = currentLineContent.split(" ");

        // Convert each token based on the keepAsStrings flag.
        return tokens.map(token => parseValue(token, keepAsStrings));
    };

    /**
     * Reads a block of 'numRows' lines, where each line contains space-separated values,
     * effectively forming a matrix or 2D array.
     * @param {number} numRows The number of lines (rows) to read.
     * @param {boolean} [retainStrings=false] If true, values are retained as strings; otherwise, converted to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix data.
     * @throws {Error} If there are not enough lines available to read the specified number of rows.
     */
    LineStreamReader.prototype.readMatrixBlock = function (numRows, retainStrings = false) {
        if (numRows <= 0) {
            console.warn("InputProcessor: Requested to read 0 or negative rows for matrix block. Returning empty array.");
            return [];
        }
        if (this.currentLineIndex + numRows > this.sourceLines.length) {
            throw new Error(`InputProcessor: Not enough lines available to read a matrix block of ${numRows} rows. Remaining: ${this.sourceLines.length - this.currentLineIndex}`);
        }

        const matrixData = [];
        for (let i = 0; i < numRows; i++) {
            // Read each line and process its tokens, then add to the matrix.
            const line = this.sourceLines[this.currentLineIndex++];
            const rowTokens = line.split(" ");
            matrixData.push(rowTokens.map(token => parseValue(token, retainStrings)));
        }
        return matrixData;
    };

    return createReader; // The public interface of the module is the factory function.
})();

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function replaces the `eval`-based approach with a recursive one for safety and clarity.
 * @param {*} initialValue The value to initialize all elements with.
 * @param {...number} dimensions A variable number of arguments representing the size of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimensionalArray(initialValue, ...dimensions) {
    // Base case: If no more dimensions are specified, return the initial value itself.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    // Guard against invalid dimension sizes.
    if (currentDimensionSize <= 0) {
        console.warn(`createMultiDimensionalArray: Encountered non-positive dimension size (${currentDimensionSize}). Returning empty array for this level.`);
        return [];
    }

    const remainingDimensions = dimensions.slice(1);
    const result = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        // Recursively fill the current dimension with arrays for the next dimensions.
        result[i] = createMultiDimensionalArray(initialValue, ...remainingDimensions);
    }
    return result;
}

// --- Main execution block ---

// Initialize the input data stream reader by reading from standard input.
let inputDataStream;
try {
    const fs = require("fs");
    const rawInputContent = fs.readFileSync("/dev/stdin", "utf8");
    inputDataStream = InputProcessor(rawInputContent);
} catch (error) {
    // Provide a more informative error message for input reading failures.
    console.error("Critical Error: Failed to read input from /dev/stdin:", error.message);
    // Terminate the process as input is essential for problem execution.
    process.exit(1);
}

/**
 * The main function to solve the problem using dynamic programming.
 * This problem structure typically represents a variation of the knapsack problem,
 * where we maximize value given a capacity constraint.
 * @returns {number} The maximum value achievable based on the given items and capacity.
 */
function solveProblem() {
    // Read problem parameters: the total number of distinct items and the knapsack's maximum capacity.
    const numberOfItems = inputDataStream.readSingleValue();
    const knapsackCapacity = inputDataStream.readSingleValue();

    // Basic validation for input parameters.
    if (numberOfItems <= 0 || knapsackCapacity < 0) {
        console.warn(`solveProblem: Invalid input parameters - numberOfItems=${numberOfItems}, knapsackCapacity=${knapsackCapacity}. Returning 0.`);
        return 0;
    }

    // Read details for each item. Each item has a 'weight' (cost) and a 'value'.
    // The `itemDetails` will be a 2D array: `[[weight1, value1], [weight2, value2], ...]`.
    const itemDetails = inputDataStream.readMatrixBlock(numberOfItems);

    // Define a buffer for the DP table size. The original code used `t+3001`,
    // which implies that the maximum possible sum of weights could exceed `knapsackCapacity`.
    // This buffer ensures the DP table can accommodate these larger indices.
    const DP_CAPACITY_BUFFER = 3001;
    const totalDPCapacity = knapsackCapacity + DP_CAPACITY_BUFFER;

    // Initialize the dynamic programming table. `dpTable[k]` will store the maximum value
    // achievable for a total weight of `k`. All values are initialized to 0.
    const dpTable = createMultiDimensionalArray(0, totalDPCapacity);

    // Dynamic programming loop: Iterate through each item available.
    for (let currentItemIndex = 0; currentItemIndex < numberOfItems; currentItemIndex++) {
        const currentItemWeight = itemDetails[currentItemIndex][0];
        const currentItemValue = itemDetails[currentItemIndex][1];

        // Inner loop: Iterate through possible capacities in reverse order.
        // Reverse iteration is crucial for the 0/1 knapsack variant to ensure each item
        // is considered only once per capacity calculation (i.e., we don't use the same item multiple times
        // within the same iteration for a given `currentItemIndex`).
        // Including `currentCapacity = 0` allows items to be placed starting from an empty knapsack.
        for (let currentCapacity = knapsackCapacity; currentCapacity >= 0; currentCapacity--) {
            // Check if adding the current item's weight would exceed the maximum bounds of our DP table.
            // This prevents out-of-bounds array access.
            const targetCapacityAfterAddition = currentCapacity + currentItemWeight;
            if (targetCapacityAfterAddition < totalDPCapacity) {
                // Calculate the potential value if we include the current item.
                // This is the value from the previous state (`dpTable[currentCapacity]`) plus the current item's value.
                const potentialNewValue = dpTable[currentCapacity] + currentItemValue;

                // Update the DP table: Take the maximum of the current value at `targetCapacityAfterAddition`
                // and the `potentialNewValue`. This ensures we always store the highest value for a given capacity.
                dpTable[targetCapacityAfterAddition] = Math.max(
                    dpTable[targetCapacityAfterAddition],
                    potentialNewValue
                );
            }
        }
    }

    // After processing all items, find the maximum value stored anywhere in the DP table.
    // This accounts for problems where the optimal solution might not perfectly fill `knapsackCapacity`
    // but rather achieve the highest value at some capacity up to `totalDPCapacity`.
    let maximumAchievedValue = 0;
    // Iterate through the entire DP table to find the global maximum.
    for (let k = 0; k < dpTable.length; k++) {
        if (dpTable[k] > maximumAchievedValue) {
            maximumAchievedValue = dpTable[k];
        }
    }
    // An alternative, more concise way to find the max (but potentially less performant for extremely large arrays)
    // maximumAchievedValue = Math.max(...dpTable);

    return maximumAchievedValue;
}

// Execute the main problem-solving logic and print the final result to standard output.
console.log(solveProblem());