const InputProcessor = (function() {
    /**
     * Manages reading operations from a string buffer, treating it as a stream of lines and tokens.
     * @param {string} sourceText - The entire input content as a single string.
     */
    function LineStream(sourceText) {
        // Normalize line endings and split the source into an array of lines.
        // Filter out any lines that are empty or contain only whitespace.
        this._sourceDataLines = sourceText.split(/\r?\n/).filter(line => line.trim().length > 0);
        // Pointer to indicate which line is currently being processed from the `_sourceDataLines` array.
        this._currentLinePointer = 0;
        // A buffer to hold tokens from the current line, allowing token-by-token consumption.
        this._currentLineTokens = [];
    }

    /**
     * Reads and returns the next available token from the input stream.
     * Tokens are processed from left to right within each line.
     * @param {boolean} [returnRaw=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The next token, either raw or numerical.
     * @throws {Error} If an attempt is made to read beyond the end of the input.
     */
    LineStream.prototype.readNumericalToken = function(returnRaw = false) {
        // Refill the token buffer if it's empty.
        while (this._currentLineTokens.length === 0) {
            if (this._currentLinePointer >= this._sourceDataLines.length) {
                // All lines have been processed.
                throw new Error("Input stream exhausted: Attempted to read past the end of input.");
            }
            const currentLine = this._sourceDataLines[this._currentLinePointer];
            // Split the current line by one or more whitespace characters, then filter out any empty strings
            // that might result from multiple spaces (e.g., "1   2" -> ["1", "", "", "2"] -> ["1", "2"]).
            this._currentLineTokens = currentLine.split(/\s+/).filter(Boolean);
            this._currentLinePointer++; // Advance the line pointer for the next line read.

            if (this._currentLineTokens.length === 0) {
                // If the line was effectively empty (e.g., just spaces), try the next line.
                continue;
            }
        }

        // Extract the first token from the buffer (left-to-right processing).
        const token = this._currentLineTokens.shift();
        // Return the token as a string or convert it to a number.
        return returnRaw ? token : Number(token);
    };

    /**
     * Reads and returns all tokens from the current line as an array.
     * @param {boolean} [returnRaw=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {string[]|number[]} An array of tokens from the line.
     * @throws {Error} If an attempt is made to read beyond the end of the input.
     */
    LineStream.prototype.readNumericalLine = function(returnRaw = false) {
        if (this._currentLinePointer >= this._sourceDataLines.length) {
            throw new Error("Input stream exhausted: Attempted to read past the end of input.");
        }
        // Retrieve the current line and advance the pointer.
        const lineContent = this._sourceDataLines[this._currentLinePointer++];
        // Split and filter tokens from this line.
        const tokens = lineContent.split(/\s+/).filter(Boolean);
        // Return raw tokens or converted numbers.
        return returnRaw ? tokens : tokens.map(Number);
    };

    /**
     * Reads a specified number of lines and parses them into a 2D array (matrix).
     * @param {number} numRows - The number of rows (lines) to read for the matrix.
     * @param {boolean} [returnRaw=false] - If true, returns string matrix; otherwise, numerical matrix.
     * @returns {string[][]|number[][]} The parsed matrix.
     */
    LineStream.prototype.readNumericalMatrix = function(numRows, returnRaw = false) {
        const matrix = [];
        for (let i = 0; i < numRows; i++) {
            matrix.push(this.readNumericalLine(returnRaw));
        }
        return matrix;
    };

    /**
     * Reads a specified number of lines without splitting them into tokens, returning them as an array.
     * Each element in the array is a full line string, or converted to a number if not raw.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnRaw=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {string[]|number[]} An array of lines.
     */
    LineStream.prototype.readNumericalBlock = function(numLines, returnRaw = false) {
        const block = [];
        for (let i = 0; i < numLines; i++) {
            if (this._currentLinePointer >= this._sourceDataLines.length) {
                throw new Error("Input stream exhausted: Attempted to read past the end of an input block.");
            }
            const line = this._sourceDataLines[this._currentLinePointer++];
            block.push(line);
        }
        return returnRaw ? block : block.map(Number);
    };

    /**
     * Factory function to create a new LineStream instance.
     * @param {string} sourceString - The string content to be parsed.
     * @returns {LineStream} A new LineStream instance.
     */
    function createStreamParser(sourceString) {
        return new LineStream(sourceString);
    }

    return createStreamParser;
})();

/**
 * Calculates the squared Euclidean magnitude (distance from origin squared) for a 2D vector.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {number} The value of x^2 + y^2.
 */
const getSquaredMagnitude = (x, y) => x * x + y * y;

/**
 * Determines the polar angle of a 2D vector (coordX, coordY) in degrees,
 * normalizing the result to be within the [0, 360) range.
 * This function utilizes Math.atan2 for robust quadrant handling.
 * @param {number} coordX - The X-coordinate of the vector.
 * @param {number} coordY - The Y-coordinate of the vector.
 * @returns {number} The polar angle in degrees, with a fixed precision.
 */
