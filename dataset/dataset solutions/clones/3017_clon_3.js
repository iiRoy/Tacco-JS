const DataProcessor = (function() {
    /**
     * Internal class to manage buffering and reading lines from the input source.
     * @param {string} rawInputSource - The complete input string.
     */
    function LineBuffer(rawInputSource) {
        // Store lines, trimming whitespace and splitting by newline.
        this.bufferedLines = rawInputSource.trim().split("\n");
        // Pointer to the current line being processed.
        this.currentLineIndex = 0;
        // Cache for pre-parsed lines to optimize item extraction.
        this.parsedLineCache = new Map();
    }

    /**
     * Helper to safely convert a value to a number.
     * @param {*} val - The value to convert.
     * @returns {number} The numeric value, or NaN if conversion fails.
     */
    const convertToNumber = (val) => Number(val);

    /**
     * Retrieves the next individual item from the input.
     * If the current line is exhausted, it advances to the next.
     * @param {boolean} [returnRawString=false] - If true, returns the item as a string; otherwise, attempts to convert to number.
     * @returns {string|number|undefined} The extracted item, or undefined if no more items are available.
     */
    LineBuffer.prototype.getNextItem = function(returnRawString = false) {
        if (this.currentLineIndex >= this.bufferedLines.length) {
            return undefined; // No more lines
        }

        let lineItems;
        if (this.parsedLineCache.has(this.currentLineIndex)) {
            lineItems = this.parsedLineCache.get(this.currentLineIndex);
        } else {
            // Split the current line into items and store it in cache.
            const currentLineContent = this.bufferedLines[this.currentLineIndex];
            lineItems = currentLineContent.split(" ");
            this.parsedLineCache.set(this.currentLineIndex, lineItems);
        }

        if (lineItems.length === 0) {
            // If the line was empty or all items processed, advance to the next line.
            this.currentLineIndex++;
            this.parsedLineCache.delete(this.currentLineIndex - 1); // Clean up cache
            return this.getNextItem(returnRawString); // Try again on the new line
        }

        const extractedSegment = lineItems.shift(); // Get the first item
        if (lineItems.length === 0) {
            // If this item was the last on the line, mark line as consumed.
            this.currentLineIndex++;
            this.parsedLineCache.delete(this.currentLineIndex - 1); // Clean up cache
        } else {
            // Update cache with remaining items.
            this.parsedLineCache.set(this.currentLineIndex, lineItems);
        }
        
        return returnRawString ? extractedSegment : convertToNumber(extractedSegment);
    };

    /**
     * Reads the entire current line and returns its elements.
     * Advances the line pointer.
     * @param {boolean} [returnRawString=false] - If true, returns elements as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of elements from the line.
     */
    LineBuffer.prototype.getLineElements = function(returnRawString = false) {
        if (this.currentLineIndex >= this.bufferedLines.length) {
            return []; // No more lines
        }
        const lineContent = this.bufferedLines[this.currentLineIndex++];
        this.parsedLineCache.delete(this.currentLineIndex - 1); // Clean up cache for consumed line

        const elements = lineContent.split(" ");
        return returnRawString ? elements : elements.map(convertToNumber);
    };

    /**
     * Reads a specified number of lines and returns them as a 2D array (matrix).
     * Advances the line pointer by `lineCount`.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} [returnRawString=false] - If true, returns elements as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of the read data.
     */
    LineBuffer.prototype.getMatrixData = function(lineCount, returnRawString = false) {
        const startIndex = this.currentLineIndex;
        let effectiveLineCount = lineCount;
        if (startIndex + effectiveLineCount > this.bufferedLines.length) {
            effectiveLineCount = this.bufferedLines.length - startIndex; // Adjust lineCount if fewer lines available
        }

        const extractedRows = this.bufferedLines.slice(startIndex, startIndex + effectiveLineCount).map(line => {
            const elements = line.split(" ");
            return returnRawString ? elements : elements.map(convertToNumber);
        });
        this.currentLineIndex = startIndex + effectiveLineCount; // Update line pointer
        // Clear cache for consumed lines
        for (let i = startIndex; i < this.currentLineIndex; i++) {
            this.parsedLineCache.delete(i);
        }
        return extractedRows;
    };

    /**
     * Reads a specified number of lines directly without splitting them into elements.
     * Advances the line pointer by `lineCount`.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} [returnRawString=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of the raw lines.
     */
    LineBuffer.prototype.getRawBlocks = function(lineCount, returnRawString = false) {
        const startIndex = this.currentLineIndex;
        let effectiveLineCount = lineCount;
        if (startIndex + effectiveLineCount > this.bufferedLines.length) {
            effectiveLineCount = this.bufferedLines.length - startIndex; // Adjust lineCount if fewer lines available
        }

        const extractedBlocks = this.bufferedLines.slice(startIndex, startIndex + effectiveLineCount);
        this.currentLineIndex = startIndex + effectiveLineCount; // Update line pointer
        // Clear cache for consumed lines
        for (let i = startIndex; i < this.currentLineIndex; i++) {
            this.parsedLineCache.delete(i);
        }
        return returnRawString ? extractedBlocks : extractedBlocks.map(convertToNumber);
    };

    // Public API for the DataProcessor module.
    return {
        /**
         * Creates a new reader instance for processing input.
         * @param {string} sourceContent - The string containing all input data.
         * @returns {LineBuffer} A new instance of the LineBuffer.
         */
        createReader: function(sourceContent) {
            return new LineBuffer(sourceContent);
        }
    };
})();

