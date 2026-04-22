const InputProcessor = (function () {
    /**
     * Factory function to create a new parser instance from the given input string.
     * @param {string} rawInputText - The entire input data as a single string.
     * @returns {StreamParser} A new parser object configured with the input.
     */
    function createParser(rawInputText) {
        // Adding a guard clause for empty or invalid input to prevent runtime errors.
        if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
            console.warn("InputProcessor received empty or invalid input. Returning a parser that will yield no data.");
            return new StreamParser(""); // Return a parser for an empty string.
        }
        return new StreamParser(rawInputText);
    }

    /**
     * @class
     * @description Internal class responsible for parsing input streams line by line.
     *              It manages an array of raw input lines and a pointer to the current line.
     * @param {string} sourceData - The full text input from which to parse.
     */
    function StreamParser(sourceData) {
        // The original logic trims the entire input string before splitting into lines.
        this._lineSegments = sourceData.trim().split("\n");
        this._currentLinePtr = 0; // Pointer to the index of the current line being processed.
    }

    /**
     * Reads a single token (element) from the current line.
     * If the current line is exhausted or empty, it automatically advances to the next line.
     * @param {boolean} [retrieveAsString=false] - If true, the token is returned as a string;
     *                                             otherwise, it attempts numeric conversion.
     * @returns {string|number|null} The extracted token or null if no more input lines are available.
     */
    StreamParser.prototype.fetchToken = function (retrieveAsString = false) {
        // Ensure we do not attempt to read past the end of the input lines.
        if (this._currentLinePtr >= this._lineSegments.length) {
            return null; // No more lines to process, return null to indicate end of stream.
        }

        // Check if the current line segment is still a string (meaning it hasn't been split into tokens yet).
        if (typeof this._lineSegments[this._currentLinePtr] === "string") {
            // Split the raw line into tokens, filtering out any empty strings that might result from multiple spaces.
            // Replace the raw string in `_lineSegments` with the array of its tokens for this line.
            this._lineSegments[this._currentLinePtr] = this._lineSegments[this._currentLinePtr].split(" ").filter(token => token.length > 0);
        }

        let currentTokensArray = this._lineSegments[this._currentLinePtr];

        // If the current line (now an array of tokens) is empty, advance to the next line and try again.
        if (currentTokensArray.length === 0) {
            this._currentLinePtr++;
            // Recursively call fetchToken to process the next line.
            return this.fetchToken(retrieveAsString);
        }

        // Extract the first token from the array. The original code used `pop()` on a reversed array;
        // using `shift()` on a non-reversed array achieves the same "read from left to right" effect.
        const extractedToken = currentTokensArray.shift();

        // If the current line becomes empty after extracting a token, increment the line pointer
        // so that the next `fetchToken` call starts on the subsequent line.
        if (currentTokensArray.length === 0) {
            this._currentLinePtr++;
        }

        // Return the token, converting to a number if `retrieveAsString` is false.
        return retrieveAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads all tokens from the current line, then advances the line pointer to the next line.
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed tokens from the line. Returns an empty array if no more lines.
     */
    StreamParser.prototype.readLineTokens = function (returnAsStrings = false) {
        // Guard against reading beyond the available lines.
        if (this._currentLinePtr >= this._lineSegments.length) {
            console.warn("Attempted to read past the end of input lines while calling readLineTokens. Returning an empty array.");
            return [];
        }

        // Fetch the current raw line and then immediately increment the line pointer.
        const currentRawLine = this._lineSegments[this._currentLinePtr++];
        // Split the raw line into tokens, ensuring to filter out any empty strings.
        const tokens = currentRawLine.split(" ").filter(token => token.length > 0);

        // Convert tokens to numbers if `returnAsStrings` is false.
        return returnAsStrings ? tokens : tokens.map(Number);
    };

    /**
     * Reads a specified number of lines, parsing each into an array of tokens.
     * @param {number} lineCount - The number of lines to read sequentially.
     * @param {boolean} [asStringElements=false] - If true, elements within each line array are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the parsed lines.
     */
    StreamParser.prototype.getMatrixData = function (lineCount, asStringElements = false) {
        const startLineIndex = this._currentLinePtr;
        const endLineIndex = this._currentLinePtr + lineCount; // Exclusive end index.

        // Update the line pointer to reflect that these lines have been consumed.
        this._currentLinePtr = endLineIndex;

        // Slice the `_lineSegments` array to get the raw strings for the specified number of lines.
        const rawLinesToProcess = this._lineSegments.slice(startLineIndex, endLineIndex);

        // Map each raw line string to an array of parsed tokens.
        return rawLinesToProcess.map(lineStr => {
            const tokens = lineStr.split(" ").filter(token => token.length > 0);
            return asStringElements ? tokens : tokens.map(Number);
        });
    };

    /**
     * Reads a specified number of raw lines without splitting them into individual tokens.
     * @param {number} countOfLines - The number of lines to read.
     * @param {boolean} [convertToInt=false] - If true, attempts to convert each raw line to an integer;
     *                                          otherwise, returns them as strings.
     * @returns {Array<string|number>} An array of raw line strings or numbers.
     */
    StreamParser.prototype.extractRawLines = function (countOfLines, convertToInt = false) {
        const startIdx = this._currentLinePtr;
        const endIdx = this._currentLinePtr + countOfLines;

        // Advance the line pointer past the lines that are being extracted.
        this._currentLinePtr = endIdx;

        // Get a slice of the raw line segments.
        const rawLineData = this._lineSegments.slice(startIdx, endIdx);

        // Convert lines to numbers if specified, otherwise return as strings.
        return convertToInt ? rawLineData.map(Number) : rawLineData;
    };

    return createParser; // Return the factory function as the public interface.
})();

