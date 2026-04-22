const InputReaderFactory = (function () {
    /**
     * Creates a new data reader instance configured to parse input content.
     * @param {string} rawInputString - The raw string content to be processed.
     * @returns {LineParser} An initialized parser object ready for data extraction.
     */
    function createDataReader(rawInputString) {
        return new LineParser(rawInputString);
    }

    /**
     * @class LineParser
     * @description A utility class for parsing sequential lines of input.
     * It pre-processes the entire input content into an array of token arrays.
     * @param {string} inputContent - The full string content provided for parsing.
     */
    function LineParser(inputContent) {
        // Pre-process the input: remove leading/trailing whitespace, then split into lines.
        // Each line is further split into space-separated tokens.
        // This structure allows for efficient token extraction without repeated string operations.
        this.inputSegments = inputContent.trim().split("\n").map(line => line.split(" "));
        this.segmentPointer = 0; // Tracks the current line (segment) being processed.
    }

    /**
     * Extracts and returns the next single token from the input.
     * It prioritizes tokens from the current line, advancing to the next line as needed.
     * @param {boolean} [keepRaw=false] - If true, returns the token as a string; otherwise, attempts to convert it to a number.
     * @returns {(string|number|null)} The extracted token, or null if no more input is available.
     */
    LineParser.prototype.extractNextToken = function (keepRaw = false) {
        // Loop to ensure we find a non-empty line or exhaust all input.
        while (this.segmentPointer < this.inputSegments.length && this.inputSegments[this.segmentPointer].length === 0) {
            this.segmentPointer++; // Skip empty lines
        }

        // If all lines have been processed or are empty.
        if (this.segmentPointer >= this.inputSegments.length) {
            return null; // No more input tokens.
        }

        const currentLineTokens = this.inputSegments[this.segmentPointer];
        const extractedValue = currentLineTokens.shift(); // Remove and return the first token from the current line.

        // If the current line is now empty after extracting a token, advance the pointer for the next call.
        if (currentLineTokens.length === 0) {
            this.segmentPointer++;
        }

        // Convert the extracted value to a number if 'keepRaw' is false, otherwise return as string.
        return keepRaw ? extractedValue : Number(extractedValue);
    };

    /**
     * Reads all tokens from the current line and then advances the parser to the next line.
     * @param {boolean} [keepRaw=false] - If true, returns tokens as strings; otherwise, converts them to numbers.
     * @returns {Array<(string|number)>} An array containing all tokens from the consumed line.
     */
    LineParser.prototype.fetchLineTokens = function (keepRaw = false) {
        // Handle cases where there are no more lines to read.
        if (this.segmentPointer >= this.inputSegments.length) {
            return [];
        }
        // Retrieve the current line's tokens.
        const currentLineValues = this.inputSegments[this.segmentPointer];
        this.segmentPointer++; // Immediately advance to the next line.

        // Return a copy of the tokens, converted to numbers if specified.
        return keepRaw ? [...currentLineValues] : currentLineValues.map(Number);
    };

    /**
     * Reads a specified number of consecutive lines, treating each as a row in a matrix.
     * @param {number} numRows - The number of lines (rows) to read into the matrix.
     * @param {boolean} [keepRaw=false] - If true, matrix elements are strings; otherwise, they are numbers.
     * @returns {Array<Array<(string|number)>>} A 2D array (matrix) of the parsed values.
     */
    LineParser.prototype.gatherBlockData = function (numRows, keepRaw = false) {
        const startIndex = this.segmentPointer;
        const endIndex = Math.min(startIndex + numRows, this.inputSegments.length);

        // Warn if the requested number of rows exceeds available input.
        if (endIndex - startIndex < numRows) {
            console.warn(`Warning: Requested ${numRows} rows, but only ${endIndex - startIndex} are available starting from current position.`);
        }

        // Extract the relevant block of lines.
        const blockData = this.inputSegments.slice(startIndex, endIndex);
        this.segmentPointer = endIndex; // Update the pointer to after the block.

        if (keepRaw) {
            // Return a deep copy to prevent external modification of internal state.
            return blockData.map(row => [...row]);
        } else {
            // Convert all elements in the block to numbers.
            return blockData.map(row => row.map(Number));
        }
    };

    /**
     * Reads a specified number of lines and returns their content.
     * If `keepRaw` is true, each line is returned as an array of its tokens.
     * If `keepRaw` is false, it assumes each line contains a single number and returns an array of these numbers.
     * @param {number} count - The number of lines to retrieve.
     * @param {boolean} [keepRaw=false] - If true, returns lines as arrays of strings; otherwise, returns the first token of each line as a number.
     * @returns {Array<Array<string>|number>} An array where each element corresponds to a processed line.
     */
    LineParser.prototype.retrieveLineRange = function (count, keepRaw = false) {
        const startIndex = this.segmentPointer;
        const endIndex = Math.min(startIndex + count, this.inputSegments.length);

        const linesToProcess = this.inputSegments.slice(startIndex, endIndex);
        this.segmentPointer = endIndex; // Advance the pointer.

        if (keepRaw) {
            return linesToProcess.map(lineTokens => [...lineTokens]); // Return array of arrays of strings.
        } else {
            // Assuming each of these lines is expected to contain a single numeric token.
            // If a line is empty or its first token is not a valid number, `Number()` will result in NaN.
            return linesToProcess.map(lineTokens => lineTokens.length > 0 ? Number(lineTokens[0]) : NaN);
        }
    };

    return createDataReader;
})();

