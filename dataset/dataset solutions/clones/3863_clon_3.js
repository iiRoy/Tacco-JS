// This module encapsulates functionality for reading various types of data
// from a buffered text input, primarily designed to mimic standard input streams.
var StreamReader = (function() {

    /**
     * Initializes and returns a new instance of the input buffer.
     * This serves as the primary entry point for acquiring a reader object.
     * @param {string} rawInputContent - The entire input data as a single string.
     * @returns {InputBuffer} An object capable of parsing the input content.
     */
    function createInputParser(rawInputContent) {
        return new InputBuffer(rawInputContent);
    }

    /**
     * The core class that manages the input data, line by line.
     * It keeps track of the current reading position and provides methods
     * to extract data in different formats.
     * @class
     * @param {string} initialText - The string containing all input lines.
     */
    function InputBuffer(initialText) {
        // All lines from the input text, cleaned of leading/trailing whitespace
        // and split into an array by newline characters.
        this.documentLines = initialText.trim().split("\n");
        // A pointer indicating the index of the next line to be processed.
        this.currentLineMarker = 0;
        // A temporary storage for tokens if a line is being read token by token.
        // This helps manage state between successive calls to fetchIndividualToken.
        this.cachedTokensFromLine = null;
    }

    /**
     * Extracts and returns the next single token from the input stream.
     * Tokens are typically separated by spaces within a line.
     * Advances the internal line marker if the current line is fully consumed.
     * @param {boolean} [shouldReturnAsString=false] - If true, the token is returned as a string.
     *                                                  Otherwise, an attempt is made to convert it to a floating-point number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more input is available.
     */
    InputBuffer.prototype.fetchIndividualToken = function(shouldReturnAsString) {
        // Guard against reading beyond the available input lines.
        if (this.currentLineMarker >= this.documentLines.length) {
            return undefined; // No more data to read.
        }

        // If no tokens are cached or the cache is empty, process the next line.
        if (!this.cachedTokensFromLine || this.cachedTokensFromLine.length === 0) {
            const activeLineData = this.documentLines[this.currentLineMarker];
            // Split the line by spaces and reverse the array.
            // This allows `pop()` to extract tokens from left-to-right (first to last).
            this.cachedTokensFromLine = activeLineData.split(" ").reverse();
        }

        // Retrieve the token from the end of the reversed array.
        const acquiredToken = this.cachedTokensFromLine.pop();

        // If the current line's tokens are now exhausted, advance the line marker
        // and clear the token cache for the next line.
        if (this.cachedTokensFromLine.length === 0) {
            this.currentLineMarker++;
            this.cachedTokensFromLine = null;
        }

        // Return the token, converting to number if not explicitly requested as string.
        return shouldReturnAsString ? acquiredToken : parseFloat(acquiredToken);
    };

    /**
     * Reads an entire line from the input and splits it into an array of tokens.
     * The internal line marker is advanced after reading.
     * @param {boolean} [shouldReturnAsString=false] - If true, tokens are returned as strings.
     *                                                  Otherwise, they are converted to floating-point numbers.
     * @returns {Array<string|number>|undefined} An array of tokens from the line, or undefined if no more lines.
     */
    InputBuffer.prototype.fetchEntireLine = function(shouldReturnAsString) {
        // Check if there are lines left to read.
        if (this.currentLineMarker >= this.documentLines.length) {
            return undefined;
        }

        // Fetch the current line and immediately advance the line marker.
        const lineContent = this.documentLines[this.currentLineMarker++];
        const lineTokens = lineContent.split(" ");

        // Clear any cached tokens as a full line has been consumed.
        this.cachedTokensFromLine = null;

        // Map tokens to numbers if not requested as strings.
        return shouldReturnAsString ? lineTokens : lineTokens.map(parseFloat);
    };

    /**
     * Reads a specified number of lines, treating each as a row in a 2D array (matrix).
     * The line marker is advanced by the number of lines read.
     * @param {number} rowCount - The number of lines to read for the matrix.
     * @param {boolean} [shouldReturnAsString=false] - If true, matrix elements are strings.
     *                                                  Otherwise, they are numbers.
     * @returns {Array<Array<string|number>>|undefined} A 2D array representing the matrix,
     *                                                  or undefined if `rowCount` is invalid or not enough lines exist.
     */
    InputBuffer.prototype.fetchDataMatrix = function(rowCount, shouldReturnAsString) {
        // Validate the row count and ensure sufficient lines are available.
        if (rowCount <= 0 || this.currentLineMarker + rowCount > this.documentLines.length) {
            return undefined;
        }

        // Extract the relevant lines.
        const matrixRows = this.documentLines.slice(this.currentLineMarker, this.currentLineMarker + rowCount);
        this.currentLineMarker += rowCount; // Advance the line marker.
        this.cachedTokensFromLine = null; // Clear token cache.

        // Process each row: split into tokens and convert to numbers if needed.
        const processedMatrix = matrixRows.map(row => {
            const rowElements = row.split(" ");
            return shouldReturnAsString ? rowElements : rowElements.map(parseFloat);
        });

        return processedMatrix;
    };

    /**
     * Reads a specified number of lines, treating each as a single value.
     * The line marker is advanced by the number of lines read.
     * @param {number} valueCount - The number of lines to read.
     * @param {boolean} [shouldReturnAsString=false] - If true, values are strings.
     *                                                  Otherwise, they are numbers.
     * @returns {Array<string|number>|undefined} An array of values,
     *                                            or undefined if `valueCount` is invalid or not enough lines exist.
     */
    InputBuffer.prototype.fetchMultipleLines = function(valueCount, shouldReturnAsString) {
        // Validate the count and ensure sufficient lines.
        if (valueCount <= 0 || this.currentLineMarker + valueCount > this.documentLines.length) {
            return undefined;
        }

        // Extract lines and advance the marker.
        const acquiredLines = this.documentLines.slice(this.currentLineMarker, this.currentLineMarker + valueCount);
        this.currentLineMarker += valueCount;
        this.cachedTokensFromLine = null; // Clear token cache.

        // Convert values to numbers if specified.
        return shouldReturnAsString ? acquiredLines : acquiredLines.map(parseFloat);
    };

    return createInputParser;
})();


