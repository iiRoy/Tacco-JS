var INPUT_PARSER = (function() {
    /**
     * Creates a new input parser instance.
     * This is the public entry point for the INPUT_PARSER module.
     * @param {string} inputString - The raw input string, typically read from a file.
     * @returns {DataStream} A new DataStream object initialized with the provided string.
     */
    function createParser(inputString) {
        return new DataStream(inputString);
    }

    /**
     * Represents a stream of data lines, allowing sequential parsing of values.
     * @class
     * @param {string} rawInput - The complete raw input string to be parsed.
     */
    function DataStream(rawInput) {
        // Internal storage for all input lines, split by newline and trimmed.
        this._sourceLines = rawInput.trim().split("\n");
        // Keeps track of the current line index being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads and returns the next single value from the current line.
     * Values are assumed to be space-separated and are read from right-to-left
     * within the internal reversed array representation of a line.
     * If the current line is exhausted, the parser automatically advances to the next line.
     * @param {boolean} [returnAsString=false] - If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The parsed value.
     */
    DataStream.prototype.readNextValue = function(returnAsString) {
        var allLines = this._sourceLines;
        var currentLinePosition = this._currentLineIndex;
        var extractedValue;

        // If the current line is still a single string, split it into values and reverse for easy popping.
        if (typeof allLines[currentLinePosition] === "string") {
            allLines[currentLinePosition] = allLines[currentLinePosition].split(" ").reverse();
        }

        // Extract the last element, which is the next value to be read.
        extractedValue = allLines[currentLinePosition].pop();

        // If the current line is now empty, increment the line index to move to the next line.
        if (!allLines[currentLinePosition].length) {
            this._currentLineIndex++;
        }

        // Return the value, either as a string or converted to a number.
        return returnAsString ? extractedValue : +extractedValue;
    };

    /**
     * Reads an entire line of space-separated values and advances the line index.
     * @param {boolean} [returnStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all parsed values from the line.
     */
    DataStream.prototype.readLineValues = function(returnStrings) {
        // Retrieve the current line, split it by spaces, and then advance the line index.
        var valuesFromLine = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return the array of values, optionally mapped to numbers.
        return returnStrings ? valuesFromLine : valuesFromLine.map(item => +item);
    };

    /**
     * Reads a specified number of lines as a matrix of space-separated values.
     * Advances the line index by the number of lines read.
     * @param {number} numLines - The count of lines to read for the matrix.
     * @param {boolean} [returnStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    DataStream.prototype.readMatrix = function(numLines, returnStrings) {
        // Extract the relevant lines, split each into an array of strings.
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(row => row.split(" "));
        // Return the matrix, optionally with all inner values mapped to numbers.
        return returnStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    /**
     * Reads a specified number of raw lines without splitting them into individual values.
     * Advances the line index by the number of lines read.
     * @param {number} numLines - The count of raw lines to retrieve.
     * @param {boolean} [returnStrings=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    DataStream.prototype.readRawLines = function(numLines, returnStrings) {
        // Extract the specified number of raw lines.
        var rawLineData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return the array of lines, optionally mapped to numbers.
        return returnStrings ? rawLineData : rawLineData.map(item => +item);
    };

    return createParser;
})();

// Initialize the input reader by reading from standard input using Node.js 'fs' module.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` to construct and execute the array creation logic.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., `createMultiDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var functionArguments = arguments;
    var argumentCount = functionArguments.length;
    // Start building the array creation expression from the innermost dimension.
    var arrayCreationExpression = "Array(functionArguments[" + --argumentCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    // Wrap the expression with outer dimensions iteratively.
    while (--argumentCount) {
        arrayCreationExpression = "Array(functionArguments[" + argumentCount + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
    }
    // Execute the dynamically generated JavaScript code.
    return eval(arrayCreationExpression);
}

// Declare global variables to store pathfinding parameters and current position.
var stepSize, targetX, targetY, currentX = 0, currentY = 0;

// Execute the main pathfinding algorithm and print its result to the console.
console.log(executePathfinding());

/**
 * Main function to calculate a path from (0,0) to a target (targetX, targetY)
 * using steps of a fixed 'stepSize'.
 * It reads input, performs initial feasibility checks, and generates a sequence of steps.
 * @returns {string} The complete path as a string, with each step's coordinates on a new line.
 */
function executePathfinding() {
    // Read the step size and target coordinates from the input stream.
    stepSize = inputReader.readNextValue();
    targetX = inputReader.readNextValue();
    targetY = inputReader.readNextValue();

    // If the target is already the origin (0,0), no steps are needed.
    if (targetX === 0 && targetY === 0) {
        return 0;
    }

    // Check for impossible scenarios based on parity.
    // If 'stepSize' is even, and the sum of target coordinates (Manhattan distance from origin) is odd,
    // it's impossible to reach the target. Each even step changes (x+y) by an even amount, preserving parity.
    if (stepSize % 2 === 0 && (targetX + targetY) % 2 !== 0) {
        return -1; // Indicate an impossible path.
    }

    // An array to store the coordinates of each step taken on the path.
    var pathCoordinates = [];
    // Calculate the initial Manhattan distance from the origin (0,0) to the target.
    var initialDistanceToTarget = calculateManhattanDistance(0, 0);

    // If the initial distance is not a perfect multiple of the 'stepSize',
    // an initial adjustment step (or sequence of steps) is required to align the path.
    if (initialDistanceToTarget % stepSize !== 0) {
        // If the remainder of (initialDistanceToTarget / stepSize) is odd,
        // a 'takeStep' move can be made to help align the path's parity or reduce distance.
        if (initialDistanceToTarget % stepSize % 2 === 1) {
            pathCoordinates.push(takeStep()); // Record the coordinates after this initial step.
        }

        // Recalculate the remaining distance from the current position (which might have changed)
        // to the target, then adjust it based on 'stepSize' and parity for the next move.
        initialDistanceToTarget = calculateManhattanDistance(currentX, currentY) % stepSize / 2;

        // Apply a special adjustment for cases with an even 'stepSize' and diagonal alignment.
        // This ensures the correct remaining distance is used for the next move.
        if (stepSize % 2 === 0 && Math.abs(currentX - targetX) === Math.abs(currentY - targetY)) {
            initialDistanceToTarget = stepSize - initialDistanceToTarget;
        }

        // Determine the direction and magnitude of the next adjustment step.
        // This logic prioritizes moving along the X-axis if the X-distance is greater than or equal to the adjusted distance.
        if (Math.abs(currentX - targetX) >= initialDistanceToTarget) {
            // Move along the X-axis first.
            if (currentX < targetX) {
                currentX += initialDistanceToTarget;
            } else {
                currentX -= initialDistanceToTarget;
            }
            // Use the remaining step budget to move along the Y-axis.
            if (currentY < targetY) {
                currentY -= (stepSize - initialDistanceToTarget);
            } else {
                currentY += (stepSize - initialDistanceToTarget);
            }
        } else {
            // Move along the Y-axis first.
            if (currentY < targetY) {
                currentY += initialDistanceToTarget;
            } else {
                currentY -= initialDistanceToTarget;
            }
            // Use the remaining step budget to move along the X-axis.
            if (currentX < targetX) {
                currentX -= (stepSize - initialDistanceToTarget);
            } else {
                currentX += (stepSize - initialDistanceToTarget);
            }
        }
        // Add the coordinates after this significant adjustment step to the path.
        pathCoordinates.push(currentX + " " + currentY);
    }

    // Continue taking full steps of 'stepSize' until the target is reached.
    // The loop runs as long as the Manhattan distance from the current position to the target is non-zero.
    while (calculateManhattanDistance(currentX, currentY)) {
        pathCoordinates.push(takeStep()); // Record the coordinates after each step.
    }

    // Output the total number of steps taken to reach the target.
    console.log(pathCoordinates.length);
    // Return the complete path as a string, with each coordinate pair on a new line.
    return pathCoordinates.join("\n");
}

/**
 * Calculates the Manhattan distance from a given point (pointX, pointY)
 * to the global target coordinates (targetX, targetY).
 * @param {number} pointX - The x-coordinate of the starting point for distance calculation.
 * @param {number} pointY - The y-coordinate of the starting point for distance calculation.
 * @returns {number} The Manhattan distance.
 */
function calculateManhattanDistance(pointX, pointY) {
    return Math.abs(pointX - targetX) + Math.abs(pointY - targetY);
}

/**
 * Determines the sign of the difference between two numbers.
 * This utility function is present in the original code but not explicitly called within the main logic.
 * It is retained for structural equivalence.
 * @param {number} fromValue - The starting value.
 * @param {number} toValue - The ending value.
 * @returns {number} 1 if fromValue > toValue, -1 if fromValue < toValue, 0 if fromValue === toValue.
 */
function getDirectionSign(fromValue, toValue) {
    var valueDifference = fromValue - toValue;
    return valueDifference > 0 ? 1 : valueDifference < 0 ? -1 : 0;
}

/**
 * Takes a single step of 'stepSize' towards the target (targetX, targetY).
 * This function updates the global `currentX` and `currentY` variables.
 * It prioritizes moving along the X-axis until `targetX` is reached,
 * then uses any remaining step budget to move along the Y-axis.
 * @returns {string} The new coordinates (currentX, currentY) as a space-separated string.
 */
function takeStep() {
    var remainingStepBudget = stepSize; // Initialize the budget for the current step.

    // Attempt to move along the X-axis first to reach targetX.
    if (targetX !== currentX) {
        if (targetX < currentX) { // CurrentX is greater than targetX, need to move left (decrease X).
            if (remainingStepBudget >= currentX - targetX) {
                // Can reach or pass targetX with the current budget. Move exactly to targetX.
                remainingStepBudget -= (currentX - targetX);
                currentX = targetX; // X-coordinate is now at the target.
            } else {
                // Budget is not enough to reach targetX. Move as much as possible.
                currentX -= remainingStepBudget;
                remainingStepBudget = 0; // Budget exhausted.
            }
        } else { // CurrentX is less than targetX, need to move right (increase X).
            if (remainingStepBudget >= targetX - currentX) {
                // Can reach or pass targetX with the current budget. Move exactly to targetX.
                remainingStepBudget -= (targetX - currentX);
                currentX = targetX; // X-coordinate is now at the target.
            } else {
                // Budget is not enough to reach targetX. Move as much as possible.
                currentX += remainingStepBudget;
                remainingStepBudget = 0; // Budget exhausted.
            }
        }
    }

    // If there's still step budget remaining after X-axis movement, use it for Y-axis movement.
    if (remainingStepBudget) {
        if (targetY < currentY) { // CurrentY is greater than targetY, need to move down (decrease Y).
            currentY -= remainingStepBudget;
        } else { // CurrentY is less than or equal to targetY, need to move up (increase Y).
            currentY += remainingStepBudget;
        }
    }

    // Return the new current coordinates as a space-separated string.
    return currentX + " " + currentY;
}