// --- Helper function for multi-dimensional array creation (rewritten from xArray) ---

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function replaces the original `xArray` which used `eval`.
 * @param {*} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - A list of numbers representing the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimensionalArray(initialValue, ...dimensions) {
    // If no dimensions are provided, return the initial value directly.
    if (dimensions.length === 0) {
        return initialValue;
    }

    /**
     * Recursive helper to build dimensions.
     * @param {number} currentDimIndex - The index of the dimension currently being built.
     * @returns {Array} A single dimension of the array, possibly containing nested arrays.
     */
    const buildDimension = (currentDimIndex) => {
        const size = dimensions[currentDimIndex];
        const currentArray = new Array(size);

        if (currentDimIndex === dimensions.length - 1) {
            // If this is the last dimension, fill it with the `initialValue`.
            currentArray.fill(initialValue);
        } else {
            // Otherwise, recursively build the next dimension and assign it to each element.
            for (let i = 0; i < size; i++) {
                currentArray[i] = buildDimension(currentDimIndex + 1);
            }
        }
        return currentArray;
    };

    // Start building from the outermost dimension (index 0).
    return buildDimension(0);
}

// --- Main program execution flow ---

// Determine the input path. This allows for easier testing by setting NODE_ENV.
const fileSystem = require("fs");
const inputFilePath = process.env.NODE_ENV === 'test' ? 'test_input.txt' : "/dev/stdin";
let rawInputData;

try {
    rawInputData = fileSystem.readFileSync(inputFilePath, "utf8");
} catch (error) {
    // Robust error handling for file reading failures.
    console.error(`Error: Failed to read input from ${inputFilePath}. Ensure the file exists and is accessible.`, error.message);
    rawInputData = ""; // Provide an empty string to prevent further program crashes.
}

// Initialize the data reader using the InputProcessor.
const dataReader = InputProcessor(rawInputData);

// Output the result of the primary algorithm to the console.
console.log(runPrimaryAlgorithm());

/**
 * Orchestrates the reading of input data and triggers the main dynamic programming algorithm.
 * This serves as the entry point for the core logic.
 * @returns {number} The final computed optimal cost, or an error indicator (-1).
 */
function runPrimaryAlgorithm() {
    // Read the problem size 'n' (renamed to problemSizeN).
    const problemSizeN = dataReader.fetchToken();

    // Read the initial array 'a' (renamed to initialValuesArray).
    const initialValuesArray = dataReader.readLineTokens();

    // Add robust validation for input parameters.
    if (problemSizeN === null || !Number.isInteger(problemSizeN) || problemSizeN <= 0) {
        console.error("Input Error: Problem size N must be a positive integer.");
        return -1; // Indicate an error.
    }
    if (initialValuesArray === null || initialValuesArray.length !== problemSizeN) {
        console.error("Input Error: The length of the initial values array does not match the specified problem size N.");
        return -1; // Indicate an error.
    }

    // Call the core algorithm to compute the solution.
    return computeOptimalSolution(problemSizeN, initialValuesArray);
}

/**
 * Implements the core dynamic programming algorithm to calculate the minimum cost.
 * This algorithm typically solves problems similar to optimal binary search trees or
 * matrix chain multiplication, where segments are combined with an associated cost.
 * @param {number} arraySize - The effective size of the array for the problem (n).
 * @param {Array<number>} inputData - The initial array of values (a).
 * @returns {number} The minimum calculated cost for combining all elements.
 */