function getPolarAngleInDegrees(coordX, coordY) {
    // Math.atan2(y, x) returns the angle in radians, ranging from -PI to +PI.
    let angleRadians = Math.atan2(coordY, coordX);
    // Convert radians to degrees.
    let angleDegrees = angleRadians * (180 / Math.PI);

    // Normalize the angle to be strictly non-negative and less than 360 degrees.
    if (angleDegrees < 0) {
        angleDegrees += 360;
    }

    // Use toFixed for consistent floating-point precision, then convert back to Number.
    // This helps in consistent sorting and comparisons for angles that might be
    // infinitesimally different due to floating point arithmetic.
    return Number(angleDegrees.toFixed(7));
}

// Instantiate the input parser by reading the content of standard input.
const dataParser = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

let initialPointCount;
// This array will store processed point vectors, each containing [x, y, angle].
let pointVectors = [];

// Execute the main problem-solving function and print its result.
console.log(solveOptimizationProblem());

/**
 * Implements the core logic of the problem: finding the maximum possible Euclidean distance
 * from the origin by summing a contiguous sub-sequence of input vectors.
 * Vectors are sorted by their polar angle, and the list is effectively doubled
 * to handle sequences that "wrap around" the 360-degree range.
 * @returns {number} The maximum distance as a floating-point number.
 */
function solveOptimizationProblem() {
    // Read the initial count of points specified in the input.
    initialPointCount = dataParser.readNumericalToken();

    // Loop to read all (x, y) coordinates and prepare the point vectors.
    for (let currentIdx = 0; currentIdx < initialPointCount; currentIdx++) {
        const xVal = dataParser.readNumericalToken();
        const yVal = dataParser.readNumericalToken();

        // Skip vectors that are at the origin (0,0) as they do not contribute to magnitude
        // or angle meaningfully for this problem's context.
        if (xVal === 0 && yVal === 0) {
            continue;
        }
        // Store the x, y coordinates along with their calculated polar angle.
        pointVectors.push([xVal, yVal, getPolarAngleInDegrees(xVal, yVal)]);
    }

    // Update `initialPointCount` to reflect the actual number of valid (non-zero) points.
    initialPointCount = pointVectors.length;

    // Sort the collected point vectors primarily by their polar angle in ascending order.
    // This ordering is crucial for the sliding window approach to correctly identify contiguous angular segments.
    pointVectors.sort((point1, point2) => point1[2] - point2[2]);

    // Create an expanded list of point vectors by concatenating the sorted list with itself.
    // This technique allows the sliding window to seamlessly handle segments that
    // cross the 0/360 degree boundary (i.e., wrap around).
    const expandedPointVectors = [...pointVectors, ...pointVectors];

    let maxSquaredResult = 0;   // Stores the largest squared distance found so far.
    let currentSumX = 0;        // Accumulates the sum of X-coordinates for the current window.
    let currentSumY = 0;        // Accumulates the sum of Y-coordinates for the current window.
    let windowEndIndex = 0;     // Pointer for the right boundary (inclusive) of the sliding window.

    // The outer loop iterates, setting the start point of the sliding window.
    // It only needs to iterate through the original set of unique points.
    for (let windowStartIndex = 0; windowStartIndex < initialPointCount; windowStartIndex++) {
        // The inner loop expands the window to the right as long as adding the next vector
        // increases the total squared magnitude of the current sum vector.
        // The window can expand up to `initialPointCount` elements in length from `windowStartIndex`.
        while (windowEndIndex < windowStartIndex + initialPointCount) {
            const nextX = currentSumX + expandedPointVectors[windowEndIndex][0];
            const nextY = currentSumY + expandedPointVectors[windowEndIndex][1];

            // Check if adding the next vector would result in a sum vector with a smaller
            // or equal squared magnitude. If so, further expansion from this `windowStartIndex`
            // would not yield a better result, so we break.
            if (getSquaredMagnitude(currentSumX, currentSumY) >= getSquaredMagnitude(nextX, nextY)) {
                break;
            }

            // If adding the next vector increases magnitude, incorporate it into the sum
            // and advance the window's end pointer.
            currentSumX = nextX;
            currentSumY = nextY;
            windowEndIndex++;
        }

        // After expanding the window as much as possible for the current `windowStartIndex`,
        // update the overall maximum squared distance found.
        const currentSegmentSquaredDistance = getSquaredMagnitude(currentSumX, currentSumY);
        maxSquaredResult = Math.max(maxSquaredResult, currentSegmentSquaredDistance);

        // Before moving to the next `windowStartIndex`, remove the vector at the current
        // `windowStartIndex` from the sum. This effectively slides the window one position to the right.
        currentSumX -= expandedPointVectors[windowStartIndex][0];
        currentSumY -= expandedPointVectors[windowStartIndex][1];
    }

    // The problem asks for the maximum distance (not squared distance), so we take the square root.
    return Math.sqrt(maxSquaredResult);
}