// This module provides a flexible input parsing utility.
var DATA_STREAM_PARSER = (function () {
    /**
     * Factory function to create an input handler instance.
     * @param {string} sourceContent - The raw string input.
     * @returns {LineBasedProcessor} An instance capable of processing lines.
     */
    function createInputHandler(sourceContent) {
        return new LineBasedProcessor(sourceContent);
    }

    /**
     * Handles line-by-line processing of input data.
     * @class
     * @param {string} sourceContent - The entire input as a single string.
     */
    function LineBasedProcessor(sourceContent) {
        // Internal storage for lines, split by newline.
        this._lineArray = sourceContent.trim().split("\n");
        // Current index indicating which line is being processed.
        this._currentIndex = 0;
    }

    /**
     * Extracts the next numerical or string value from the current line.
     * If the current line is not yet processed into an array, it splits it by space and reverses it.
     * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {number|string} The extracted value.
     */
    LineBasedProcessor.prototype.extractNextValue = function (returnAsString) {
        const localLineArray = this._lineArray;
        const linePosition = this._currentIndex;
        let extractedItem;

        // Check if the current line needs to be split.
        if (typeof localLineArray[linePosition] === "string") {
            localLineArray[linePosition] = localLineArray[linePosition].split(" ").reverse();
        }

        // Pop the last element (due to reverse order for easy popping).
        extractedItem = localLineArray[linePosition].pop();

        // If the line is now empty, advance to the next line.
        if (!localLineArray[linePosition].length) {
            this._currentIndex++;
        }

        // Return as string or parsed number.
        return returnAsString ? extractedItem : +extractedItem;
    };

    /**
     * Extracts all values from the current line, advancing the line pointer.
     * @param {boolean} [keepStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<number|string>} An array of values from the line.
     */
    LineBasedProcessor.prototype.extractLineValues = function (keepStrings) {
        // Split the current line and advance the index.
        const lineParts = this._lineArray[this._currentIndex++].split(" ");
        return keepStrings ? lineParts : lineParts.map(elementItem => +elementItem);
    };

    /**
     * Extracts a matrix of `numRows` rows, each split by space.
     * @param {number} numRows - The number of rows to extract.
     * @param {boolean} [preserveStrings=false] - If true, keeps values as strings; otherwise, converts to numbers.
     * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
     */
    LineBasedProcessor.prototype.extractMatrix = function (numRows, preserveStrings) {
        // Slice the required number of rows and map them.
        const matrixData = this._lineArray.slice(this._currentIndex, this._currentIndex += numRows).map(elementItem => elementItem.split(" "));
        return preserveStrings ? matrixData : matrixData.map(elementItem => elementItem.map(innerItem => +innerItem));
    };

    /**
     * Extracts a specified number of raw lines.
     * @param {number} numLines - The count of lines to extract.
     * @param {boolean} [asStrings=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<number|string>} An array of lines.
     */
    LineBasedProcessor.prototype.extractLines = function (numLines, asStrings) {
        const lineSlice = this._lineArray.slice(this._currentIndex, this._currentIndex += numLines);
        return asStrings ? lineSlice : lineSlice.map(elementItem => +elementItem);
    };

    return createInputHandler;
})();

// Initialize the input reader with data from standard input.
var inputReader = DATA_STREAM_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {any} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, ...).
 * @returns {Array} A new multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    const argsList = arguments;
    let argsLength = argsList.length;
    let arrayCreationCode = "Array(argsList[" + --argsLength + "]).fill(0).map(x=>{return " + initialValue + ";})";

    // Construct the nested array creation string.
    while (--argsLength) {
        arrayCreationCode = "Array(argsList[" + argsLength + "]).fill(0).map(x=>" + arrayCreationCode + ")";
    }
    return eval(arrayCreationCode);
}

// Stores boundary values for 6 different dimensions/directions.
// Each inner array will store [min, max] for a dimension.
var dimensionBounds = initializeMultiDimArray("[]", 6);

// A set to store unique candidate shift values for area calculation.
var possibleShiftValues = new Set([0]);

// Execute the main program logic and print the result.
console.log(runCalculation());

/**
 * Main function to process input and determine the minimum area.
 * @returns {number} The calculated minimum area.
 */
