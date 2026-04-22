/**
 * This module provides utilities for parsing input data from a stream,
 * primarily designed for competitive programming contexts where input
 * is line-based and often consists of numbers.
 */
const InputUtilities = (function() {
    /**
     * Creates and returns a new parser instance for processing input.
     * @param {string} sourceString The raw input data as a single string.
     * @returns {LineStreamParser} An initialized input parser object.
     */
    function instantiateStreamParser(sourceString) {
        return new LineStreamParser(sourceString);
    }

    /**
     * Represents a parser that reads input data line by line and token by token.
     * It manages an internal buffer of lines and a pointer to the current line.
     */
    class LineStreamParser {
        /**
         * Internal buffer storing raw lines as strings.
         * Some lines might be transformed into string arrays (reversed) if `extractNextToken` is used.
         * @type {Array<string|string[]>}
         */
        #bufferedLines;

        /**
         * The current zero-based index of the line being processed.
         * @type {number}
         */
        #currentLinePosition;

        /**
         * Constructs a LineStreamParser.
         * @param {string} rawInput The full string content from the input source.
         */
        constructor(rawInput) {
            // Trim leading/trailing whitespace from the entire input and split into individual lines.
            this.#bufferedLines = rawInput.trim().split("\n");
            this.#currentLinePosition = 0;
        }

        /**
         * Extracts the next single token (word) from the current input line.
         * If the current line is exhausted, it automatically advances to the next line.
         * This method modifies the internal representation of a line from string to string[] (reversed)
         * upon its first token extraction, for efficient `pop()` operations.
         * @param {boolean} [retrieveAsString=false] If true, returns the token as a string; otherwise, attempts to parse it as a number.
         * @returns {string|number} The extracted token. Returns NaN or empty string if no more tokens/lines.
         */
        extractNextToken(retrieveAsString = false) {
            const currentLineIndex = this.#currentLinePosition;
            const lines = this.#bufferedLines;

            if (currentLineIndex >= lines.length) {
                console.warn("Input stream exhausted. Attempted to read past end of input.");
                return retrieveAsString ? "" : NaN;
            }

            let lineContent = lines[currentLineIndex];

            // If the current line is still a raw string, split it into tokens and reverse the array.
            // Reversing allows efficient `pop()` to read tokens from the logical start of the line.
            if (typeof lineContent === "string") {
                lineContent = lineContent.split(" ");
                this.#bufferedLines[currentLineIndex] = lineContent.reverse(); // Modify in-place.
            }

            const nextAvailableToken = lineContent.pop();

            // If the current line's token array is now empty, advance to the next line.
            if (lineContent.length === 0) {
                this.#currentLinePosition++;
            }

            // Return the token, either as a string or a parsed number.
            return retrieveAsString ? nextAvailableToken : Number(nextAvailableToken);
        }

        /**
         * Reads the entire current line as an array of tokens.
         * This method advances the line pointer after reading.
         * It assumes the line has not been partially consumed by `extractNextToken`.
         * @param {boolean} [retrieveAsStringArray=false] If true, returns tokens as strings; otherwise, attempts to parse as numbers.
         * @returns {string[]|number[]} An array of tokens from the line. Returns an empty array if the line is invalid.
         */
        fetchLineAsArray(retrieveAsStringArray = false) {
            const currentLineContent = this.#bufferedLines[this.#currentLinePosition++];

            if (typeof currentLineContent !== 'string') {
                console.error(`Attempted to read line ${this.#currentLinePosition - 1} as an array, but it was already processed or is not a string.`);
                return []; // Return empty array or throw error
            }

            const tokens = currentLineContent.split(" ");
            return retrieveAsStringArray ? tokens : tokens.map(Number);
        }

        /**
         * Reads a block of `lineCount` lines, parsing each into an array of tokens,
         * effectively creating a 2D array (matrix). Advances the line pointer by `lineCount`.
         * @param {number} lineCount The number of lines to read for the matrix.
         * @param {boolean} [retrieveAsStringMatrix=false] If true, returns a matrix of strings; otherwise, numbers.
         * @returns {string[][]|number[][]} A 2D array (matrix) of tokens.
         */
        grabMultiLineMatrix(lineCount, retrieveAsStringMatrix = false) {
            const startingLineIndex = this.#currentLinePosition;
            let actualLineCount = Math.min(lineCount, this.#bufferedLines.length - startingLineIndex);

            if (actualLineCount < lineCount) {
                console.warn(`Requested ${lineCount} lines for matrix, but only ${actualLineCount} available.`);
            }

            const matrixBlock = this.#bufferedLines.slice(startingLineIndex, startingLineIndex + actualLineCount);
            this.#currentLinePosition += actualLineCount; // Advance line pointer.

            if (retrieveAsStringMatrix) {
                return matrixBlock.map(line => (typeof line === 'string' ? line : "").split(" "));
            } else {
                return matrixBlock.map(line => (typeof line === 'string' ? line : "").split(" ").map(Number));
            }
        }

        /**
         * Reads a block of `lineCount` lines either as raw strings or as single parsed numbers per line.
         * Advances the line pointer by `lineCount`.
         * @param {number} lineCount The number of lines to read.
         * @param {boolean} [retrieveAsRawStrings=false] If true, returns lines as raw strings; otherwise, parses each line as a single number.
         * @returns {string[]|number[]} An array of lines.
         */
        fetchRawLinesBlock(lineCount, retrieveAsRawStrings = false) {
            const startingLineIndex = this.#currentLinePosition;
            let actualLineCount = Math.min(lineCount, this.#bufferedLines.length - startingLineIndex);

            if (actualLineCount < lineCount) {
                console.warn(`Requested ${lineCount} raw lines, but only ${actualLineCount} available.`);
            }

            const rawLines = this.#bufferedLines.slice(startingLineIndex, startingLineIndex + actualLineCount);
            this.#currentLinePosition += actualLineCount; // Advance line pointer.

            return retrieveAsRawStrings ? rawLines : rawLines.map(Number);
        }
    }

    return instantiateStreamParser;
})();

/**
 * Utility function to safely read file content synchronously.
 * @param {string} filePath The path to the file.
 * @returns {string} The content of the file, or an empty string on error.
 */
const getFileContent = (filePath) => {
    try {
        const fileSystem = require("fs"); // Using Node.js 'fs' module.
        return fileSystem.readFileSync(filePath, "utf8");
    } catch (error) {
        console.error(`Error encountered while reading file from ${filePath}:`, error.message);
        return ""; // Return an empty string to prevent downstream errors.
    }
};

// Instantiate the input parser using content from standard input.
const dataStream = InputUtilities(getFileContent("/dev/stdin"));

/**
 * Dynamically creates an N-dimensional array with specified dimensions and an initial fill value.
 * This function uses `eval` for dynamic array creation, which is generally discouraged due to security risks
 * and performance implications in production environments. It's often seen in competitive programming contexts.
 * @param {*} initialFillValue The value to fill the innermost array elements with.
 * @param {...number} dimensions A variable number of arguments representing the sizes of each dimension (e.g., dim1, dim2, dim3).
 * @returns {Array} The newly created N-dimensional array, or an empty array if dimensions are invalid.
 */
function createNDimensionalArray(initialFillValue, ...dimensions) {
    if (!dimensions || dimensions.length === 0) {
        console.warn("No dimensions specified for N-dimensional array. Returning a single-element array.");
        return [initialFillValue];
    }
    // Validate that all dimensions are positive integers.
    if (dimensions.some(dim => !Number.isInteger(dim) || dim <= 0)) {
        console.error("Invalid dimensions provided. All dimensions must be positive integers.");
        return [];
    }

    let currentDimensionIndex = dimensions.length;
    // Build the array construction string from the innermost dimension outwards.
    // The innermost array is filled with `initialFillValue`.
    let constructionCommand = `Array(${dimensions[--currentDimensionIndex]}).fill(initialFillValue)`;

    // For outer dimensions, create arrays and map over them to create nested structures.
    while (currentDimensionIndex > 0) {
        // `fill(null)` is used as a placeholder to create iterable slots for the `map` function.
        constructionCommand = `Array(${dimensions[--currentDimensionIndex]}).fill(null).map(() => ${constructionCommand})`;
    }

    // Execute the dynamically constructed string using `eval`.
    try {
        return eval(constructionCommand);
    } catch (evaluationError) {
        console.error("Failed to create N-dimensional array using eval:", evaluationError);
        return [];
    }
}

/**
 * Swaps the positions of two elements within an array.
 * @param {Array} arr The array in which to perform the swap.
 * @param {number} index1 The index of the first element.
 * @param {number} index2 The index of the second element.
 */
const swapElements = (arr, index1, index2) => {
    if (index1 === index2) return; // No-op if indices are identical.
    [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
};

/**
 * Finds the K-th smallest element in an array using the Quickselect algorithm
 * (a variant of Hoare's partition scheme). The input array is modified in place,
 * becoming partially sorted such that the K-th element is in its correct sorted position.
 * @param {number[]} collection The array of numbers to search within.
 * @param {number} targetK The 1-based index (e.g., 1 for the smallest, `collection.length` for the largest).
 * @returns {number} The K-th smallest element, or NaN if input is invalid.
 */
function findKthElement(collection, targetK) {
    const dataSize = collection.length;

    // Robust input validation.
    if (!Array.isArray(collection) || dataSize === 0) {
        console.error("Input array for findKthElement is invalid or empty.");
        return NaN;
    }
    if (targetK < 1 || targetK > dataSize) {
        console.error(`Target K (${targetK}) is out of bounds for array of size ${dataSize}.`);
        return NaN;
    }

    // Convert 1-based `targetK` to a 0-based `targetIndex` for array access.
    const targetIndex = targetK - 1;
    let currentLeftBoundary = 0;
    let currentRightBoundary = dataSize - 1;

    // Main Quickselect loop, continues until the target element is found.
    while (currentLeftBoundary < currentRightBoundary) {
        // Choose a pivot element: using the middle element of the current sub-array.
        const pivotSelectionIndex = Math.floor((currentLeftBoundary + currentRightBoundary) / 2);
        const pivotValue = collection[pivotSelectionIndex];

        // Move the chosen pivot to the rightmost position of the current sub-array.
        // This is a common strategy in Hoare's partition for easier management.
        swapElements(collection, pivotSelectionIndex, currentRightBoundary);

        // Initialize scan pointers for partitioning.
        let leftScanPointer = currentLeftBoundary - 1;
        let rightScanPointer = currentRightBoundary; // `rightScanPointer` starts at `currentRightBoundary` (pivot's location).

        // Partitioning loop: elements smaller than pivot move to the left, larger to the right.
        while (true) {
            // Increment `leftScanPointer` until an element >= `pivotValue` is found.
            do { leftScanPointer++; } while (leftScanPointer < currentRightBoundary && collection[leftScanPointer] < pivotValue);

            // Decrement `rightScanPointer` until an element <= `pivotValue` is found.
            do { rightScanPointer--; } while (rightScanPointer >= currentLeftBoundary && collection[rightScanPointer] > pivotValue);

            // If pointers have crossed or met, partitioning for this pivot is complete.
            if (leftScanPointer >= rightScanPointer) {
                break;
            }
            // Otherwise, swap elements that are on the wrong side of the partition.
            swapElements(collection, leftScanPointer, rightScanPointer);
        }

        // After partitioning, place the pivot (which was at `currentRightBoundary`)
        // into its final sorted position, which is now at `leftScanPointer`.
        swapElements(collection, leftScanPointer, currentRightBoundary);

        // Now, `leftScanPointer` holds the final sorted position of the pivot.
        // Adjust the search range for the next iteration.
        if (leftScanPointer < targetIndex) {
            currentLeftBoundary = leftScanPointer + 1; // The K-th element is in the right sub-array.
        } else if (targetIndex < leftScanPointer) {
            currentRightBoundary = leftScanPointer - 1; // The K-th element is in the left sub-array.
        } else {
            // The pivot is exactly at `targetIndex`, so we have found the K-th element.
            return collection[targetIndex];
        }
    }
    // If the loop terminates (meaning `currentLeftBoundary >= currentRightBoundary`),
    // the sub-array has been reduced to a single element, which must be the target.
    return collection[targetIndex];
}

/**
 * Extracts the `numElements` largest elements from an array.
 * It leverages `findKthElement` (Quickselect) to efficiently partition the array
 * and then slices the relevant portion. The input array is modified in place.
 * @param {number[]} sourceArray The array from which to extract elements.
 * @param {number} numElements The count of largest elements to retrieve.
 * @returns {number[]} A new array containing the `numElements` largest elements.
 */
function getLargestKElements(sourceArray, numElements) {
    const arraySize = sourceArray.length;

    // Handle edge cases and invalid inputs gracefully.
    if (!Array.isArray(sourceArray) || arraySize === 0 || numElements <= 0) {
        return [];
    }
    if (numElements >= arraySize) {
        // If requesting all or more elements than available, return a shallow copy.
        // The original `solve` would effectively return the whole array in this case.
        return [...sourceArray];
    }

    // To find the `numElements` largest elements, we need to find the
    // `(arraySize - numElements + 1)`-th smallest element.
    // For example, if we want the 3 largest from 10 elements, we need the (10-3+1) = 8th smallest.
    const kthSmallestRank = arraySize - numElements + 1;

    // `findKthElement` partitions `sourceArray` such that the element at `kthSmallestRank - 1`
    // (0-indexed) is the K-th smallest, and all elements to its right are larger.
    findKthElement(sourceArray, kthSmallestRank);

    // Slice the array from the K-th smallest element's position to the end.
    // This portion contains the `numElements` largest values.
    return sourceArray.slice(arraySize - numElements);
}

/**
 * Main function to orchestrate data processing and calculation.
 * It reads dimensions and arrays, computes intermediate sums, and
 * ultimately finds the K largest sums of elements combined from three arrays.
 * The logic incorporates optimizations to only keep track of the top K elements
 * at each stage to reduce memory and computation.
 * @returns {string} A newline-separated string of the K largest combined sums.
 */
function processDataAndCalculate() {
    // Read initial configuration parameters from the input stream.
    const dimensionX = dataStream.extractNextToken();
    const dimensionY = dataStream.extractNextToken();
    const dimensionZ = dataStream.extractNextToken();
    const targetCountK = dataStream.extractNextToken(); // The desired number of largest sums.

    // Early exit for invalid `targetCountK`.
    if (targetCountK <= 0) {
        console.warn("Target count K must be a positive integer. Returning an empty result.");
        return "";
    }

    // Read the three input arrays and sort them in descending order.
    // This pre-sorting is crucial for the subsequent greedy approach to find largest sums.
    const firstArray = dataStream.fetchLineAsArray().sort((a, b) => b - a);
    const secondArray = dataStream.fetchLineAsArray().sort((a, b) => b - a);
    const thirdArray = dataStream.fetchLineAsArray().sort((a, b) => b - a);

    // Array to store sums of elements from `firstArray` and `secondArray`.
    let intermediateSumsAB = [];

    // Optimize loop bounds: only iterate up to `targetCountK` elements from each array,
    // as we only care about the largest `targetCountK` overall sums.
    const loopLimitX = Math.min(dimensionX, targetCountK);
    const loopLimitY = Math.min(dimensionY, targetCountK);

    // Generate all possible sums of pairs from `firstArray` and `secondArray`.
    for (let i = 0; i < loopLimitX; i++) {
        for (let j = 0; j < loopLimitY; j++) {
            intermediateSumsAB.push(firstArray[i] + secondArray[j]);
        }
    }

    // If `intermediateSumsAB` contains more than `targetCountK` elements,
    // trim it down to only the `targetCountK` largest sums using Quickselect.
    if (intermediateSumsAB.length > targetCountK) {
        intermediateSumsAB = getLargestKElements(intermediateSumsAB, targetCountK);
    }

    // Re-sort `intermediateSumsAB` in descending order. This is necessary because
    // `getLargestKElements` only partitions, it doesn't fully sort the extracted elements.
    // The next loop relies on these sums being sorted for its greedy approach.
    intermediateSumsAB.sort((a, b) => b - a);

    // Final array to store combined sums from `intermediateSumsAB` and `thirdArray`.
    let finalCombinedSums = [];

    // Optimize loop bounds for `thirdArray` and `intermediateSumsAB`.
    const loopLimitZ = Math.min(dimensionZ, targetCountK);
    const loopLimitIntermediate = Math.min(intermediateSumsAB.length, targetCountK);

    // Generate combined sums. The inner loop limit dynamically adjusts
    // to ensure we don't generate too many sums if `finalCombinedSums` is already large enough.
    for (let i = 0; i < loopLimitZ; i++) {
        // `currentInnerLoopMax` ensures we only add `targetCountK` total elements to `finalCombinedSums`.
        const currentInnerLoopMax = Math.min(loopLimitIntermediate, targetCountK - finalCombinedSums.length);

        if (currentInnerLoopMax <= 0) {
            break; // No more sums needed or possible.
        }

        for (let j = 0; j < currentInnerLoopMax; j++) {
            finalCombinedSums.push(thirdArray[i] + intermediateSumsAB[j]);
        }
    }

    // If `finalCombinedSums` has more than `targetCountK` elements,
    // reduce it to only the `targetCountK` largest.
    if (finalCombinedSums.length > targetCountK) {
        finalCombinedSums = getLargestKElements(finalCombinedSums, targetCountK);
    }

    // Sort the final results in descending order and format as a newline-separated string.
    return finalCombinedSums.sort((a, b) => b - a).join("\n");
}

// Execute the main processing logic and print the resulting string to standard output.
console.info(processDataAndCalculate());