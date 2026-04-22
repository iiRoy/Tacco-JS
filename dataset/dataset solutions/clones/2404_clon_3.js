"use strict";

// This module provides utilities for reading various data types from a string source.
const InputHandler = (function() {
    // Helper function to convert a value to a number, if possible.
    const tryParseNumber = (val) => {
        const num = Number(val);
        return isNaN(num) ? val : num;
    };

    // Factory function to create a new input reader instance.
    function createReader(sourceContent) {
        return new ReaderContext(sourceContent);
    }

    // Constructor for the reader instance.
    function ReaderContext(rawInput) {
        // Store all input lines, trimmed and split.
        this._lineBuffer = rawInput.trim().split('\n');
        // Current index for the line being processed.
        this._currentLineIndex = 0;
        // Buffer for tokens from the current line, allowing token-by-token reading.
        // Tokens are stored in reverse order to efficiently use pop().
        this._currentTokenBuffer = [];
    }

    // Prototype methods for ReaderContext.

    // Reads the next available token (word) from the input.
    // Advances the line index if the current line is exhausted and refills token buffer.
    // @param {boolean} asStringFlag - If true, returns the token as a string; otherwise, attempts to convert to a number.
    // @returns {string|number|undefined} The next token or undefined if no more input.
    ReaderContext.prototype.retrieveNextToken = function(asStringFlag) {
        // If the current token buffer is empty, attempt to load tokens from the next line.
        if (this._currentTokenBuffer.length === 0) {
            // Check if there are any lines left to process.
            if (this._currentLineIndex >= this._lineBuffer.length) {
                return undefined; // No more input lines available.
            }
            // Split the current line into tokens and reverse them for efficient popping.
            this._currentTokenBuffer = this._lineBuffer[this._currentLineIndex].split(' ').reverse();
            this._currentLineIndex++; // Move to the next line for subsequent reads.
        }

        // Extract the last token from the buffer.
        const tokenValue = this._currentTokenBuffer.pop();

        // Return the token, either as a string or parsed number based on the flag.
        return asStringFlag ? tokenValue : tryParseNumber(tokenValue);
    };

    // Reads an entire line of space-separated values.
    // Advances the line index.
    // @param {boolean} keepStrings - If true, returns values as strings; otherwise, attempts to convert to numbers.
    // @returns {Array<string|number>} An array of values from the line.
    ReaderContext.prototype.fetchLineValues = function(keepStrings) {
        // Ensure there are lines left to read.
        if (this._currentLineIndex >= this._lineBuffer.length) {
            return []; // Return an empty array if no more lines.
        }
        // Get the current line and immediately advance the line index.
        const lineContent = this._lineBuffer[this._currentLineIndex++];
        const values = lineContent.split(' ');

        // If not keeping strings, map all values in the array to numbers.
        return keepStrings ? values : values.map(tryParseNumber);
    };

    // Reads a specified number of lines as a matrix (array of arrays).
    // Advances the line index by 'rowCount'.
    // @param {number} rowCount - The number of lines to read for the matrix.
    // @param {boolean} preserveStringFormat - If true, returns values as strings; otherwise, attempts to convert to numbers.
    // @returns {Array<Array<string|number>>} A matrix of values.
    ReaderContext.prototype.readMatrixOfValues = function(rowCount, preserveStringFormat) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + rowCount;

        // Immediately update the current line index to reflect the lines consumed.
        this._currentLineIndex = endIdx;

        // Slice the relevant lines from the buffer and split each line into an array of strings.
        const rawRows = this._lineBuffer.slice(startIdx, endIdx).map(line => line.split(' '));

        // If 'preserveStringFormat' is false, convert all values within the matrix to numbers.
        return preserveStringFormat
            ? rawRows
            : rawRows.map(row => row.map(tryParseNumber));
    };

    // Reads a specified number of lines as a simple array of values.
    // Advances the line index by 'numLines'.
    // @param {number} numLines - The number of lines to read.
    // @param {boolean} stringOutput - If true, returns values as strings; otherwise, attempts to convert to numbers.
    // @returns {Array<string|number>} An array of values, each representing a line.
    ReaderContext.prototype.retrieveBlockLines = function(numLines, stringOutput) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + numLines;

        // Update the current line index.
        this._currentLineIndex = endIdx;

        // Extract the block of lines.
        const lines = this._lineBuffer.slice(startIdx, endIdx);

        // If 'stringOutput' is false, attempt to convert each line to a number.
        return stringOutput ? lines : lines.map(tryParseNumber);
    };

    return createReader;
})();

// Instantiate the input reader by providing the content from standard input.
const dataHandler = InputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

// This utility function constructs a multi-dimensional array with specified dimensions.
// The base value 'initialValue' will populate the innermost dimension.
// Example: createMultiDimArray(0, 2, 3) will create [[0,0,0],[0,0,0]]
function createMultiDimArray(initialValue, ...dimensions) {
    // Basic validation: ensure dimensions are provided and are valid numbers.
    if (!dimensions || dimensions.length === 0 || !dimensions.every(d => typeof d === 'number' && d >= 0)) {
        // Return a single initial value if no valid dimensions are specified,
        // or potentially throw an error for clearer debugging.
        console.warn("createMultiDimArray: Invalid or missing dimensions provided. Returning initial value or empty array.");
        return initialValue;
    }

    // Helper recursive function to build the array structure level by level.
    const buildRecursiveArray = (dimIndex) => {
        // Base case: If we are at the innermost dimension, fill it with the initial value.
        if (dimIndex === dimensions.length - 1) {
            // Ensure dimension size is a non-negative integer.
            const size = Math.max(0, Math.floor(dimensions[dimIndex]));
            return Array(size).fill(initialValue);
        }

        // Recursive step: Create an array for the current dimension size,
        // and for each element, recursively call to build the next inner dimension.
        const currentDimSize = Math.max(0, Math.floor(dimensions[dimIndex]));
        // Using `map(() => ...)` instead of `fill(null).map(...)` to ensure new arrays are created for each slot.
        return Array.from({ length: currentDimSize }, () => buildRecursiveArray(dimIndex + 1));
    };

    // Start the recursive build process from the outermost dimension (index 0).
    return buildRecursiveArray(0);
}