// Helper to read standard input, specific to Node.js environments.
function readStandardInput() {
    try {
        const fs = require("fs");
        return fs.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        console.error("Failed to read from /dev/stdin. Ensure input is provided.", error);
        // Fallback for testing or environments without /dev/stdin
        return ""; 
    }
}

// Instantiate the data reader with input from stdin.
const inputSource = DataProcessor.createReader(readStandardInput());

/**
 * Recursively initializes a multi-dimensional array with a specified initial value.
 * @param {any} initialValue - The value to fill the array with.
 * @param {number[]} dimensions - An array of integers specifying the size of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    if (currentDimensionSize <= 0) {
        return []; // Handle invalid dimension size gracefully
    }

    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = initializeNestedArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

// Execute the main problem-solving logic and print the result.
console.log(findOptimalPath());

/**
 * Solves the main problem: finding the minimum cost to transform a sequence.
 * The problem typically involves counting specific characters from left and right.
 * @returns {number} The calculated minimum cost.
 */
function findOptimalPath() {
    // Read the total number of items from the input.
    const totalItems = inputSource.getNextItem();
    // Validate input: totalItems must be a non-negative integer.
    if (typeof totalItems !== 'number' || !Number.isInteger(totalItems) || totalItems < 0) {
        console.error("Invalid input: totalItems must be a non-negative integer.");
        return -1; // Indicate error
    }
    if (totalItems === 0) {
        // Special case: if no items, no cost.
        return 0;
    }

    // Read the character sequence (string) from the input.
    const characterSequence = inputSource.getNextItem(true);
    // Basic validation for the sequence.
    if (typeof characterSequence !== 'string' || characterSequence.length !== totalItems) {
        console.error("Input error: character sequence length mismatch or invalid type.");
        return -1; // Indicate error
    }

    // Initialize arrays to store prefix counts of '#' and suffix counts of '.'.
    // Array sizes are totalItems + 1 to handle boundary conditions (0-indexed up to totalItems).
    const leftHashCounts = initializeNestedArray(0, totalItems + 1);
    const rightDotCounts = initializeNestedArray(0, totalItems + 1);

    // Initial minimum cost set to a very high value.
    let minimumCost = Infinity;

    // First pass: Calculate prefix sums for '#' characters.
    // leftHashCounts[currentIdx] stores the count of '#' from index 0 up to (but not including) currentIdx.
    for (let currentIdx = 0; currentIdx < totalItems; ++currentIdx) {
        const previousCount = leftHashCounts[currentIdx];
        leftHashCounts[currentIdx + 1] = previousCount; // Carry over previous count
        // If the current character is '#', increment the count for the next position.
        if (characterSequence[currentIdx] === '#') {
            leftHashCounts[currentIdx + 1]++;
        }
    }

    // Second pass: Calculate suffix sums for '.' characters.
    // rightDotCounts[currentIdx] stores the count of '.' from index currentIdx up to (but not including) totalItems.
    // We iterate backwards from totalItems-1 down to 0.
    for (let currentIdx = totalItems - 1; currentIdx >= 0; --currentIdx) {
        const nextCount = rightDotCounts[currentIdx + 1];
        rightDotCounts[currentIdx] = nextCount; // Carry over count from the right
        // If the current character is '.', increment the count for the current position.
        if (characterSequence[currentIdx] === '.') {
            rightDotCounts[currentIdx]++;
        }
    }

    // Third pass: Determine the minimum combined cost.
    // We consider splitting the sequence at each possible point 'k' (from 0 to totalItems).
    // The cost at split point 'k' is the number of '#' to the left of 'k' + number of '.' to the right of 'k'.
    // leftHashCounts[k] represents '#' from index 0 to k-1.
    // rightDotCounts[k] represents '.' from index k to totalItems-1.
    for (let splitPoint = 0; splitPoint <= totalItems; ++splitPoint) {
        const currentHashCount = leftHashCounts[splitPoint];
        const currentDotCount = rightDotCounts[splitPoint];
        const combinedTransformationCost = currentHashCount + currentDotCount;

        // Update the minimum cost found so far.
        if (combinedTransformationCost < minimumCost) {
            minimumCost = combinedTransformationCost;
        }
    }

    return minimumCost;
}