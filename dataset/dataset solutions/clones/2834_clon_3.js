const InputParser = (function () {
    // Defines a class for parsing input data from a string source.
    function DataStreamProcessor(rawInputContent) {
        // Store all input lines, trimmed and split by newline.
        this.sourceLines = rawInputContent.trim().split('\n');
        // Index of the current line being processed.
        this.currentLinePointer = 0;
    }

    /**
     * Retrieves a single token from the current line.
     * The original implementation processed tokens from right-to-left within a line,
     * so this method mimics that by reversing the line tokens once and then popping.
     * @param {boolean} retrieveAsString - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The next token.
     */
    DataStreamProcessor.prototype.getSingleToken = function (retrieveAsString = false) {
        // Get the current line's data. It might be a string or an array of tokens (if already processed).
        let currentLineData = this.sourceLines[this.currentLinePointer];

        // If it's still a string, split and reverse it once.
        if (typeof currentLineData === 'string') {
            currentLineData = currentLineData.split(' ').reverse();
            // Store the processed array back to avoid re-splitting/reversing.
            this.sourceLines[this.currentLinePointer] = currentLineData;
        }

        // Retrieve the last token from the reversed array (which was the first in original order).
        const extractedToken = currentLineData.pop();

        // If the current line is now empty, advance to the next line.
        if (currentLineData.length === 0) {
            this.currentLinePointer++;
        }

        return retrieveAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Retrieves all tokens from the current line, then advances to the next line.
     * @param {boolean} retrieveAsString - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    DataStreamProcessor.prototype.getLineTokens = function (retrieveAsString = false) {
        // Check for end of input.
        if (this.currentLinePointer >= this.sourceLines.length) {
            return [];
        }
        // Retrieve the line and advance the pointer.
        const lineContent = this.sourceLines[this.currentLinePointer++];
        const tokens = lineContent.split(' ');
        return retrieveAsString ? tokens : tokens.map(Number);
    };

    /**
     * Retrieves a specified number of lines, splitting each into tokens.
     * @param {number} count - The number of lines to retrieve.
     * @param {boolean} retrieveAsString - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    DataStreamProcessor.prototype.getMatrixData = function (count, retrieveAsString = false) {
        const collectedMatrix = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLinePointer >= this.sourceLines.length) break; // Guard against reading past end.
            const line = this.sourceLines[this.currentLinePointer++];
            const tokens = line.split(' ');
            collectedMatrix.push(retrieveAsString ? tokens : tokens.map(Number));
        }
        return collectedMatrix;
    };

    /**
     * Retrieves a specified number of raw lines without splitting them into tokens.
     * @param {number} count - The number of lines to retrieve.
     * @param {boolean} retrieveAsString - If true, returns lines as strings; otherwise, attempts conversion to number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    DataStreamProcessor.prototype.getRawLines = function (count, retrieveAsString = false) {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLinePointer >= this.sourceLines.length) break; // Guard against reading past end.
            const line = this.sourceLines[this.currentLinePointer++];
            collectedLines.push(retrieveAsString ? line : Number(line));
        }
        return collectedLines;
    };

    // The factory function to create a new InputParser instance.
    function initializeParser(inputString) {
        return new DataStreamProcessor(inputString);
    }

    return initializeParser;
})();

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * This function uses `eval` for flexible array dimensioning, similar to the original.
 * @param {string} initialElement - The string representation of the initial element (e.g., '[]', '0').
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The initialized multi-dimensional array.
 */
const createDynamicArray = (initialElement, ...dimensions) => {
    if (dimensions.length === 0) {
        return eval(initialElement); // Return a single element if no dimensions specified.
    }

    // Construct the string for `eval` from the innermost dimension outwards.
    // Example: `new Array(dim3).fill(null).map(() => (initialElement))`
    // Then wrap it: `new Array(dim2).fill(null).map(() => (innerArrayString))`
    let arrayEvalString = `new Array(dimensions[${dimensions.length - 1}]).fill(null).map(() => (${initialElement}))`;
    for (let i = dimensions.length - 2; i >= 0; i--) {
        arrayEvalString = `new Array(dimensions[${i}]).fill(null).map(() => (${arrayEvalString}))`;
    }

    // Basic validation to prevent arbitrary code execution via initialElement.
    // This regex allows common array/object literals and simple numeric/string values.
    if (!/^[\[\]\{\}\s\w\d\.\(\)\+\-\*\/%&\|\^<>=!~;`'"]*$/.test(initialElement)) {
        throw new Error("Unsafe initial element string detected for dynamic array creation.");
    }

    return eval(arrayEvalString);
};

// Global application state variables.
// `boundaryExtents` stores min/max coordinate values for different axes and movement types.
// Indices are mapped to specific boundary conditions:
// 0: Vertical (Y-axis) maximum extent derived from 'U' moves. [minY, maxY]
// 1: Horizontal (X-axis) maximum extent derived from 'R' moves. [minX, maxX]
// 2: Vertical (Y-axis) minimum extent derived from 'D' moves. [minY, maxY]
// 3: Horizontal (X-axis) minimum extent derived from 'L' moves. [minX, maxX]
// 4: Y-coordinate range for horizontal movements (R/L). [minY, maxY]
// 5: X-coordinate range for vertical movements (U/D). [minX, maxX]
let boundaryExtents = createDynamicArray("[]", 6); // Initialize with 6 empty arrays.

// Set to store unique potential offset values, starting with 0.
const currentOffsetsSet = new Set([0]);

/**
 * Calculates the maximum value from a list of numbers.
 * Filters out non-numeric (NaN) values.
 * @param {...number} values - Numbers to compare.
 * @returns {number} The maximum value, or Negative Infinity if no valid numbers.
 */
const findMaximumValue = (...values) => {
    const validNumbers = values.filter(val => !Number.isNaN(val));
    if (validNumbers.length === 0) {
        return Number.NEGATIVE_INFINITY; // Sensible default for max if no valid inputs.
    }
    return validNumbers.reduce((currentMax, val) => (val > currentMax ? val : currentMax), validNumbers[0]);
};

/**
 * Calculates the minimum value from a list of numbers.
 * Filters out non-numeric (NaN) values.
 * @param {...number} values - Numbers to compare.
 * @returns {number} The minimum value, or Positive Infinity if no valid numbers.
 */
const findMinimumValue = (...values) => {
    const validNumbers = values.filter(val => !Number.isNaN(val));
    if (validNumbers.length === 0) {
        return Number.POSITIVE_INFINITY; // Sensible default for min if no valid inputs.
    }
    return validNumbers.reduce((currentMin, val) => (val < currentMin ? val : currentMin), validNumbers[0]);
};

/**
 * Updates the minimum and maximum coordinate values for a specific boundary index.
 * If the boundary entry hasn't been initialized, it sets both min and max to the current value.
 * @param {number} index - The array index in `boundaryExtents` to modify.
 * @param {number} coordinate - The coordinate value to incorporate.
 */
const updateCoordinateBounds = (index, coordinate) => {
    const targetBounds = boundaryExtents[index];

    // Check if the specific boundary entry has been previously populated with [min, max].
    if (Array.isArray(targetBounds) && targetBounds.length === 2) {
        // If initialized, update the min and max values.
        if (coordinate < targetBounds[0]) {
            targetBounds[0] = coordinate; // Update minimum.
        } else if (coordinate > targetBounds[1]) {
            targetBounds[1] = coordinate; // Update maximum.
        }
    } else {
        // If not initialized, set both min and max to the current coordinate.
        boundaryExtents[index] = [coordinate, coordinate];
    }
};

/**
 * Generates and adds potential offset values to the `currentOffsetsSet`.
 * These offsets are derived from differences between boundary values, ensuring they are non-negative.
 * @param {number} valueA - A boundary-derived value.
 * @param {number} valueB - Another boundary-derived value.
 * @param {number} valueC - A third boundary-derived value.
 */
const calculateAndAddOffsets = (valueA, valueB, valueC) => {
    // Calculate three different types of offsets based on the input values.
    // Ensure all offsets are non-negative integers before adding to the set.

    const potentialOffset1 = valueC - valueB;
    if (potentialOffset1 >= 0) {
        currentOffsetsSet.add(Math.floor(potentialOffset1));
    }

    const potentialOffset2 = (valueC - valueA) / 2;
    if (potentialOffset2 >= 0) {
        currentOffsetsSet.add(Math.floor(potentialOffset2));
    }

    const potentialOffset3 = valueB - valueA;
    if (potentialOffset3 >= 0) {
        currentOffsetsSet.add(Math.floor(potentialOffset3));
    }
};

/**
 * Helper function to safely retrieve a boundary value, providing a default if not set.
 * This prevents errors if a particular boundary index was never updated during processing.
 * @param {number} idx - The index in `boundaryExtents`.
 * @param {number} partIdx - The sub-index (0 for min, 1 for max).
 * @param {number} defaultValue - The value to return if the boundary is not set.
 * @returns {number} The boundary value or the default value.
 */
const getSafeBoundaryValue = (idx, partIdx, defaultValue) => {
    const boundsArray = boundaryExtents[idx];
    return (Array.isArray(boundsArray) && boundsArray.length > partIdx) ? boundsArray[partIdx] : defaultValue;
};

// Encapsulates the core application logic.
const executeMainLogic = () => {
    // Use Node.js `fs` module to read from standard input.
    const fileSystemModule = require("fs");
    const inputContent = fileSystemModule.readFileSync(process.stdin.fd, "utf8");
    const parser = InputParser(inputContent);

    // Read the total number of data entries to process.
    const totalEntriesCount = parser.getSingleToken();

    // Process each entry to populate the boundary extents.
    for (let entryIdx = 0; entryIdx < totalEntriesCount; entryIdx++) {
        const currentX = parser.getSingleToken();
        const currentY = parser.getSingleToken();
        const movementDirection = parser.getSingleToken(true); // Read direction as a string.

        // Use a switch statement for a clear mapping of directions to boundary updates.
        switch (movementDirection) {
            case "U": // Upward movement: affects max Y (boundary 0) and X range for vertical moves (boundary 5).
                updateCoordinateBounds(0, currentY);
                updateCoordinateBounds(5, currentX);
                break;
            case "R": // Rightward movement: affects max X (boundary 1) and Y range for horizontal moves (boundary 4).
                updateCoordinateBounds(1, currentX);
                updateCoordinateBounds(4, currentY);
                break;
            case "D": // Downward movement: affects min Y (boundary 2) and X range for vertical moves (boundary 5).
                updateCoordinateBounds(2, currentY);
                updateCoordinateBounds(5, currentX);
                break;
            case "L": // Leftward movement: affects min X (boundary 3) and Y range for horizontal moves (boundary 4).
                updateCoordinateBounds(3, currentX);
                updateCoordinateBounds(4, currentY);
                break;
            default:
                console.warn(`Unrecognized movement direction encountered: ${movementDirection}`);
                break;
        }
    }

    // After processing all entries, calculate and add potential offset values to the set.
    // These calculations correspond to the `calc` calls in the original code.

    // First set of offsets (Y-axis related, positive values).
    // Original: calc(move[0][1],move[4][1],move[2][1]);
    calculateAndAddOffsets(
        getSafeBoundaryValue(0, 1, Number.MIN_SAFE_INTEGER), // Max Y from 'U' moves
        getSafeBoundaryValue(4, 1, Number.MIN_SAFE_INTEGER), // Max Y from 'R'/'L' moves
        getSafeBoundaryValue(2, 1, Number.MAX_SAFE_INTEGER)  // Max Y from 'D' moves
    );

    // Second set of offsets (Y-axis related, negated minimums).
    // Original: calc(-move[2][0],-move[4][0],-move[0][0]);
    calculateAndAddOffsets(
        -getSafeBoundaryValue(2, 0, Number.MAX_SAFE_INTEGER), // Negated Min Y from 'D' moves
        -getSafeBoundaryValue(4, 0, Number.MAX_SAFE_INTEGER), // Negated Min Y from 'R'/'L' moves
        -getSafeBoundaryValue(0, 0, Number.MIN_SAFE_INTEGER)  // Negated Min Y from 'U' moves
    );

    // Third set of offsets (X-axis related, positive values).
    // Original: calc(move[1][1],move[5][1],move[3][1]);
    calculateAndAddOffsets(
        getSafeBoundaryValue(1, 1, Number.MIN_SAFE_INTEGER), // Max X from 'R' moves
        getSafeBoundaryValue(5, 1, Number.MIN_SAFE_INTEGER), // Max X from 'U'/'D' moves
        getSafeBoundaryValue(3, 1, Number.MAX_SAFE_INTEGER)  // Max X from 'L' moves
    );

    // Fourth set of offsets (X-axis related, negated minimums).
    // Original: calc(-move[3][0],-move[5][0],-move[1][0]);
    calculateAndAddOffsets(
        -getSafeBoundaryValue(3, 0, Number.MAX_SAFE_INTEGER), // Negated Min X from 'L' moves
        -getSafeBoundaryValue(5, 0, Number.MAX_SAFE_INTEGER), // Negated Min X from 'U'/'D' moves
        -getSafeBoundaryValue(1, 0, Number.MIN_SAFE_INTEGER)  // Negated Min X from 'R' moves
    );

    // Initialize the variable to store the smallest area found, using a very large number.
    let minimumCalculatedArea = Number.MAX_SAFE_INTEGER; // Equivalent to 1e18 or larger.

    // Iterate through all generated offset values to find the minimal enclosing area.
    for (const currentShiftOffset of currentOffsetsSet) {
        // Calculate the effective maximum and minimum Y coordinates for the current offset.
        const yCoordMax = findMaximumValue(
            getSafeBoundaryValue(0, 1, Number.MIN_SAFE_INTEGER) + currentShiftOffset, // Max Y ('U') + offset
            getSafeBoundaryValue(2, 1, Number.MAX_SAFE_INTEGER) - currentShiftOffset, // Max Y ('D') - offset
            getSafeBoundaryValue(4, 1, Number.MIN_SAFE_INTEGER)                       // Max Y ('R'/'L')
        );

        const yCoordMin = findMinimumValue(
            getSafeBoundaryValue(0, 0, Number.MAX_SAFE_INTEGER) + currentShiftOffset, // Min Y ('U') + offset
            getSafeBoundaryValue(2, 0, Number.MIN_SAFE_INTEGER) - currentShiftOffset, // Min Y ('D') - offset
            getSafeBoundaryValue(4, 0, Number.MAX_SAFE_INTEGER)                       // Min Y ('R'/'L')
        );

        // Calculate the effective maximum and minimum X coordinates for the current offset.
        const xCoordMax = findMaximumValue(
            getSafeBoundaryValue(1, 1, Number.MIN_SAFE_INTEGER) + currentShiftOffset, // Max X ('R') + offset
            getSafeBoundaryValue(3, 1, Number.MAX_SAFE_INTEGER) - currentShiftOffset, // Max X ('L') - offset
            getSafeBoundaryValue(5, 1, Number.MIN_SAFE_INTEGER)                       // Max X ('U'/'D')
        );

        const xCoordMin = findMinimumValue(
            getSafeBoundaryValue(1, 0, Number.MAX_SAFE_INTEGER) + currentShiftOffset, // Min X ('R') + offset
            getSafeBoundaryValue(3, 0, Number.MIN_SAFE_INTEGER) - currentShiftOffset, // Min X ('L') - offset
            getSafeBoundaryValue(5, 0, Number.MAX_SAFE_INTEGER)                       // Min X ('U'/'D')
        );

        // Compute the width and height of the bounding box.
        const boxWidth = xCoordMax - xCoordMin;
        const boxHeight = yCoordMax - yCoordMin;

        // Calculate the area.
        const currentArea = boxWidth * boxHeight;

        // Update the minimum area if the current area is valid (non-negative dimensions) and smaller.
        if (boxWidth >= 0 && boxHeight >= 0 && currentArea < minimumCalculatedArea) {
            minimumCalculatedArea = currentArea;
        }
    }

    return minimumCalculatedArea;
};

// Execute the main application logic and output the final result to console.
console.log(executeMainLogic());