// Execute the main problem-solving logic and print the result to console.
console.log(computeOptimalJumps());

// The primary function to solve the jumping problem.
// It determines a sequence of jumps to cover a path based on constraints.
// @returns {string|number} A space-separated string of jump distances, or -1 if impossible, or an error message.
function computeOptimalJumps() {
    // Retrieve problem parameters from the input stream using the data handler.
    // pathLength (N): The total length of the path or sequence size.
    const pathLength = dataHandler.retrieveNextToken();
    // maximumJump (M): The maximum allowed jump distance.
    const maximumJump = dataHandler.retrieveNextToken();
    // binaryPathSequence (S): The binary sequence string (e.g., "01010").
    // The 'true' flag ensures it's read as a string, not parsed as a number.
    const binaryPathSequence = dataHandler.retrieveNextToken(true);

    // --- Input Validation ---
    // Perform robust checks on the retrieved parameters to ensure they are valid.
    if (typeof pathLength !== 'number' || pathLength < 0 || !Number.isInteger(pathLength) ||
        typeof maximumJump !== 'number' || maximumJump < 0 || !Number.isInteger(maximumJump) ||
        typeof binaryPathSequence !== 'string' || binaryPathSequence.length !== pathLength) {
        // If any parameter is invalid, log an error and return a specific error message.
        console.error("Critical Error: Invalid input parameters detected. Please check N, M, and S.");
        return "ERROR: Invalid Input Parameters";
    }

    // Identify all positions marked with '0' in the binary sequence.
    // These '0's represent potential landing spots or "safe" positions.
    // The indices are collected in descending order, which is beneficial for the subsequent greedy approach
    // that operates from the end of the path backwards.
    const zeroPositionIndices = [];
    // Iterate from the end of the sequence towards the beginning (N-1 down to 0).
    for (let currentIdx = pathLength - 1; currentIdx >= 0; --currentIdx) {
        if (binaryPathSequence[currentIdx] === '0') {
            zeroPositionIndices.push(currentIdx);
        }
    }

    // This array will store the lengths of the successful jumps made.
    const recordedJumps = [];
    // 'currentLocation' tracks the current position from which a jump is being considered.
    // It starts at the end of the path (pathLength).
    let currentLocation = pathLength;

    // Iterate through the identified '0' positions to determine the optimal jump sequence.
    // 'zeroIdxPointer' keeps track of the current '0' position being evaluated.
    let zeroIdxPointer = 0;
    while (zeroIdxPointer < zeroPositionIndices.length) {
        const potentialLandingSpot = zeroPositionIndices[zeroIdxPointer];

        // Calculate the distance from the current location to the potential landing spot.
        const requiredDistance = currentLocation - potentialLandingSpot;

        // If the required jump distance exceeds the maximum allowed jump,
        // it means this '0' (and any subsequent ones, as they are further away) is unreachable.
        // Thus, the path is impossible to complete.
        if (requiredDistance > maximumJump) {
            return -1; // Indicate impossibility.
        }

        // --- Greedy Strategy for Furthest Jump ---
        // Find the furthest reachable '0' from 'currentLocation' within the 'maximumJump' limit.
        // We aim for the largest possible jump to minimize the total number of jumps.
        let furthestReachableZeroIdx = zeroIdxPointer;
        while (furthestReachableZeroIdx < zeroPositionIndices.length - 1) {
            const nextZeroSpot = zeroPositionIndices[furthestReachableZeroIdx + 1];
            const distanceToNextSpot = currentLocation - nextZeroSpot;

            // If the next '0' position is also within the allowed jump distance,
            // we extend our search for the furthest reachable spot.
            if (distanceToNextSpot <= maximumJump) {
                furthestReachableZeroIdx++;
            } else {
                // The next '0' is too far, so we've found our furthest reachable '0'.
                break;
            }
        }

        // Record the actual jump length from 'currentLocation' to the chosen '0' position.
        const actualJumpLength = currentLocation - zeroPositionIndices[furthestReachableZeroIdx];
        recordedJumps.push(actualJumpLength);

        // Update the 'currentLocation' to the new landing spot.
        currentLocation = zeroPositionIndices[furthestReachableZeroIdx];

        // Advance the 'zeroIdxPointer' to the position immediately after the one we just jumped to.
        // This prevents re-evaluating '0's that have already been covered by the current jump.
        zeroIdxPointer = furthestReachableZeroIdx + 1;
    }

    // The recorded jumps were collected in reverse order (from N down to 0).
    // To present the solution in the standard left-to-right order (0 up to N),
    // the array of jumps must be reversed before joining.
    return recordedJumps.reverse().join(" ");
}