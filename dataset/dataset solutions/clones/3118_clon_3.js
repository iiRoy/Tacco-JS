var InputReaderFactory = (function () {
    /**
     * Creates a new input reader instance from a given string.
     * This factory function ensures that the input text is properly handled
     * before being passed to the internal InputProcessor.
     * @param {string} rawInputText - The complete input string.
     * @returns {InputProcessor} An instance of the InputProcessor.
     * @throws {Error} If the input is not a string.
     */
    function createInputReader(rawInputText) {
        if (typeof rawInputText !== 'string') {
            throw new Error("Input for InputReader must be a string.");
        }
        return new InputProcessor(rawInputText);
    }

    /**
     * Internal class responsible for parsing the input text line by line and token by token.
     * It manages the current position in the input and provides methods to extract various data types.
     */
    function InputProcessor(initialInput) {
        // Split the input into lines, handling both LF and CRLF line endings.
        // Trim removes leading/trailing whitespace including empty lines if present.
        this._sourceLines = initialInput.trim().split(/\r?\n/);
        // Initialize the current line index to the beginning of the input.
        this._currentLineIndex = 0;
        // Buffer for tokens of the current line being processed by extractNextNumericToken.
        this._currentLineTokens = [];
        // Index within _currentLineTokens, indicating the next token to be read.
        this._currentTokenIndex = 0;
    }

    /**
     * Internal helper to ensure the _currentLineTokens buffer is populated
     * with tokens from the next available line if the current buffer is exhausted.
     * @private
     * @returns {boolean} True if tokens are available (or were loaded), false if no more lines.
     * @throws {Error} If attempting to read past the end of the input stream.
     */
    InputProcessor.prototype._ensureLineTokens = function () {
        // If we've exhausted tokens on the current buffered line
        if (this._currentTokenIndex >= this._currentLineTokens.length) {
            // Check if there are more raw lines in the source input
            if (this._currentLineIndex >= this._sourceLines.length) {
                return false; // No more lines to load
            }
            // Load the next raw line and split it into tokens
            const rawLine = this._sourceLines[this._currentLineIndex];
            this._currentLineTokens = rawLine.split(" ");
            this._currentTokenIndex = 0; // Reset token index for the new line
            this._currentLineIndex++; // Advance the line index
        }
        return true; // Tokens are now available in _currentLineTokens
    };

    /**
     * Reads and returns the next token from the input stream.
     * It uses an internal buffer for line tokens.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {number|string} The next token.
     * @throws {Error} If an attempt is made to read past the end of the input.
     */
    InputProcessor.prototype.extractNextNumericToken = function (asString = false) {
        if (!this._ensureLineTokens()) {
            throw new Error("Attempted to read past end of input stream when extracting a single token.");
        }

        const nextToken = this._currentLineTokens[this._currentTokenIndex++];
        return asString ? nextToken : Number(nextToken);
    };

    /**
     * Reads an entire line from the input stream and returns its tokens.
     * This method bypasses the internal token buffer and consumes a full raw line directly.
     * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<number|string>} An array of tokens from the line.
     * @throws {Error} If an attempt is made to read past the end of the input.
     */
    InputProcessor.prototype.extractLineAsNumbers = function (asString = false) {
        if (this._currentLineIndex >= this._sourceLines.length) {
            throw new Error("Attempted to read past end of input stream when extracting a full line.");
        }

        // Read the line directly from _sourceLines at the current index, then advance.
        const rawLine = this._sourceLines[this._currentLineIndex++];
        const tokens = rawLine.split(" ");

        // Reset the internal token buffer state. This is crucial because this method
        // bypasses the buffer, so `extractNextNumericToken` should start fresh on the *next* line.
        this._currentLineTokens = [];
        this._currentTokenIndex = 0;

        return asString ? tokens : tokens.map(value => Number(value));
    };

    /**
     * Reads 'numberOfLines' lines from the input stream, treating each as a row of a matrix.
     * @param {number} numberOfLines - The number of lines to read.
     * @param {boolean} [asString=false] - If true, returns matrix elements as strings; otherwise, as numbers.
     * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
     * @throws {Error} If not enough lines are available for the requested matrix size.
     */
    InputProcessor.prototype.extractMatrixAsNumbers = function (numberOfLines, asString = false) {
        const matrixRows = [];
        const endIndex = this._currentLineIndex + numberOfLines;

        if (numberOfLines <= 0) {
            return []; // Return empty matrix for non-positive line count
        }
        if (endIndex > this._sourceLines.length) {
            throw new Error(`Not enough lines to form a matrix of ${numberOfLines} rows. Available: ${this._sourceLines.length - this._currentLineIndex}.`);
        }

        // Slice the relevant lines from the source and then map them
        const rawRows = this._sourceLines.slice(this._currentLineIndex, endIndex);
        this._currentLineIndex = endIndex; // Update the line index after consuming these lines

        // Reset the internal token buffer state after this bulk read.
        this._currentLineTokens = [];
        this._currentTokenIndex = 0;

        rawRows.forEach(rawLine => {
            const rowTokens = rawLine.split(" ");
            matrixRows.push(asString ? rowTokens : rowTokens.map(val => Number(val)));
        });

        return matrixRows;
    };

    /**
     * Reads 'numberOfLines' lines from the input stream as raw strings or converted to numbers.
     * @param {number} numberOfLines - The number of lines to read.
     * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of lines.
     * @throws {Error} If not enough lines are available for the requested count.
     */
    InputProcessor.prototype.extractRawLines = function (numberOfLines, asString = false) {
        const endIndex = this._currentLineIndex + numberOfLines;

        if (numberOfLines <= 0) {
            return []; // Return empty array for non-positive line count
        }
        if (endIndex > this._sourceLines.length) {
            throw new Error(`Not enough lines to read ${numberOfLines} raw lines. Available: ${this._sourceLines.length - this._currentLineIndex}.`);
        }

        const lines = this._sourceLines.slice(this._currentLineIndex, endIndex);
        this._currentLineIndex = endIndex; // Update the line index

        // Reset the internal token buffer state after this bulk read.
        this._currentLineTokens = [];
        this._currentTokenIndex = 0;

        return asString ? lines : lines.map(val => Number(val));
    };

    /**
     * Checks if there is more input available to be read.
     * @returns {boolean} True if there are more tokens on the current line or more lines in the source, false otherwise.
     */
    InputProcessor.prototype.hasMoreInput = function () {
        // Check if there are more tokens on the current buffered line,
        // or if there are more raw lines to load from the source.
        return (this._currentTokenIndex < this._currentLineTokens.length) ||
               (this._currentLineIndex < this._sourceLines.length);
    };

    return createInputReader;
})();

