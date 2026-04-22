"use strict"; // Enforce strict mode for cleaner and safer JavaScript code.

// Define constants for file operations to improve readability and maintainability.
const STANDARD_INPUT_PATH = "/dev/stdin";
const ENCODING_UTF8 = "utf8";

/**
 * @module InputProcessor
 * @description A comprehensive module designed to facilitate structured reading of various data types
 *              from a multi-line string input. It provides methods to parse individual values,
 *              entire lines, or blocks of lines (e.g., matrices).
 */
const InputProcessor = (function() {

    /**
     * Public factory function for the InputProcessor module.
     * This is the primary entry point for creating an input reader instance.
     * @param {string} rawInputString The complete input content, typically read from a source like a file.
     * @returns {InputSource} An initialized InputSource object ready for parsing.
     */
    function createReader(rawInputString) {
        return new InputSource(rawInputString);
    }

    /**
     * @class InputSource
     * @description Manages the internal state and provides methods for sequential parsing
     *              of lines and tokens from the provided input string.
     */
    function InputSource(rawInputString) {
        // Input validation: Ensure the raw input is a valid string.
        if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
            console.warn("InputSource Warning: Initialized with an empty or invalid string. Reading operations will yield no data.");
            this._linesData = []; // Initialize with an empty array if input is invalid.
        } else {
            // Process the raw input: trim leading/trailing whitespace and split into an array of lines.
            // This prepares the data for efficient line-by-line access.
            this._linesData = rawInputString.trim().split("\n");
        }
        // Initialize the line pointer to the beginning of the input data.
        this._currentLineIndex = 0;
        // Internal buffer to hold tokens of the current line being processed by `readNextValue`.
        // This optimizes sequential token reads from a single line.
        this._currentLineTokensBuffer = [];
    }

    /**
     * Determines if there are more lines available to be read from the input source.
     * @returns {boolean} True if the current line index is within the bounds of `_linesData`, false otherwise.
     */
    InputSource.prototype.hasMoreLines = function() {
        return this._currentLineIndex < this._linesData.length;
    };

    /**
     * Reads and returns the next individual token (word or number) from the input.
     * It intelligently manages line advancement and token buffering.
     *
     * @param {boolean} returnAsString If true, the token is returned as a string; otherwise, it's parsed as an integer.
     * @returns {string|number|null} The parsed token, or `null` if no more tokens are available in the input.
     */
    InputSource.prototype.readNextValue = function(returnAsString) {
        // If the current line's token buffer is empty, it means we need to fetch a new line.
        while (this._currentLineTokensBuffer.length === 0) {
            if (!this.hasMoreLines()) {
                // If there are no more lines, return null to indicate end of input.
                return null;
            }

            const currentRawLine = this._linesData[this._currentLineIndex];
            // Advance the line pointer immediately after retrieving the line.
            this._currentLineIndex++;

            // Handle potential empty lines or lines consisting only of whitespace.
            if (typeof currentRawLine !== 'string' || currentRawLine.trim().length === 0) {
                // If the line is empty, continue the loop to try the next line without returning.
                continue;
            }

            // Split the current line into tokens using space as a delimiter.
            // Filter out any empty strings that might result from multiple spaces.
            this._currentLineTokensBuffer = currentRawLine.split(" ").filter(token => token.length > 0);
        }

        // Retrieve and remove the first token from the buffer.
        const extractedToken = this._currentLineTokensBuffer.shift();

        // Perform type conversion based on the `returnAsString` flag.
        // Using `Number.parseInt` for explicit and robust integer parsing.
        return returnAsString ? extractedToken : Number.parseInt(extractedToken, 10);
    };

    /**
     * Reads an entire line from the input as an array of tokens.
     * The line pointer is automatically advanced after reading.
     *
     * @param {boolean} returnAsString If true, tokens are returned as strings; otherwise, they are parsed as numbers.
     * @returns {Array<string|number>|null} An array of tokens from the line, or `null` if no more lines exist.
     */
    InputSource.prototype.readLineTokens = function(returnAsString) {
        // Clear any pending tokens from `readNextValue` as this method reads a full line.
        this._currentLineTokensBuffer = [];

        if (!this.hasMoreLines()) {
            console.warn("InputSource Warning: Attempted to read line beyond the end of the input data.");
            return null; // Indicate no more lines to read.
        }

        const rawLineData = this._linesData[this._currentLineIndex++]; // Get line and advance pointer.
        // Split the line into parts, filtering out empty strings.
        const lineParts = rawLineData.split(" ").filter(part => part.length > 0);

        // Apply type conversion to all parts of the line if `returnAsString` is false.
        return returnAsString ? lineParts : lineParts.map(val => Number.parseInt(val, 10));
    };

    /**
     * Reads a specified number of consecutive lines and processes them into a 2D matrix (array of arrays).
     * Each line is split into tokens to form a row in the matrix.
     *
     * @param {number} numberOfLines The quantity of lines to read to form the matrix.
     * @param {boolean} returnAsString If true, matrix elements are strings; otherwise, they are numbers.
     * @returns {Array<Array<string|number>>|null} A 2D array representing the matrix, or `null` if input is insufficient.
     */
    InputSource.prototype.readMatrix = function(numberOfLines, returnAsString) {
        // Input validation for the number of lines to read.
        if (numberOfLines <= 0) {
            console.warn(`InputSource Warning: readMatrix called with non-positive numberOfLines (${numberOfLines}). Returning an empty matrix.`);
            return [];
        }
        if (this._currentLineIndex + numberOfLines > this._linesData.length) {
            console.error(`InputSource Error: Not enough lines remaining for matrix read. Requested ${numberOfLines}, but only ${this._linesData.length - this._currentLineIndex} available.`);
            return null; // Indicate failure due to insufficient data.
        }

        // Clear token buffer as we're reading full lines.
        this._currentLineTokensBuffer = [];

        // Extract the relevant lines using array slice.
        const matrixRawLines = this._linesData.slice(this._currentLineIndex, this._currentLineIndex + numberOfLines);
        this._currentLineIndex += numberOfLines; // Advance the line pointer by the number of lines read.

        // Process each extracted line to form the rows of the matrix.
        const parsedMatrix = matrixRawLines.map(line => {
            const rowTokens = line.split(" ").filter(token => token.length > 0);
            return returnAsString ? rowTokens : rowTokens.map(val => Number.parseInt(val, 10));
        });

        return parsedMatrix;
    };

    /**
     * Reads a specified number of raw lines from the input without tokenizing them.
     *
     * @param {number} numberOfLines The count of lines to read.
     * @param {boolean} returnAsString If true, lines are returned as strings; otherwise, attempts to parse each line as a number.
     * @returns {Array<string|number>|null} An array of raw lines, or `null` if input is insufficient.
     */
    InputSource.prototype.readRawLines = function(numberOfLines, returnAsString) {
        // Input validation for the number of lines to read.
        if (numberOfLines <= 0) {
            console.warn(`InputSource Warning: readRawLines called with non-positive numberOfLines (${numberOfLines}). Returning an empty array.`);
            return [];
        }
        if (this._currentLineIndex + numberOfLines > this._linesData.length) {
            console.error(`InputSource Error: Not enough lines remaining for raw line read. Requested ${numberOfLines}, but only ${this._linesData.length - this._currentLineIndex} available.`);
            return null; // Indicate failure due to insufficient data.
        }

        // Clear token buffer.
        this._currentLineTokensBuffer = [];

        // Extract lines and advance the pointer.
        const rawLinesSlice = this._linesData.slice(this._currentLineIndex, this._currentLineIndex + numberOfLines);
        this._currentLineIndex += numberOfLines;

        // Return lines as strings or attempt to parse them as numbers.
        return returnAsString ? rawLinesSlice : rawLinesSlice.map(val => Number.parseInt(val, 10));
    };

    return createReader; // Export the factory function as the module's public interface.
})();

