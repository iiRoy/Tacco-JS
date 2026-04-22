// This module provides a robust way to parse input data from a multi-line string.
// It allows extracting tokens, lines, and multi-dimensional data structures sequentially.
var InputParser = (function () {
    // Internal class representing a data stream for processing.
    function DataStreamProcessor(rawContent) {
        // Ensure the constructor is called with 'new'.
        if (!(this instanceof DataStreamProcessor)) {
            return new DataStreamProcessor(rawContent);
        }
        // Normalize line endings for cross-platform compatibility and split into an array of individual lines.
        // Any leading/trailing whitespace from the entire content is also removed.
        this._sourceLines = String(rawContent).trim().split(/\r?\n/);
        this._currentLineIndex = 0; // Tracks the current line being processed within _sourceLines.
        this._lineTokenCache = []; // Cache for individual tokens of the currently active line.
    }

    // Helper utility function to attempt converting a value to a number.
    // If `asStringFlag` is true, or conversion fails, the original string is returned.
    function convertToNumber(value, asStringFlag) {
        if (asStringFlag) {
            return value;
        }
        const numericValue = Number(value);
        // Return the numeric value if valid, otherwise fall back to the original string.
        return isNaN(numericValue) ? value : numericValue;
    }

    // Extracts the next available token from the input stream.
    // Tokens are consumed from the current line from left-to-right (after internal reversal).
    // Advances the line index when a line is fully consumed.
    DataStreamProcessor.prototype.getNextToken = function (returnAsString) {
        // Continuously try to fill the token cache until a token is found or all lines are processed.
        while (this._lineTokenCache.length === 0) {
            if (this._currentLineIndex >= this._sourceLines.length) {
                // If there are no more lines to read, return undefined to signal end of stream.
                return undefined;
            }
            const currentLineContent = this._sourceLines[this._currentLineIndex];
            // Split the current line by one or more spaces, filter out empty strings, then reverse.
            // Reversing allows efficient extraction using `pop()` from the logical "start" of the line.
            this._lineTokenCache = currentLineContent.split(/\s+/).filter(Boolean).reverse();

            // If the line, even after splitting, yields no tokens (e.g., an empty line),
            // advance to the next line without consuming any tokens from this one.
            if (this._lineTokenCache.length === 0) {
                this._currentLineIndex++;
                continue;
            }
            // A non-empty line has been successfully processed; increment the line index.
            this._currentLineIndex++;
        }

        const extractedToken = this._lineTokenCache.pop(); // Retrieve the next token from the cache.
        return convertToNumber(extractedToken, returnAsString); // Convert and return.
    };

    // Reads an entire line from the input stream, splits it into tokens, and returns them as an array.
    // The line index is automatically advanced after reading.
    DataStreamProcessor.prototype.extractLineTokens = function (asStrings) {
        if (this._currentLineIndex >= this._sourceLines.length) {
            return []; // Return an empty array if no more lines are available.
        }
        const lineContent = this._sourceLines[this._currentLineIndex++]; // Get line and increment index.
        const tokens = lineContent.split(/\s+/).filter(Boolean); // Split by spaces, filter out blanks.
        return asStrings ? tokens : tokens.map(token => convertToNumber(token, false));
    };

    // Reads a specified number of consecutive lines and parses them into a 2D array (matrix).
    // Each line is treated as a row, and its contents are split into tokens.
    DataStreamProcessor.prototype.extractMatrix = function (numRows, asStrings) {
        const resultMatrix = [];
        const startIndex = this._currentLineIndex;
        // Calculate the end index, ensuring it doesn't exceed the total number of source lines.
        const endIndex = Math.min(startIndex + numRows, this._sourceLines.length);

        for (let i = startIndex; i < endIndex; i++) {
            const lineContent = this._sourceLines[i];
            const rowTokens = lineContent.split(/\s+/).filter(Boolean);
            resultMatrix.push(asStrings ? rowTokens : rowTokens.map(token => convertToNumber(token, false)));
        }
        this._currentLineIndex = endIndex; // Update the internal line index to reflect consumed lines.
        return resultMatrix;
    };

    // Reads a specified number of consecutive lines and returns them as a 1D array.
    // Each line is considered a single item in the array.
    DataStreamProcessor.prototype.extractLinesAsArray = function (count, asStrings) {
        const extractedSegments = [];
        const startIndex = this._currentLineIndex;
        // Determine the actual number of lines to process, up to the end of the source.
        const end = Math.min(startIndex + count, this._sourceLines.length);

        for (let idx = startIndex; idx < end; idx++) {
            const lineData = this._sourceLines[idx];
            extractedSegments.push(asStrings ? lineData : convertToNumber(lineData, false));
        }
        this._currentLineIndex = end; // Advance the line index.
        return extractedSegments;
    };

    // The factory function returned by the IIFE, used to create new parser instances.
    return function createParser(inputString) {
        return new DataStreamProcessor(inputString);
    };
})();