function runCalculation() {
    const totalInstructions = inputReader.extractNextValue(); // Read the number of operations.

    // Process each instruction to update dimension boundaries.
    for (let instructionIdx = 0; instructionIdx < totalInstructions; instructionIdx++) {
        const xCoord = inputReader.extractNextValue();
        const yCoord = inputReader.extractNextValue();
        const directionIndicator = inputReader.extractNextValue(true); // Read direction as string.

        // Update bounds based on direction.
        if (directionIndicator === "U") {
            updateDimensionRange(0, yCoord); // Upward movement affects Y-max.
            updateDimensionRange(5, xCoord); // Upward movement affects X-max.
        } else if (directionIndicator === "R") {
            updateDimensionRange(1, xCoord); // Rightward movement affects X-max.
            updateDimensionRange(4, yCoord); // Rightward movement affects Y-max.
        } else if (directionIndicator === "D") {
            updateDimensionRange(2, yCoord); // Downward movement affects Y-min.
            updateDimensionRange(5, xCoord); // Downward movement affects X-max.
        } else { // 'L'
            updateDimensionRange(3, xCoord); // Leftward movement affects X-min.
            updateDimensionRange(4, yCoord); // Leftward movement affects Y-max.
        }
    }

    // Calculate initial shift candidates from current bounds.
    deriveShiftCandidates(dimensionBounds[0][1], dimensionBounds[4][1], dimensionBounds[2][1]);
    deriveShiftCandidates(-dimensionBounds[2][0], -dimensionBounds[4][0], -dimensionBounds[0][0]);
    deriveShiftCandidates(dimensionBounds[1][1], dimensionBounds[5][1], dimensionBounds[3][1]);
    deriveShiftCandidates(-dimensionBounds[3][0], -dimensionBounds[5][0], -dimensionBounds[1][0]);

    let minimumArea = 1e18; // Initialize with a very large value.

    // Iterate through all possible shift values to find the minimum area.
    for (const shiftValue of possibleShiftValues) {
        // Calculate shifted boundaries for current shiftValue.
        const currentUpperBound = findMaximum(dimensionBounds[0][1] + shiftValue, dimensionBounds[2][1] - shiftValue, dimensionBounds[4][1]);
        const currentLowerBound = findMinimum(dimensionBounds[0][0] + shiftValue, dimensionBounds[2][0] - shiftValue, dimensionBounds[4][0]);
        const currentRightBound = findMaximum(dimensionBounds[1][1] + shiftValue, dimensionBounds[3][1] - shiftValue, dimensionBounds[5][1]);
        const currentLeftBound = findMinimum(dimensionBounds[1][0] + shiftValue, dimensionBounds[3][0] - shiftValue, dimensionBounds[5][0]);

        // Calculate the area for the current set of bounds.
        const computedArea = (currentUpperBound - currentLowerBound) * (currentRightBound - currentLeftBound);

        // Update minimum area if current area is smaller.
        if (computedArea < minimumArea) {
            minimumArea = computedArea;
        }
    }
    return minimumArea;
}

/**
 * Updates the min/max range for a specific dimension based on a coordinate value.
 * @param {number} dimensionIndex - The index of the dimension to update (0-5).
 * @param {number} coordinateVal - The coordinate value to incorporate into the range.
 */
function updateDimensionRange(dimensionIndex, coordinateVal) {
    // If the dimension range is already initialized.
    if (dimensionBounds[dimensionIndex].length) {
        // Update minimum if coordinateVal is smaller.
        if (dimensionBounds[dimensionIndex][0] > coordinateVal) dimensionBounds[dimensionIndex][0] = coordinateVal;
        // Update maximum if coordinateVal is larger.
        else if (dimensionBounds[dimensionIndex][1] < coordinateVal) dimensionBounds[dimensionIndex][1] = coordinateVal;
    } else {
        // Initialize the range [coordinateVal, coordinateVal] if not set.
        dimensionBounds[dimensionIndex][0] = dimensionBounds[dimensionIndex][1] = coordinateVal;
    }
}

/**
 * Calculates and adds potential shift values to the set.
 * These shifts are derived from differences between boundary values.
 * @param {number} boundOne - The first boundary value.
 * @param {number} boundTwo - The second boundary value.
 * @param {number} boundThree - The third boundary value.
 */
function deriveShiftCandidates(boundOne, boundTwo, boundThree) {
    // Add various combinations of differences, ensuring non-negative values.
    possibleShiftValues.add(Math.max(0, (boundThree - boundTwo) || 0));
    possibleShiftValues.add(Math.max(0, ((boundThree - boundOne) / 2) || 0));
    possibleShiftValues.add(Math.max(0, (boundTwo - boundOne) || 0));
}

/**
 * Finds the maximum value among the provided arguments.
 * Handles non-numeric arguments by skipping them.
 * @param {...number} values - A variable number of numerical arguments.
 * @returns {number} The maximum value.
 */
function findMaximum() {
    const valueArguments = arguments;
    let currentMax = valueArguments[0]; // Initialize with the first argument.

    // Iterate through remaining arguments to find the maximum.
    for (let argIndex = 1; argIndex < valueArguments.length; argIndex++) {
        // Skip if the argument is not a valid number.
        if (isNaN(valueArguments[argIndex])) continue;
        // If current max is already greater, continue.
        if (currentMax > valueArguments[argIndex]) continue;
        // Update currentMax if a larger value is found.
        currentMax = valueArguments[argIndex];
    }
    return currentMax;
}

/**
 * Finds the minimum value among the provided arguments.
 * Handles non-numeric arguments by skipping them.
 * @param {...number} values - A variable number of numerical arguments.
 * @returns {number} The minimum value.
 */
function findMinimum() {
    const valueArguments = arguments;
    let currentMin = valueArguments[0]; // Initialize with the first argument.

    // Iterate through remaining arguments to find the minimum.
    for (let argIndex = 1; argIndex < valueArguments.length; argIndex++) {
        // Skip if the argument is not a valid number.
        if (isNaN(valueArguments[argIndex])) continue;
        // If current min is already smaller, continue.
        if (currentMin < valueArguments[argIndex]) continue;
        // Update currentMin if a smaller value is found.
        currentMin = valueArguments[argIndex];
    }
    return currentMin;
}