// Global variable to hold the input parser instance.
let inputSourceReader;

// Attempt to initialize the input parser by reading from standard input.
try {
    const fileSystemModule = require("fs");
    const fullInputText = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    inputSourceReader = StreamReader(fullInputText);
} catch (ioError) {
    console.error("Failed to read input from /dev/stdin:", ioError.message);
    // Exit the process if input cannot be obtained, as it's critical for the program.
    process.exit(1);
}

/**
 * The primary function that executes the problem-solving logic.
 * This function calculates the total number of subarrays within a given sequence
 * of numbers that sum up to zero. It utilizes the prefix sum technique.
 * @returns {number} The total count of zero-sum subarrays found.
 */
function determineZeroSumSubarrayCount() {
    // Read the first number from input, which represents the total number of elements
    // in the sequence that follows.
    const sequenceLength = inputSourceReader.fetchIndividualToken();

    // Perform validation on the sequence length. If invalid, return 0 or handle error.
    if (sequenceLength === undefined || isNaN(sequenceLength) || sequenceLength < 0) {
        console.error("Error: Invalid or missing sequence length provided in input.");
        return 0;
    }

    // Read the actual sequence of numbers from the next line of input.
    const numericSequence = inputSourceReader.fetchEntireLine();

    // Validate that the read sequence matches the declared length.
    if (!numericSequence || numericSequence.length !== sequenceLength) {
        console.error("Error: Input sequence does not match declared length or is malformed.");
        return 0;
    }

    // A Map to store the frequency of each prefix sum encountered so far.
    // Key: The prefix sum value.
    // Value: The number of times this prefix sum has been observed.
    const prefixSumFrequencies = new Map();
    // Initialize the map with a prefix sum of 0 occurring once.
    // This is crucial to correctly count subarrays that start from the very beginning
    // and sum to zero (e.g., if the sum from index 0 to k is 0).
    prefixSumFrequencies.set(0, 1);

    let totalZeroSumSubarrays = 0; // Accumulator for the final count.
    let currentCumulativeSum = 0;   // Keeps track of the running sum of elements.

    // Iterate through each number in the input sequence.
    for (let elementIndex = 0; elementIndex < sequenceLength; elementIndex++) {
        // Add the current element to the running sum.
        currentCumulativeSum += numericSequence[elementIndex];

        // Retrieve how many times this `currentCumulativeSum` has been seen before.
        // If it hasn't been seen, its frequency is 0.
        const previousOccurrences = prefixSumFrequencies.get(currentCumulativeSum) || 0;

        // Each previous occurrence of this `currentCumulativeSum` indicates a subarray
        // ending at the current `elementIndex` that sums to zero.
        // For example, if `S_j = S_i`, then `A[i+1...j]` sums to zero.
        // The `previousOccurrences` directly tells us how many such `i` exist.
        totalZeroSumSubarrays += previousOccurrences;

        // Increment the frequency count for the current cumulative sum in the map.
        prefixSumFrequencies.set(currentCumulativeSum, previousOccurrences + 1);
    }

    // Return the final count of subarrays that sum to zero.
    return totalZeroSumSubarrays;
}

// Execute the main problem-solving function and capture its result.
const finalResultOfCalculation = determineZeroSumSubarrayCount();

// Output the result to the console. Add a final validation check for robustness.
if (typeof finalResultOfCalculation === 'number' && !isNaN(finalResultOfCalculation)) {
    console.log(finalResultOfCalculation);
} else {
    console.error("Error: The calculated result is not a valid number.");
    process.exit(1);
}