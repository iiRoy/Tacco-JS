var INPUT_PARSER = (function() {
    /**
     * Factory function to create an InputReader instance.
     * @param {string} sourceString - The raw string containing all input data.
     * @returns {InputReader} A new instance of InputReader.
     */
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    /**
     * InputReader class for parsing various data types from a string.
     * @class
     * @param {string} rawInputString - The complete input string, typically from a file.
     */
    function InputReader(rawInputString) {
        // Internal storage for processed input lines.
        this._sourceLines = rawInputString.trim().split("\n");
        // Index of the current line being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next single value from the current line.
     * Values on a line are consumed from right to left (as per original logic).
     * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    InputReader.prototype.readNextValue = function(returnAsString) {
        let lineSegments = this._sourceLines;
        let currentLineIdx = this._currentLineIndex;
        let extractedValue;

        // If the current line is still a single string, split it into segments and reverse.
        // Reversing allows `pop()` to get elements in their original left-to-right order.
        if (typeof lineSegments[currentLineIdx] === "string") {
            lineSegments[currentLineIdx] = lineSegments[currentLineIdx].split(" ").reverse();
        }

        // Extract the last element from the (reversed) array.
        extractedValue = lineSegments[currentLineIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!lineSegments[currentLineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or convert to number.
        return returnAsString ? extractedValue : +extractedValue;
    };

    /**
     * Reads an entire line of space-separated values.
     * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    InputReader.prototype.readLineValues = function(returnAsStrings) {
        // Get the current line, split by space, and then advance the line index.
        let lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
        return returnAsStrings ? lineContent : lineContent.map(item => +item);
    };

    /**
     * Reads a block of 'numLines' lines, parsing each into space-separated values (a matrix).
     * @param {number} numLines - The number of lines to read for the matrix.
     * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
     */
    InputReader.prototype.readMatrix = function(numLines, returnAsStrings) {
        // Slice the relevant lines and update the current line index.
        let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                          .map(line => line.split(" "));
        return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    /**
     * Reads a block of 'numLines' lines, treating each line as a single value.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values, one per line.
     */
    InputReader.prototype.readRows = function(numLines, returnAsStrings) {
        // Slice the relevant lines and update the current line index.
        let rowValues = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        return returnAsStrings ? rowValues : rowValues.map(item => +item);
    };

    return createParser;
})();

// Initialize the input parser by reading from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array dynamically based on provided dimensions.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    let argsList = arguments;
    let argCount = argsList.length;
    // Construct the string for the innermost array creation.
    let arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(element => {return " + initialValue + ";})";

    // Build up the nested array creation string for higher dimensions.
    while (--argCount) {
        arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(element => " + arrayCreationString + ")";
    }
    // Evaluate the string to create the array.
    return eval(arrayCreationString);
}

// Global variables to store the number of points and their coordinates.
var pointCount;
var xCoordinates = [];
var yCoordinates = [];

// Execute the main calculation logic and print the final result.
console.log(calculateMaxDistance());

/**
 * Main function to process input points and determine the maximum possible distance.
 * It reads points, filters out (0,0), and then searches for an optimal projection vector
 * to maximize the squared magnitude of the sum of projected points.
 * @returns {number} The square root of the maximum squared magnitude found.
 */
function calculateMaxDistance() {
    // Read the total number of points initially provided.
    pointCount = inputData.readNextValue();

    // Loop through the specified number of points to read their coordinates.
    for (let loopVar = 0; loopVar < pointCount; loopVar++) {
        let currentX = inputData.readNextValue(); // Read the x-coordinate.
        let currentY = inputData.readNextValue(); // Read the y-coordinate.

        // If a point is at the origin (0,0), it does not contribute to the sum, so skip it.
        if (currentX === 0 && currentY === 0) {
            continue;
        }

        // Store the valid (non-origin) coordinates.
        xCoordinates.push(currentX);
        yCoordinates.push(currentY);
    }

    // Update the pointCount to reflect only the valid points that were stored.
    pointCount = xCoordinates.length;

    // Initialize the variable to store the maximum squared distance found.
    let maxSquaredDistance = 0;

    // Iterate through a range of values for the projection vector components (h, w).
    // The range is from -1,000,000 to 1,000,000, incrementing by 20.
    for (let loopVar = -1000000; loopVar <= 1000000; loopVar += 20) {
        // Test four boundary conditions for the projection vector (h, w).

        // Case 1: h = -1,000,000, w = loopVar
        let currentSquaredDistance = computeProjectionSquaredMagnitude(-1000000, loopVar);
        if (maxSquaredDistance < currentSquaredDistance) {
            maxSquaredDistance = currentSquaredDistance;
        }

        // Case 2: h = 1,000,000, w = loopVar
        currentSquaredDistance = computeProjectionSquaredMagnitude(1000000, loopVar);
        if (maxSquaredDistance < currentSquaredDistance) {
            maxSquaredDistance = currentSquaredDistance;
        }

        // Case 3: h = loopVar, w = 1,000,000
        currentSquaredDistance = computeProjectionSquaredMagnitude(loopVar, 1000000);
        if (maxSquaredDistance < currentSquaredDistance) {
            maxSquaredDistance = currentSquaredDistance;
        }

        // Case 4: h = loopVar, w = -1,000,000
        currentSquaredDistance = computeProjectionSquaredMagnitude(loopVar, -1000000);
        if (maxSquaredDistance < currentSquaredDistance) {
            maxSquaredDistance = currentSquaredDistance;
        }
    }
    // The problem asks for the distance, which is the square root of the maximum squared distance.
    return Math.sqrt(maxSquaredDistance);
}

/**
 * Computes the squared magnitude of the sum of selected vectors.
 * For each point (x_i, y_i), if its dot product with the vector (vectorW, vectorH) is positive,
 * it is included in the sum. The function then returns the squared Euclidean magnitude of this sum.
 * @param {number} vectorH - The 'h' component of the projection vector.
 * @param {number} vectorW - The 'w' component of the projection vector.
 * @returns {number} The squared magnitude (totalProjectedX^2 + totalProjectedY^2) of the resulting summed vector.
 */
function computeProjectionSquaredMagnitude(vectorH, vectorW) {
    let totalProjectedX = 0; // Accumulator for the sum of x-components of selected points.
    let totalProjectedY = 0; // Accumulator for the sum of y-components of selected points.

    // Iterate through all the valid (non-origin) points.
    for (let loopIndex = 0; loopIndex < pointCount; loopIndex++) {
        // Calculate the dot product of the current point (xCoordinates[loopIndex], yCoordinates[loopIndex])
        // with the projection vector (vectorW, vectorH).
        // The condition `x[i]*w + y[i]*h > 0` means we are checking the dot product with (w, h).
        if (xCoordinates[loopIndex] * vectorW + yCoordinates[loopIndex] * vectorH > 0) {
            // If the dot product is positive, the point contributes to the sum.
            totalProjectedX += xCoordinates[loopIndex];
            totalProjectedY += yCoordinates[loopIndex];
        }
    }
    // Return the squared Euclidean magnitude of the accumulated vector.
    return totalProjectedX * totalProjectedX + totalProjectedY * totalProjectedY;
}
