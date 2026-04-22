"use strict";

/**
 * A factory function that creates an input stream reader instance.
 * This module is designed to parse various data types from a provided string.
 * @returns {function(string): DataStreamProcessor} A function to create a DataStreamProcessor.
 */
const InputReaderFactory = (function() {
    /**
     * Creates a new DataStreamProcessor instance from a raw input string.
     * @param {string} rawInputContent - The complete input string, typically from a file.
     * @returns {DataStreamProcessor} An instance capable of parsing data.
     */
    function createReader(rawInputContent) {
        // Basic validation for the input content
        if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
            console.error("Input content is empty or not a string. Initializing with no data.");
            return new DataStreamProcessor(""); // Return a processor for empty string
        }
        return new DataStreamProcessor(rawInputContent);
    }

    /**
     * Constructor for the DataStreamProcessor. Manages the parsing of lines and elements.
     * @param {string} sourceText - The string containing all input data.
     */
    function DataStreamProcessor(sourceText) {
        // Store all lines after trimming whitespace and splitting by newline characters.
        this.lineBuffer = sourceText.trim().split("\n");
        // Keep track of the current line being processed.
        this.currentLineIndex = 0;
        // This will hold the elements of the current line, in reverse order for efficient popping.
        this.currentLineParts = [];
        // Tracks if the last element read was the last of its line.
        this._lineFullyConsumed = true;
    }

    /**
     * Internal helper to ensure 'currentLineParts' is loaded with elements from the current line.
     * It loads a new line's parts only when the previous line is fully consumed or it's the first call.
     * Elements are reversed to allow reading from right-to-left using `pop()`.
     */
    DataStreamProcessor.prototype._ensureLinePrepared = function() {
        // If the current line's parts are exhausted or it's a new line context, load the next line.
        if (this._lineFullyConsumed && this.currentLineIndex < this.lineBuffer.length) {
            const rawLine = this.lineBuffer[this.currentLineIndex];
            if (typeof rawLine === 'string' && rawLine.trim().length > 0) {
                this.currentLineParts = rawLine.trim().split(" ").reverse();
                this._lineFullyConsumed = false; // A new line has parts now
            } else {
                // Handle empty or whitespace-only lines by skipping them
                this.currentLineParts = [];
                this.currentLineIndex++; // Advance to the next line immediately
                this._lineFullyConsumed = true; // This empty line is consumed
                // Recursively call to try and load the *next* actual line
                return this._ensureLinePrepared();
            }
        }
    };

    /**
     * Extracts and returns the next single element from the input stream.
     * Elements are read from right-to-left within a line.
     * @param {boolean} [asString=false] - If true, returns the element as a string; otherwise, as a number.
     * @returns {string|number|null} The parsed element, or null if no more elements are available.
     */
    DataStreamProcessor.prototype.getNextElement = function(asString = false) {
        this._ensureLinePrepared();

        if (this.currentLineParts.length === 0) {
            // No more elements on this line and no more lines to load.
            return null;
        }

        const valueStr = this.currentLineParts.pop();

        if (this.currentLineParts.length === 0) {
            this.currentLineIndex++; // Advance to the next line only when current line is fully consumed
            this._lineFullyConsumed = true;
        }

        return asString ? valueStr : Number.parseFloat(valueStr);
    };

    /**
     * Reads and returns all elements from the current line.
     * The line index is advanced after this operation.
     * @param {boolean} [returnAsStrings=false] - If true, returns elements as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed elements from the current line.
     */
    DataStreamProcessor.prototype.getLineElements = function(returnAsStrings = false) {
        // Ensure that any partially processed line is reset before reading a full new line
        this.currentLineParts = [];
        this._lineFullyConsumed = true; // Mark current line as consumed so _ensureLinePrepared loads next
        this._ensureLinePrepared(); // This will load the next full line into currentLineParts

        if (this.currentLineIndex > this.lineBuffer.length || this.currentLineParts.length === 0) {
            console.warn("Attempted to read a full line beyond input bounds or from an empty line.");
            return [];
        }

        // The currentLineParts are already reversed, so we need to reverse them back to natural order
        // and then process them. After this, currentLineParts will be empty.
        const elements = this.currentLineParts.reverse().map(item => returnAsStrings ? item : Number.parseFloat(item));
        this.currentLineParts = []; // Clear the parts as the line is now fully read
        this.currentLineIndex++; // Advance to the next line.
        this._lineFullyConsumed = true; // The new line is fully consumed as well.
        return elements;
    };

    /**
     * Reads a specified number of lines and formats them as a 2D array (matrix).
     * Each line is split by space to form a row.
     * @param {number} rowCount - The number of lines to read for the matrix.
     * @param {boolean} [returnAsStrings=false] - If true, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A matrix (array of arrays) of parsed data.
     */
    DataStreamProcessor.prototype.getMatrixData = function(rowCount, returnAsStrings = false) {
        if (rowCount <= 0) {
            console.warn("Requested matrix with non-positive row count:", rowCount);
            return [];
        }
        // Ensure any pending elements on the current line are cleared
        this.currentLineParts = [];
        this._lineFullyConsumed = true;

        const startIdx = this.currentLineIndex;
        const endIdx = startIdx + rowCount;

        if (endIdx > this.lineBuffer.length) {
            console.error(`Attempted to read ${rowCount} rows for matrix, but only ${this.lineBuffer.length - startIdx} lines remain.`);
            // Return what's available, or throw an error depending on strictness
            rowCount = this.lineBuffer.length - startIdx;
        }

        const rawRows = this.lineBuffer.slice(startIdx, endIdx);
        this.currentLineIndex = endIdx; // Advance the line index past the read rows
        this._lineFullyConsumed = true; // These lines are fully consumed

        const processedMatrix = rawRows.map(line => {
            const parts = line.trim().split(" ");
            return returnAsStrings ? parts : parts.map(item => Number.parseFloat(item));
        });
        return processedMatrix;
    };

    /**
     * Reads a specified number of lines directly as an array of strings or numbers.
     * Each line becomes an element in the resulting array.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, array elements are strings; otherwise, numbers.
     * @returns {Array<string|number>} An array of parsed lines.
     */
    DataStreamProcessor.prototype.getRawLines = function(count, returnAsStrings = false) {
        if (count <= 0) {
            console.warn("Requested raw lines with non-positive count:", count);
            return [];
        }
        // Ensure any pending elements on the current line are cleared
        this.currentLineParts = [];
        this._lineFullyConsumed = true;

        const startIdx = this.currentLineIndex;
        const endIdx = startIdx + count;

        if (endIdx > this.lineBuffer.length) {
            console.error(`Attempted to read ${count} raw lines, but only ${this.lineBuffer.length - startIdx} lines remain.`);
            count = this.lineBuffer.length - startIdx;
        }

        const rawLines = this.lineBuffer.slice(startIdx, endIdx);
        this.currentLineIndex = endIdx; // Advance the line index past the read lines
        this._lineFullyConsumed = true; // These lines are fully consumed

        return returnAsStrings ? rawLines : rawLines.map(line => Number.parseFloat(line));
    };

    return createReader;
})();

