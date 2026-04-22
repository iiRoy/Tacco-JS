var INPUT_PROCESSOR = (function () {
    // Helper utility function to safely convert an array of string values to numbers.
    // This function can be reused across different parsing methods.
    function convertToNumbers(inputArray) {
        if (!Array.isArray(inputArray)) {
            // If the input is not an array, return it as is or handle error.
            // For this context, assuming valid array input for mapping.
            return inputArray;
        }
        return inputArray.map(value => Number(value));
    }

    // The main class/constructor for handling line-based input streams.
    // It processes the raw content into an array of lines and maintains a pointer
    // to the current line being read.
    function StreamHandler(rawContent) {
        // Validate input: ensure it's a non-empty string.
        // This is an added guard clause for robustness (Type III change).
        if (typeof rawContent !== 'string' || rawContent.trim().length === 0) {
            this._sourceLines = [];
            this._linePointer = 0;
            return;
        }
        this._sourceLines = rawContent.trim().split("\n");
        this._linePointer = 0; // Initializes the current line index to the start.
    }

    // Method to extract a single token (word/number) from the current line.
    // It processes the line by splitting it into tokens and popping from the end,
    // then advances to the next line if the current one is exhausted.
    StreamHandler.prototype.extractNextToken = function (returnAsRawString) {
        var currentLineData = this._sourceLines[this._linePointer];

        // If the current line hasn't been split into tokens yet, do so and reverse it
        // for efficient popping from the end. This is a Type II reformatting.
        if (typeof currentLineData === "string") {
            this._sourceLines[this._linePointer] = currentLineData.split(" ").reverse();
        }

        var extractedToken = this._sourceLines[this._linePointer].pop();

        // If no more tokens are left on the current line, move to the next line.
        if (this._sourceLines[this._linePointer].length === 0) {
            this._linePointer++;
        }

        // Return the token either as its raw string value or as a number.
        return returnAsRawString ? extractedToken : Number(extractedToken);
    };

    // Method to read an entire line and return its tokens.
    // It advances the line pointer after reading.
    StreamHandler.prototype.retrieveLineTokens = function (outputAsStrings) {
        // Guard clause: check if the line pointer is within bounds (Type III change).
        if (this._linePointer >= this._sourceLines.length) {
            return outputAsStrings ? [] : []; // Return empty array if no more lines.
        }

        var lineContent = this._sourceLines[this._linePointer++];
        var tokens = lineContent.split(" ");
        return outputAsStrings ? tokens : convertToNumbers(tokens);
    };

    // Method to read a block of 'rowsToRead' lines and parse them as a matrix.
    // Each line is split into tokens, and optionally converted to numbers.
    StreamHandler.prototype.acquireMatrixBlock = function (rowsToRead, keepAsStrings) {
        // Guard clause: Validate the number of rows to read (Type III change).
        if (rowsToRead <= 0 || this._linePointer + rowsToRead > this._sourceLines.length) {
            // Adjust rowsToRead to prevent reading beyond available lines or negative reads.
            rowsToRead = Math.max(0, Math.min(rowsToRead, this._sourceLines.length - this._linePointer));
        }

        var selectedLines = this._sourceLines.slice(this._linePointer, this._linePointer + rowsToRead);
        this._linePointer += rowsToRead; // Advance the line pointer by the number of lines read.

        var parsedMatrix = selectedLines.map(line => line.split(" "));

        // Convert all elements in the matrix to numbers if 'keepAsStrings' is false.
        return keepAsStrings ? parsedMatrix : parsedMatrix.map(row => convertToNumbers(row));
    };

    // Method to read a block of 'numberOfLines' lines as an array of lines.
    // Optionally converts each line to a number if it contains a single value.
    StreamHandler.prototype.fetchLineBlock = function (numberOfLines, asRawText) {
        // Guard clause: Validate the number of lines to fetch (Type III change).
        if (numberOfLines <= 0 || this._linePointer + numberOfLines > this._sourceLines.length) {
            numberOfLines = Math.max(0, Math.min(numberOfLines, this._sourceLines.length - this._linePointer));
        }

        var lineBlock = this._sourceLines.slice(this._linePointer, this._linePointer + numberOfLines);
        this._linePointer += numberOfLines;

        // If not returning raw text, try to convert each line to a number.
        // This implicitly assumes each line in such a block contains a single number.
        return asRawText ? lineBlock : convertToNumbers(lineBlock);
    };

    // The public function returned by the IIFE, used to create new StreamHandler instances.
    function createStreamParser(sourceString) {
        return new StreamHandler(sourceString);
    }

    return createStreamParser;
})();

// --- Main Program Execution ---

// Use 'const' for variables that are not reassigned (Type III change).
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const rawFileContents = fileSystemModule.readFileSync(standardInputPath, "utf8");

// Initialize the data reader with the content from standard input.
var dataReader = INPUT_PROCESSOR(rawFileContents);

// Immediately invoked function expression to encapsulate the main execution flow (Type III change).
(function () {
    console.log(processInputData());
})();

// The core logic function that processes the input and determines the result.
function processInputData() {
    // Define string constants for the possible outcomes for clarity (Type III change).
    const OUTCOME_NO = "No";
    const OUTCOME_YES = "Yes";

    // Read the primary data block, which is expected to be a 3xN matrix.
    var coordinateData = dataReader.acquireMatrixBlock(3);

    // Helper function to perform a basic structural validation of the coordinate data.
    // This is an added guard clause/validation (Type III change).
    function validateInputMatrix(matrix) {
        if (!Array.isArray(matrix) || matrix.length < 3) {
            return false; // Expects at least 3 rows.
        }
        for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
            if (!Array.isArray(matrix[rowIdx]) || matrix[rowIdx].length < 3) {
                return false; // Each of the first 3 rows expects at least 3 columns.
            }
        }
        return true;
    }

    // Apply the input validation. If invalid, return "No" immediately.
    if (!validateInputMatrix(coordinateData)) {
        return OUTCOME_NO;
    }

    // Extract the three coordinate points from the matrix for better readability (Type III change).
    const pointP0 = coordinateData[0]; // First point (reference)
    const pointP1 = coordinateData[1]; // Second point
    const pointP2 = coordinateData[2]; // Third point

    // Helper function to check if a target point aligns with the reference point
    // given an offset in its first coordinate (Type III change).
    // This abstracts the repeated condition check logic.
    function checkPointAlignment(currentOffset, referencePoint, targetPoint) {
        const yCoordinateMatches = (currentOffset + referencePoint[1] === targetPoint[1]);
        const zCoordinateMatches = (currentOffset + referencePoint[2] === targetPoint[2]);
        return yCoordinateMatches && zCoordinateMatches;
    }

    // Calculate the X-coordinate difference between P1 and P0.
    var xDifferenceP1 = pointP1[0] - pointP0[0];

    // First alignment check: Verify if P1 aligns with P0 based on xDifferenceP1.
    if (!checkPointAlignment(xDifferenceP1, pointP0, pointP1)) {
        return OUTCOME_NO;
    }

    // Recalculate the X-coordinate difference, this time for P2 and P0.
    // 'xDifferenceP1' is reassigned, so it cannot be 'const' or 'let' without block scoping.
    // Keeping it 'var' to reflect original behavior while introducing clarity.
    var xDifferenceP2 = pointP2[0] - pointP0[0];

    // Second alignment check: Verify if P2 aligns with P0 based on xDifferenceP2.
    if (!checkPointAlignment(xDifferenceP2, pointP0, pointP2)) {
        return OUTCOME_NO;
    }

    // If both alignment checks pass, the condition is met.
    return OUTCOME_YES;
}