// --- Main Program Execution ---

// Define the standard input path for file system operations.
const STANDARD_INPUT_PATH = "/dev/stdin";
// Require the Node.js file system module.
const fileSystemModule = require("fs");

let inputContent;
try {
    // Read the entire content of the standard input file synchronously.
    inputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, "utf8");
} catch (error) {
    // Log an error if file reading fails (e.g., file not found, permission issues).
    console.error(`Error reading input from ${STANDARD_INPUT_PATH}:`, error.message);
    // In a competitive programming context, this often means the input is missing
    // or malformed. Returning "No" or throwing an error is a common fallback.
    inputContent = ""; // Provide empty string to prevent further errors if execution continues.
}

// Create an instance of our input reader using the factory.
const dataStreamReader = InputReaderFactory(inputContent);

/**
 * Helper function to determine if a given number is even.
 * Uses a bitwise AND operator for a potentially optimized parity check.
 * @param {number} value - The integer to check for evenness.
 * @returns {boolean} True if the value is even, false otherwise.
 */
function isEven(value) {
    return (value & 1) === 0;
}

/**
 * Main function to solve the graph connectivity problem.
 * This function determines if a given graph (represented by nodes and edges)
 * satisfies specific conditions related to Eulerian paths/circuits and graph structure.
 * @returns {string} "Yes" if the conditions are met, "No" otherwise.
 */