// --- End of InputReaderFactory module ---

/**
 * Helper function to read the entire content of stdin.
 * Handles potential file system errors.
 * @param {string} filePath - The path to the input file (e.g., "/dev/stdin").
 * @returns {string} The content of the file, or an empty string on error.
 */
function readStandardInput(filePath) {
    try {
        const fileSystem = require("fs");
        return fileSystem.readFileSync(filePath, "utf8");
    } catch (error) {
        console.error(`Error reading input from ${filePath}:`, error.message);
        return ""; // Return empty string to allow graceful degradation
    }
}

// Initialize the input parser with content from standard input.
const inputParser = InputReaderFactory(readStandardInput("/dev/stdin"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This function replaces the original `eval`-based approach for safety and clarity.
 * @param {*} initialFillValue - The value to initialize all elements with.
 * @param {...number} dimensions - A list of numbers representing the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 * @throws {Error} If invalid dimension sizes are provided.
 */
function createMultiDimensionalArray(initialFillValue, ...dimensions) {
    if (!Array.isArray(dimensions) || dimensions.length === 0) {
        console.warn("Warning: No dimensions provided for multi-dimensional array. Returning initial value.");
        return initialFillValue;
    }

    /**
     * Recursive helper to build the array structure.
     * @param {number} dimIndex - The current dimension index being processed.
     * @returns {Array|*} An array for the current dimension, or the initial value for the innermost.
     */
    function buildRecursiveArray(dimIndex) {
        if (dimIndex >= dimensions.length) {
            // Base case: for the innermost dimension, return the initial value.
            return initialFillValue;
        }

        const currentDimensionSize = dimensions[dimIndex];
        // Basic validation for dimension size
        if (typeof currentDimensionSize !== 'number' || !Number.isInteger(currentDimensionSize) || currentDimensionSize < 0) {
            throw new Error(`Invalid dimension size provided at index ${dimIndex}: ${currentDimensionSize}. Must be a non-negative integer.`);
        }

        // Create an array for the current dimension and fill it recursively.
        const currentLevelArray = new Array(currentDimensionSize);
        for (let idx = 0; idx < currentDimensionSize; idx++) {
            currentLevelArray[idx] = buildRecursiveArray(dimIndex + 1);
        }
        return currentLevelArray;
    }

    return buildRecursiveArray(0);
}

/**
 * Calculates the number of items that can achieve a certain rank based on specific criteria.
 * This function implements a binary search algorithm.
 * @returns {number} The final count of items meeting the criteria.
 */
function solveProblem() {
    // Read problem parameters: total items, threshold for score adjustment, required count, top rank count.
    const totalItems = inputParser.getNextElement();
    const thresholdValue = inputParser.getNextElement();
    const requiredCount = inputParser.getNextElement();
    const topRankCount = inputParser.getNextElement();

    // Basic input validation for critical parameters
    if (totalItems <= 0 || thresholdValue < 0 || requiredCount < 0 || topRankCount < 0 || topRankCount > totalItems) {
        console.error("Invalid input parameters detected. Please check constraints.");
        return 0; // Indicate an error or no valid solution
    }

    // Read the array of item scores
    const itemScores = inputParser.getLineElements();

    // Ensure the array has the expected number of items
    if (itemScores.length !== totalItems) {
        console.error(`Mismatched item count. Expected ${totalItems}, got ${itemScores.length}.`);
        // Adjust totalItems or handle error appropriately. For now, use actual length.
        totalItems = itemScores.length;
    }

    // Sort the item scores in ascending order for binary search.
    itemScores.sort((val1, val2) => val1 - val2);

    // Initialize binary search boundaries.
    // `searchHigh` represents a potential index `c` (from problem description) where items can meet criteria.
    // `searchLow` represents an index where items *cannot* meet criteria.
    let searchHigh = totalItems - topRankCount; // Initial upper bound for 'c'
    let searchLow = -1; // Initial lower bound for 'c'

    // The index of the (N-P)th element, which is a critical reference point.
    const criticalRankIndex = totalItems - topRankCount;

    // Binary search loop: continues as long as there's a range to search.
    while (searchHigh - searchLow > 1) {
        // Calculate the middle index using bitwise right shift for integer division.
        const midIndex = (searchHigh + searchLow + 1) >>> 1;

        // Calculate the adjusted score for the item at `midIndex`.
        const adjustedThreshold = itemScores[midIndex] + thresholdValue;

        // Condition 1: If the adjusted score of `midIndex` is too low to pass the (N-P)th item.
        // This means `midIndex` (and anything less than it) cannot be a valid candidate.
        if (adjustedThreshold < itemScores[criticalRankIndex]) {
            searchLow = midIndex;
        }
        // Condition 2: If `midIndex` itself (and items to its right) are already within the top `requiredCount`
        // or can be considered among the top `requiredCount` items.
        // `(midIndex + topRankCount)` represents the number of items that would be ranked above or equal to `midIndex`
        // if `midIndex` is chosen as the lowest acceptable score.
        // If this count is greater than or equal to `requiredCount`, then `midIndex` is a possible candidate.
        else if (requiredCount <= (midIndex + topRankCount)) {
            searchHigh = midIndex;
        }
        // Condition 3: The more complex scenario where we need to check if the remaining capacity
        // can be satisfied by other items.
        else {
            // Calculate the total "score difference" needed to satisfy `requiredCount` items,
            // considering that `midIndex` and the `topRankCount` items are already accounted for.
            let remainingCapacityNeeded = (requiredCount - (midIndex + topRankCount)) * thresholdValue;

            // Iterate through items *after* `midIndex` (up to `criticalRankIndex`) to see if they can
            // contribute enough score difference to `remainingCapacityNeeded`.
            // The loop stops if `remainingCapacityNeeded` is met or if all relevant items are checked.
            for (let currentCheckIndex = midIndex + 1;
                 remainingCapacityNeeded > 0 && currentCheckIndex < criticalRankIndex;
                 currentCheckIndex++) {
                // Each item `itemScores[currentCheckIndex]` can contribute `adjustedThreshold - itemScores[currentCheckIndex]`
                // to cover the `remainingCapacityNeeded`.
                const contribution = adjustedThreshold - itemScores[currentCheckIndex];
                if (contribution <= 0) {
                    // If an item cannot contribute (its score is already equal or higher than adjustedThreshold),
                    // then we cannot satisfy remainingCapacityNeeded with this strategy.
                    remainingCapacityNeeded = 1; // Set to 1 to force failure if it wasn't already
                    break;
                }
                remainingCapacityNeeded -= contribution;
            }

            // If `remainingCapacityNeeded` is zero or negative, it means we successfully covered
            // the required difference, so `midIndex` is a valid candidate.
            if (remainingCapacityNeeded <= 0) {
                searchHigh = midIndex;
            } else {
                // Otherwise, `midIndex` is too high, and we need to search lower.
                searchLow = midIndex;
            }
        }
    }

    // The result is the total number of items minus the highest valid `searchHigh` index.
    // This effectively counts how many items (from `searchHigh` to `totalItems-1`) meet the criteria.
    return totalItems - searchHigh;
}

// Execute the main problem-solving function and print its result to the console.
console.log(solveProblem());