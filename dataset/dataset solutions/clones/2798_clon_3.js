const InputProcessorFactory = (function () {
    // This inner function serves as the public factory method for creating DataParser instances.
    function createProcessor(rawInputText) {
        // Perform basic input validation to ensure the raw data is a string.
        if (typeof rawInputText !== 'string' || rawInputText.length === 0) {
            console.error("Input data must be a non-empty string. Initializing parser with empty content.");
            return new DataParser(""); // Return a parser for an empty string to prevent errors.
        }
        return new DataParser(rawInputText);
    }

    // The DataParser class manages the input lines and provides methods to extract data.
    function DataParser(initialInputString) {
        // Normalize line endings (handles both Unix `\n` and Windows `\r\n`)
        // and split the input into an array of individual lines.
        this.processedLines = initialInputString.trim().split(/\r?\n/);
        // Initialize an internal pointer to track the current line being processed.
        this.currentLineIndex = 0;
        // Store the total number of lines for boundary checks.
        this.totalLinesAvailable = this.processedLines.length;
    }

    // --- Prototype methods for DataParser instances ---

    /**
     * Checks if there are more lines remaining to be read from the input.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    DataParser.prototype.hasNextLine = function () {
        return this.currentLineIndex < this.totalLinesAvailable;
    };

    /**
     * Extracts a single token (space-separated item) from the current input line.
     * Tokens are processed from right-to-left on a line (due to internal `.reverse()` operation).
     * The line index is advanced if the current line becomes empty after token extraction.
     * @param {boolean} [returnAsString=false] If true, the token is returned as a string. Otherwise, it's converted to a number.
     * @returns {string|number|null} The extracted token, or null if no more input is available.
     */
    DataParser.prototype.extractToken = function (returnAsString = false) {
        // Guard clause: check if we've consumed all input lines.
        if (!this.hasNextLine()) {
            console.warn("Attempted to extract token beyond available input. Returning null.");
            return null;
        }

        let lineBuffer = this.processedLines[this.currentLineIndex];

        // If the current line hasn't been split into tokens yet, do it now.
        // The `.reverse()` call is a unique characteristic of the original code's parsing logic.
        if (typeof lineBuffer === 'string') {
            this.processedLines[this.currentLineIndex] = lineBuffer.split(' ').reverse();
            lineBuffer = this.processedLines[this.currentLineIndex];
        }

        // Pop the last token from the reversed array.
        let obtainedValue = lineBuffer.pop();

        // If the current line's token buffer is now empty, advance to the next line.
        if (lineBuffer.length === 0) {
            this.currentLineIndex++;
        }

        // Return the value either as a string or as a floating-point number.
        return returnAsString ? obtainedValue : parseFloat(obtainedValue);
    };

    /**
     * Reads an entire line, splits it by spaces, and processes its tokens.
     * The line index is always advanced after this operation.
     * @param {boolean} [keepAsStrings=false] If true, tokens are kept as strings. Otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array containing the tokens from the read line. Returns an empty array if no line is available.
     */
    DataParser.prototype.readRowTokens = function (keepAsStrings = false) {
        // Guard clause: check for available lines.
        if (!this.hasNextLine()) {
            console.warn("Attempted to read row beyond available input. Returning an empty array.");
            return [];
        }

        // Fetch the current line and immediately increment the line pointer.
        const currentLineContent = this.processedLines[this.currentLineIndex++];
        const splitTokens = currentLineContent.split(' ');

        // Map tokens to numbers if `keepAsStrings` is false, otherwise return as-is.
        return keepAsStrings ? splitTokens : splitTokens.map(token => parseFloat(token));
    };

    /**
     * Parses a block of 'N' lines as a matrix (an array of arrays of tokens).
     * The line index is advanced by 'N' lines.
     * @param {number} numberOfLinesToRead The count of lines to include in the matrix.
     * @param {boolean} [stringsOnly=false] If true, matrix elements remain strings. Otherwise, they are converted to numbers.
     * @returns {Array<Array<string|number>>} The resulting matrix. Returns an empty array if `numberOfLinesToRead` is invalid.
     */
    DataParser.prototype.parseInputMatrix = function (numberOfLinesToRead, stringsOnly = false) {
        // Input validation for the number of lines.
        if (numberOfLinesToRead <= 0) {
            return [];
        }

        const startIndex = this.currentLineIndex;
        // Calculate the actual number of lines we can read without exceeding input boundaries.
        const effectiveLines = Math.min(numberOfLinesToRead, this.totalLinesAvailable - startIndex);

        // Extract the relevant lines, split each into tokens, and update the line index.
        const rawMatrixLines = this.processedLines
            .slice(startIndex, startIndex + effectiveLines)
            .map(line => line.split(' '));

        this.currentLineIndex += effectiveLines; // Advance the pointer.

        // Convert all elements to numbers if `stringsOnly` is false.
        return stringsOnly
            ? rawMatrixLines
            : rawMatrixLines.map(row => row.map(cell => parseFloat(cell)));
    };

    /**
     * Fetches 'N' lines directly without splitting them into tokens.
     * Advances the line index by 'N'.
     * @param {number} linesCount The number of raw lines to retrieve.
     * @param {boolean} [asStrings=false] If true, lines are returned as strings. Otherwise, each line is converted to a number.
     * @returns {Array<string|number>} An array of the fetched lines. Returns an empty array if `linesCount` is invalid.
     */
    DataParser.prototype.fetchRawLines = function (linesCount, asStrings = false) {
        // Input validation for the line count.
        if (linesCount <= 0) {
            return [];
        }

        const startIndex = this.currentLineIndex;
        const endIndex = startIndex + linesCount;

        // Slice the array to get the specified number of lines.
        const fetchedLines = this.processedLines.slice(startIndex, endIndex);
        this.currentLineIndex = endIndex; // Update the line pointer.

        // Convert lines to numbers if `asStrings` is false.
        return asStrings ? fetchedLines : fetchedLines.map(line => parseFloat(line));
    };

    return createProcessor; // Expose the factory function.
})();