function analyzeGraphConnectivity() {
    // Validate and read the number of nodes (N) and edges (M) from the input.
    if (!dataStreamReader.hasMoreInput()) {
        console.error("Input Error: Not enough data to read node count.");
        return "No";
    }
    const nodeCount = dataStreamReader.extractNextNumericToken();

    if (!dataStreamReader.hasMoreInput()) {
        console.error("Input Error: Not enough data to read edge count.");
        return "No";
    }
    const edgeCount = dataStreamReader.extractNextNumericToken();

    // Perform basic input constraints validation for N and M.
    // Node count must be at least 1, edge count can be 0.
    if (nodeCount < 1 || edgeCount < 0) {
        console.error(`Validation Error: Invalid graph dimensions. Node count: ${nodeCount}, Edge count: ${edgeCount}.`);
        return "No";
    }

    // Define an arbitrary upper limit for node count for robustness.
    // This can prevent excessive memory allocation or performance issues with very large inputs.
    const MAX_SUPPORTED_NODES = 200000; // Increased limit slightly from thought process
    if (nodeCount > MAX_SUPPORTED_NODES) {
        console.warn(`Performance Warning: Node count (${nodeCount}) exceeds recommended maximum (${MAX_SUPPORTED_NODES}).`);
        // Depending on problem constraints, this could be a hard "No".
        // For this problem, we proceed but log a warning.
    }

    // Initialize an array to store the degree of each node.
    // The array is 1-indexed to match common graph problem conventions (nodes 1 to N).
    // All degrees are initialized to 0.
    const nodeDegrees = new Array(nodeCount + 1).fill(0);

    // Process each edge to populate the degree array.
    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        if (!dataStreamReader.hasMoreInput()) {
            console.error(`Input Error: Not enough data to read edge number ${edgeIndex + 1}.`);
            return "No";
        }
        // Read the two endpoints (u, v) of the current edge from a line.
        const [u, v] = dataStreamReader.extractLineAsNumbers();

        // Validate that the node indices for the current edge are within the valid range [1, nodeCount].
        if (u < 1 || u > nodeCount || v < 1 || v > nodeCount) {
            console.error(`Validation Error: Invalid node index for edge ${edgeIndex + 1} (${u}-${v}). Node indices must be between 1 and ${nodeCount}.`);
            return "No";
        }
        // Increment the degree counter for both connected nodes.
        nodeDegrees[u]++;
        nodeDegrees[v]++;
    }

    let totalDegreeContribution = 0; // This variable accumulates (degree - 2) for each node.

    // Iterate through all nodes (from 1 to N) to check their degree properties.
    for (let nodeIndex = 1; nodeIndex <= nodeCount; nodeIndex++) {
        const currentDegree = nodeDegrees[nodeIndex];

        // For a graph to have an Eulerian path or circuit, all node degrees must be even.
        // If any node has an odd degree, it's an immediate "No".
        if (!isEven(currentDegree)) {
            return "No"; // Early exit condition if an odd degree is found.
        }

        // Accumulate (currentDegree - 2) for each node.
        // This sum is a characteristic property in certain graph theory problems.
        totalDegreeContribution += (currentDegree - 2);
    }

    // The final condition checks if the accumulated totalDegreeContribution is at least 4.
    // This often relates to the graph's structure, connectivity, or number of cycles.
    const finalConditionMet = totalDegreeContribution >= 4;

    // Return "Yes" or "No" based on whether all checks passed and the final condition is met.
    return finalConditionMet ? "Yes" : "No";
}

// Execute the main graph analysis function and print its determined result to the console.
console.log(analyzeGraphConnectivity());