// Instantiate the input processor by reading content from standard input.
// Includes error handling for file system operations to improve robustness.
let dataFetcher;
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    dataFetcher = InputReaderFactory(fileContent);
} catch (error) {
    console.error("Error: Could not read input from /dev/stdin. Please ensure the file exists and is accessible.");
    // In a production environment, more sophisticated error handling or a graceful exit might be required.
    process.exit(1); // Terminate the process if input cannot be read.
}

// The original `xArray` utility function is not utilized by the `main` logic.
// As a Type III clone, non-essential code fragments can be removed.
// Therefore, the `xArray` function has been deliberately omitted from this version.

// Execute the primary computation function and display its result to standard output.
console.log(computeSequenceOperations());

/**
 * @function computeSequenceOperations
 * @description This is the core logic function. It processes a sorted array of numbers
 * to generate a specific sequence of arithmetic operations (subtractions).
 * The algorithm involves multiple phases of calculation and array population.
 * @returns {string} A string where each line represents an operation in the sequence.
 */
function computeSequenceOperations() {
    // Read the total count of elements expected in the numeric data set.
    const arraySize = dataFetcher.extractNextToken();
    // Read the actual array of numbers from the next line of input.
    const numericDataSet = dataFetcher.fetchLineTokens();

    // Basic validation: Check if the actual number of elements matches the declared size.
    // While not strictly part of the original logic, it's a Type III addition for robustness.
    if (numericDataSet.length !== arraySize) {
        console.warn(`Input Warning: Declared array size (${arraySize}) does not match the actual number of elements read (${numericDataSet.length}). Proceeding with the declared size as the authoritative length for array operations.`);
        // For this specific problem, we'll assume `arraySize` is the correct length for subsequent logic.
        // A more robust solution might adjust `arraySize` or throw an error.
    }

    // Sort the numeric data set in ascending order. This sorting is a fundamental prerequisite for the algorithm.
    numericDataSet.sort((valA, valB) => valA - valB);

    // Initialize an array to store the string representations of the computed operations.
    const resultSequence = [];

    // --- Phase 0: Initial Calculation ---
    // The first element of the result sequence is a special calculation:
    // It's the sum of the absolute values of all elements from A[1] to A[N-1], minus A[0].
    let sumOfAbsoluteValuesFromSecondElement = 0;
    for (let idx = 1; idx < arraySize; idx++) {
        sumOfAbsoluteValuesFromSecondElement += Math.abs(numericDataSet[idx]);
    }
    resultSequence.push(sumOfAbsoluteValuesFromSecondElement - numericDataSet[0]);

    // Initialize the running total for subsequent subtraction operations with the first element A[0].
    let currentRunningTotal = numericDataSet[0];

    // --- Phase 1: Selective Subtractions from A[1] to A[N-2] ---
    // This loop processes elements from the second (index 1) up to the second-to-last (index N-2).
    // Only non-negative elements within this range are considered for subtraction in this phase.
    for (let elementPointer = 1; elementPointer < arraySize - 1; elementPointer++) {
        const currentElement = numericDataSet[elementPointer];

        // Skip negative elements according to the algorithm's specific rule for this phase.
        if (currentElement < 0) {
            continue; // Skip to the next element.
        }

        let operationDescription;
        // The format of the operation string depends on whether this is the first subtraction
        // after the initial calculation, or a subsequent one.
        if (resultSequence.length === 1) {
            // If only the initial calculated value is in `resultSequence`,
            // the operation is formatted as "A[0] currentElement".
            operationDescription = `${numericDataSet[0]} ${currentElement}`;
            currentRunningTotal = numericDataSet[0] - currentElement; // Update running total.
        } else {
            // For all subsequent subtractions in this phase, the operation is "previousTotal currentElement".
            operationDescription = `${currentRunningTotal} ${currentElement}`;
            currentRunningTotal -= currentElement; // Update running total.
        }
        resultSequence.push(operationDescription); // Add the operation string to the sequence.
    }

    // --- Phase 2: Processing the Last Element A[N-1] ---
    // This phase involves the last element of the sorted array, A[N-1].
    // This operation is always performed, regardless of the element's sign.
    const lastElement = numericDataSet[arraySize - 1];
    resultSequence.push(`${lastElement} ${currentRunningTotal}`);
    // The running total is updated based on this subtraction.
    currentRunningTotal = lastElement - currentRunningTotal;

    // --- Phase 3: Filling Remaining Slots in the Result Sequence ---
    // This loop ensures that the `resultSequence` array ultimately contains `arraySize` elements.
    // It iteratively subtracts elements from `numericDataSet` (starting from A[1]) from the
    // `currentRunningTotal` until the `resultSequence` reaches the desired length.
    // Note: Elements from `numericDataSet` can be "re-used" in this phase for subtraction,
    // particularly if they were skipped in Phase 1 (e.g., if they were negative).
    let subtractionFillIndex = 1;
    while (resultSequence.length < arraySize) {
        // Defensive check: This guard clause is a Type III addition to prevent potential
        // out-of-bounds array access if the `arraySize` is very small or if the algorithm
        // produces fewer operations than expected due to unusual input constraints.
        if (subtractionFillIndex >= arraySize) {
            console.error("Algorithm Error: Attempted to access numericDataSet beyond its bounds during the final fill phase. This indicates an unexpected input structure or logic flaw.");
            break; // Exit the loop to prevent a runtime error.
        }

        const elementToSubtract = numericDataSet[subtractionFillIndex];
        resultSequence.push(`${currentRunningTotal} ${elementToSubtract}`);
        currentRunningTotal -= elementToSubtract;
        subtractionFillIndex++; // Move to the next element in `numericDataSet` for the next potential subtraction.
    }

    // Join all the generated operation strings with newline characters to form the final output.
    return resultSequence.join("\n");
}