/**
 * Creates a multi-dimensional array initialized with a specified filler value.
 * This function provides a safe, recursive alternative to the original `eval`-based approach,
 * ensuring that each nested array is a distinct instance.
 * @param {*} initialFillerValue The value to fill the innermost elements of the array.
 * @param {...number} dimensions A list of integers representing the size of each dimension.
 * @returns {Array|*} The created multi-dimensional array, or the filler value if no dimensions are provided. Returns null if dimensions are invalid.
 */
function buildMultiDimensionalArray(initialFillerValue, ...dimensions) {
    // Validate that all provided dimensions are non-negative integers.
    const areDimensionsValid = dimensions.every(d => Number.isInteger(d) && d >= 0);
    if (!areDimensionsValid) {
        console.error("Invalid dimension(s) provided. All dimensions must be non-negative integers.");
        return null;
    }

    // Inner recursive function to build each layer of the multi-dimensional array.
    const createArrayLayer = (currentDimensionIndex) => {
        // Base case: If we've iterated through all dimensions, return the filler value.
        if (currentDimensionIndex === dimensions.length) {
            return initialFillerValue;
        }

        const sizeOfCurrentDimension = dimensions[currentDimensionIndex];
        const resultLayer = Array(sizeOfCurrentDimension);

        // Recursively fill the current layer by calling `createArrayLayer` for the next dimension.
        for (let i = 0; i < sizeOfCurrentDimension; i++) {
            resultLayer[i] = createArrayLayer(currentDimensionIndex + 1);
        }
        return resultLayer;
    };

    // Start the recursive array construction from the outermost dimension (index 0).
    return createArrayLayer(0);
}

// --- Main application execution block ---

// Determine the input source. Priority is given to a file path provided as a command-line argument.
let inputFilePath = "/dev/stdin"; // Default to standard input.
const cliArguments = process.argv;
if (cliArguments.length > 2 && typeof cliArguments[2] === 'string') {
    // If a second argument is provided, attempt to use it as the input file path.
    inputFilePath = cliArguments[2];
}

// Read the raw input data from the determined source.
let rawInputContent;
try {
    const fileSystemModule = require("fs");
    rawInputContent = fileSystemModule.readFileSync(inputFilePath, "utf8");
} catch (readingError) {
    console.error(`Error: Could not read input from '${inputFilePath}'. Details:`, readingError.message);
    rawInputContent = ""; // Fallback to an empty string to prevent further errors.
    process.exit(1); // Terminate the process if input cannot be read.
}

// Instantiate the input parser with the raw data.
const dataReader = InputProcessorFactory(rawInputContent);

/**
 * The core logic function that solves the problem.
 * It reads a specific input pattern and performs a check.
 * @returns {string} "Bad" if the condition is met, "Good" otherwise.
 */
function executeSolution() {
    // Read the first token from the input. The original code implies this is a 4-digit string.
    const fourDigitInputString = dataReader.extractToken(true); // 'true' ensures it's returned as a string.

    // Robust input validation: Ensure the input is a string of exactly 4 characters.
    if (typeof fourDigitInputString !== 'string' || fourDigitInputString.length !== 4) {
        console.error("Application Error: Expected a 4-character numeric string input. Received:", fourDigitInputString);
        return "Error: Invalid Input Format"; // Provide a more descriptive error message.
    }

    // Convert the 4-character string into an array of numbers for precise numeric comparison.
    // This is a Type III modification for clarity and robustness over direct character comparison.
    const numericDigitsArray = Array.from(fourDigitInputString).map(char => parseInt(char, 10));

    let foundAdjacentDuplicate = false;
    // Iterate through the array to check if any two consecutive digits are identical.
    // This loop replaces the original's explicit chained OR conditions.
    for (let i = 0; i < numericDigitsArray.length - 1; i++) {
        // Compare the current digit with the next one.
        if (numericDigitsArray[i] === numericDigitsArray[i + 1]) {
            foundAdjacentDuplicate = true;
            break; // An adjacent duplicate is found, no need to check further.
        }
    }

    // Return "Bad" if any adjacent digits matched, otherwise return "Good".
    return foundAdjacentDuplicate ? "Bad" : "Good";
}

// Execute the main solution function and print its result to the console.
// A final guard clause ensures that `executeSolution` is a valid function before calling it.
if (typeof executeSolution === 'function') {
    console.log(executeSolution());
} else {
    console.error("Fatal Error: The primary solution function 'executeSolution' is not defined or is not callable.");
    process.exit(1); // Exit with an error code.
}