function computeOptimalSolution(arraySize, inputData) {
    // Early exit for trivial cases to optimize performance and prevent edge-case errors.
    if (arraySize <= 0) {
        return 0; // No elements, no cost.
    }
    if (arraySize === 1) {
        return 0; // A single element requires no combination, hence no additional cost.
    }

    // Initialize a 2D array to store the sum of costs for all possible segments (sub-arrays).
    // Renamed 'cost' to 'segmentCombinationCosts' for clarity.
    const segmentCombinationCosts = createMultiDimensionalArray(0, arraySize, arraySize);

    // Populate the base costs: segments of length 1 (i.e., individual elements).
    // `segmentCombinationCosts[0][j]` stores the cost of the segment starting at `j` with length 1.
    for (let currentIdx = 0; currentIdx < arraySize; currentIdx++) {
        segmentCombinationCosts[0][currentIdx] = inputData[currentIdx];
    }

    // Calculate the sum of costs for all possible segments of increasing length.
    // `segmentCombinationCosts[segmentLengthMinusOne][segmentStartIdx]` stores the sum of values
    // for the segment starting at `segmentStartIdx` and having a length of `segmentLengthMinusOne + 1`.
    for (let segmentLengthMinusOne = 1; segmentLengthMinusOne < arraySize; segmentLengthMinusOne++) {
        for (let segmentStartIdx = 0; segmentStartIdx < arraySize - segmentLengthMinusOne; segmentStartIdx++) {
            // The sum of a segment [j, j+i] is the sum of [j, j+i-1] plus the element at [j+i].
            segmentCombinationCosts[segmentLengthMinusOne][segmentStartIdx] =
                segmentCombinationCosts[segmentLengthMinusOne - 1][segmentStartIdx] +
                segmentCombinationCosts[0][segmentLengthMinusOne + segmentStartIdx];
        }
    }

    // Initialize the Dynamic Programming table to store minimum operation costs.
    // Renamed 'dp' to 'minOperationCosts'. Using `Number.MAX_SAFE_INTEGER` for initial "infinity" value.
    const minOperationCosts = createMultiDimensionalArray(Number.MAX_SAFE_INTEGER, arraySize, arraySize);

    // Base case for DP: segments of length 1 have zero cost to combine (they are already single units).
    // `minOperationCosts[0][j]` represents the minimum cost for a segment of length 1 starting at index `j`.
    for (let j = 0; j < arraySize; j++) {
        minOperationCosts[0][j] = 0;
    }

    // Main DP loop: calculate the minimum cost for combining segments of increasing lengths.
    // `currentSegmentLength` (original `i`) ranges from 1 to `arraySize - 1`.
    // `startIndex` (original `j`) represents the starting index of the current segment.
    // `splitPosition` (original `k`) iterates through all possible points to split the current segment.
    for (let currentSegmentLength = 1; currentSegmentLength < arraySize; currentSegmentLength++) {
        for (let startIndex = 0; startIndex < arraySize - currentSegmentLength; startIndex++) {
            for (let splitPosition = 1; splitPosition <= currentSegmentLength; splitPosition++) {
                // Calculate the cost of combining two sub-segments:
                // 1. Left sub-segment: length `splitPosition`, starting at `startIndex`.
                // 2. Right sub-segment: length `currentSegmentLength - splitPosition`, starting at `startIndex + splitPosition`.
                // The cost of performing this combination itself is `segmentCombinationCosts[currentSegmentLength][startIndex]`.

                const costOfLeftSubsegment = minOperationCosts[splitPosition - 1][startIndex];
                const costOfRightSubsegment = minOperationCosts[currentSegmentLength - splitPosition][startIndex + splitPosition];
                const costOfCurrentCombination = segmentCombinationCosts[currentSegmentLength][startIndex];

                // The total cost for this particular split is the sum of costs of its sub-problems plus the combination cost.
                const totalCandidateCost = costOfLeftSubsegment + costOfRightSubsegment + costOfCurrentCombination;

                // Update the minimum cost for the current segment if this split yields a lower total cost.
                minOperationCosts[currentSegmentLength][startIndex] = Math.min(
                    minOperationCosts[currentSegmentLength][startIndex],
                    totalCandidateCost
                );
            }
        }
    }

    // The final result is the minimum cost for the entire array, which is a segment of length `arraySize - 1`
    // starting at index 0.
    return minOperationCosts[arraySize - 1][0];
}