// --- Program Input Initialization ---
// Initialize the global input reader for the program.
let programInputReader;
try {
    const fileSystemModule = require("fs"); // Dynamically load the 'fs' module.
    // Read the entire content of the standard input file synchronously.
    const rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, ENCODING_UTF8);
    programInputReader = InputProcessor(rawInputContent);
} catch (error) {
    // Gracefully handle file reading errors.
    console.error(`Fatal Error: Unable to read input from ${STANDARD_INPUT_PATH}. Details: ${error.message}`);
    // In a production environment, process might exit here or provide fallback.
    // For this example, we initialize with an empty string to prevent immediate crash,
    // but subsequent read operations will likely fail or return null.
    programInputReader = InputProcessor("");
}

/**
 * Helper function to create a one-dimensional array pre-filled with a specific value.
 * This function replaces the original `xArray` which was overly generic for the specific 1D use case.
 * It provides a safer and more direct way to initialize arrays.
 *
 * @param {number} arraySize The desired length of the array.
 * @param {*} initialFillValue The value to populate each element of the array with.
 * @returns {Array<*>} A newly created array of `arraySize` length, with all elements set to `initialFillValue`.
 */
function createInitializedOneDArray(arraySize, initialFillValue) {
    // Validate arraySize to ensure it's a non-negative integer.
    if (!Number.isInteger(arraySize) || arraySize < 0) {
        console.warn(`Array Initialization Warning: Invalid arraySize provided (${arraySize}). Creating an empty array.`);
        return [];
    }
    // Use `Array(size).fill(value)` for efficient and clear array initialization.
    // The `Array(size)` constructor creates a sparse array, and `fill()` populates it.
    return Array(arraySize).fill(initialFillValue);
}