// Instantiate the input reader from standard input.
// This typically involves reading the entire content of /dev/stdin.
const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to dynamically initialize a multi-dimensional array without using `eval`.
// It takes an initial value and then a variable number of arguments representing dimensions.
function initializeMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue; // Base case: if no dimensions, return the initial value directly.
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        // Recursively fill each slot with a sub-array or the initial value.
        newArray[i] = initializeMultiDimArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

// Performs a binary search to find the insertion point for a target value
// in a sorted array. It returns the index of the first element that is
// strictly greater than the target value. If no such element exists,
// it returns `sortedArray.length`. This is an upper_bound equivalent.
function getUpperBoundIndex(sortedArray, lowBoundary, highBoundary, targetValue) {
    // Basic validation for the array and boundaries.
    if (!Array.isArray(sortedArray) || sortedArray.length === 0) {
        return 0; // For an empty array, insertion point is always 0.
    }
    // Correct potentially invalid boundary inputs to stay within array bounds.
    lowBoundary = Math.max(0, lowBoundary);
    highBoundary = Math.min(sortedArray.length, highBoundary);

    let leftPointer = lowBoundary;
    let rightPointer = highBoundary;
    let midPoint;

    // The loop continues as long as there is a valid search range.
    while (leftPointer < rightPointer) {
        midPoint = Math.floor((leftPointer + rightPointer) / 2); // Calculate the middle index.

        // If the element at midPoint is less than or equal to the target,
        // it means all elements up to midPoint (and possibly midPoint itself)
        // are not strictly greater than the target. So, we search in the right half.
        if (sortedArray[midPoint] <= targetValue) {
            leftPointer = midPoint + 1; // Move the left pointer to the right of midPoint.
        } else {
            // If sortedArray[midPoint] is strictly greater than target,
            // then midPoint could be our answer, or an element to its left could be.
            // We narrow the search to the left half including midPoint.
            rightPointer = midPoint;
        }
    }
    // When the loop terminates, leftPointer (which equals rightPointer)
    // is the index of the first element strictly greater than targetValue,
    // or sortedArray.length if all elements are less than or equal to targetValue.
    return leftPointer;
}

// Execute the primary processing logic and print the result to the console.
console.log(processSequence());

// Main function encapsulating the core algorithm for finding the Longest Increasing Subsequence (LIS) length.
// This implementation uses a variation of Patience Sorting, which runs in O(N log K) time,
// where N is the sequence length and K is the length of the LIS.
function processSequence() {
    // Read the total number of elements that will form the sequence.
    const sequenceLength = inputReader.getNextToken();

    // Implement a guard clause for invalid or empty sequence lengths.
    if (sequenceLength === undefined || sequenceLength <= 0) {
        return 0; // An empty sequence has an LIS of length 0.
    }

    // Read the entire sequence of numbers. It's assumed each number is on its own line.
    const originalSequence = inputReader.extractLinesAsArray(sequenceLength);

    // This array, `activeTails`, is central to the LIS algorithm.
    // `activeTails[i]` will store the smallest ending element of all increasing subsequences of length `i+1` found so far.
    // The initial value `[1]` might serve as a sentinel or a base case depending on problem specifics.
    // For a standard LIS, it's often initialized as an empty array or `[-Infinity]`.
    const activeTails = [1];

    // Iterate through each element of the original input sequence.
    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        const currentValue = originalSequence[currentIdx];

        // For this specific LIS variant, values are negated before searching.
        // This often implies finding the Longest Non-Increasing Subsequence using `upper_bound`
        // on negated values, or a specific problem transformation.
        const targetForSearch = -currentValue;

        // Use binary search to find the correct position for `targetForSearch` in `activeTails`.
        // `getUpperBoundIndex` finds the index of the first element in `activeTails` that is
        // strictly greater than `targetForSearch`.
        const insertionPoint = getUpperBoundIndex(activeTails, 0, activeTails.length, targetForSearch);

        // If `insertionPoint` is equal to the current length of `activeTails`,
        // it means `targetForSearch` is greater than all existing elements in `activeTails`.
        // This signifies that we've found an increasing subsequence that is one element longer.
        if (insertionPoint === activeTails.length) {
            activeTails.push(targetForSearch); // Extend the longest subsequence.
        } else {
            // Otherwise, `targetForSearch` is less than or equal to an existing element at `insertionPoint`.
            // By replacing `activeTails[insertionPoint]` with `targetForSearch`, we ensure that
            // for subsequences of length `insertionPoint + 1`, we maintain the smallest possible ending element.
            // This allows for potentially longer overall subsequences later on.
            activeTails[insertionPoint] = targetForSearch;
        }
    }

    // The final length of the `activeTails` array represents the length of the Longest Increasing Subsequence.
    return activeTails.length;
}