/**
 * Contains the primary business logic of the program.
 * It reads input parameters, performs array manipulation, and formats the final output.
 * @returns {string|undefined} The space-separated string representation of the final array,
 *                             or `undefined` if any critical input validation fails.
 */
function executeProgramLogic() {
    // Attempt to read the three required integer parameters.
    // Each read operation includes robust validation.

    const totalElements = programInputReader.readNextValue(); // Represents 'n' in the original code.
    if (totalElements === null || !Number.isInteger(totalElements) || totalElements <= 0) {
        console.error("Logic Error: Invalid or missing value for 'totalElements' (N). Must be a positive integer.");
        return undefined;
    }

    const fillCount = programInputReader.readNextValue(); // Represents 'k' in the original code.
    if (fillCount === null || !Number.isInteger(fillCount) || fillCount < 0) {
        console.error("Logic Error: Invalid or missing value for 'fillCount' (K). Must be a non-negative integer.");
        return undefined;
    }

    const initialFillValue = programInputReader.readNextValue(); // Represents 's' in the original code.
    if (initialFillValue === null || !Number.isInteger(initialFillValue)) {
        console.error("Logic Error: Invalid or missing value for 'initialFillValue' (S). Must be an integer.");
        return undefined;
    }

    // Adjust 'fillCount' to ensure it does not exceed 'totalElements'.
    // This handles cases where K might be greater than N, ensuring array bounds are respected.
    const effectiveFillCount = Math.min(fillCount, totalElements);
    if (fillCount > totalElements) {
        console.warn(`Logic Warning: The requested fill count (K=${fillCount}) exceeds the total number of elements (N=${totalElements}). Adjusting K to N.`);
    }

    // Initialize the result array with a default value (e.g., 0) before specific fills.
    // This ensures all elements have a known starting state.
    const resultArray = createInitializedOneDArray(totalElements, 0);

    // Phase 1: Fill the initial segment of the array.
    // Use `Array.prototype.fill` for a declarative and efficient way to populate a range.
    // Fills elements from index 0 up to (but not including) `effectiveFillCount` with `initialFillValue`.
    resultArray.fill(initialFillValue, 0, effectiveFillCount);

    // Phase 2: Conditional filling for the remainder of the array.
    // This occurs only if 'initialFillValue' is less than or equal to 'totalElements'.
    if (initialFillValue <= totalElements) {
        const nextValueToFill = initialFillValue + 1;
        // Fill the remaining elements from `effectiveFillCount` up to (but not including) `totalElements`.
        // If `effectiveFillCount` is already equal to `totalElements`, this operation will correctly do nothing.
        resultArray.fill(nextValueToFill, effectiveFillCount, totalElements);
    }
    // If `initialFillValue > totalElements`, this block is skipped, and the remaining elements
    // (beyond `effectiveFillCount`) will retain their initial value (0 in this case).

    // Final validation before returning: ensure the result array is not unexpectedly empty.
    if (resultArray.length === 0 && totalElements > 0) {
        console.warn("Logic Warning: Result array is unexpectedly empty despite a positive 'totalElements'. Returning an empty string.");
        return "";
    }

    // Format the final array into a space-separated string as required.
    return resultArray.join(" ");
}

// --- Program Entry Point and Output Handling ---
let finalProgramResult;
try {
    // Execute the main program logic and capture its return value.
    finalProgramResult = executeProgramLogic();
} catch (executionError) {
    // Catch any unexpected errors during the execution of the main logic.
    console.error("Runtime Error: An unhandled exception occurred during program execution:", executionError.message);
    finalProgramResult = undefined; // Ensure no output is printed if an error occurred.
}

// Only print the result to standard output if it is explicitly defined (not undefined or null).
// This prevents printing 'undefined' or 'null' literally if an error occurred or logic dictated no output.
if (finalProgramResult !== undefined && finalProgramResult !== null) {
    console.log(finalProgramResult);
}