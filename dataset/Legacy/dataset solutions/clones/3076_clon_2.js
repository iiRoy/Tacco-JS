'use strict';

// Initialize the input processing system
var dataHandler = initializeInputProcessor();

// Execute the main application logic
executePrimaryLogic();

/**
 * Retrieves the next line from input and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function retrieveNextInteger() {
    return convertData(fetchNextLine(), 1);
}

/**
 * Retrieves the next line from input and splits it by spaces into a string array.
 * @returns {string[]} An array of strings.
 */
function retrieveNextStringArray() {
    return convertData(fetchNextLine(), 2);
}

/**
 * Retrieves the next line from input, splits it by spaces, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function retrieveNextIntegerArray() {
    return convertData(fetchNextLine(), 4);
}

/**
 * Retrieves the next line from input and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function retrieveNextCharacterArray() {
    return convertData(fetchNextLine(), 6);
}

/**
 * Fetches the next raw line from the input handler.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
    return dataHandler.fetchNextLine();
}

/**
 * Checks if there are more lines to process in the input.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function hasMoreLines() {
    return dataHandler.hasMoreLines();
}

/**
 * Reads the entire standard input file.
 * @returns {string[]} An array of lines from the input.
 */
function readInputFile() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/**
 * Initializes an object for processing input lines.
 * This object manages reading lines sequentially.
 * @returns {object} An input processor object.
 */
function initializeInputProcessor() {
    var rawInputLines = readInputFile();
    var inputProcessor = {
        "lineBuffer": rawInputLines,
        "currentLineIndex": 0,
        "totalLines": rawInputLines.length,
        "hasMoreLines": function() {
            return (this.currentLineIndex < this.totalLines);
        },
        "fetchNextLine": function() {
            if (!this.hasMoreLines()) {
                return "";
            } else {
                var currentInputLine = this.lineBuffer[this.currentLineIndex];
                this.currentLineIndex++;
                return currentInputLine;
            }
        }
    };
    return inputProcessor;
}

/**
 * Outputs a message to standard output.
 * @param {*} message The message to output.
 */
function outputResult(message) {
    console.log(message);
}

/**
 * Outputs a message to standard error.
 * This function is typically used for debugging or error reporting.
 * @param {*} errorMessage The error message to output.
 */
function outputError(errorMessage) {
    console.error(errorMessage);
}

/**
 * Helper function for various data conversions based on a specified type.
 * @param {*} inputValue The input value to convert.
 * @param {number} conversionType The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into a string array.
 *   4: Split by space into a number array.
 *   6: Split by character into a string array.
 *   7: Split by character into a number array.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without a separator.
 *   Default: Return input as is.
 * @returns {*} The converted value or the original input if conversion fails or type is unknown.
 */
function convertData(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map((numStr) => Number(numStr));
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map((charStr) => Number(charStr));
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (err) {
        // If an error occurs during conversion, return the original input value.
        return inputValue;
    }
}

/**
 * Main function containing the core logic of the program.
 * It reads dimensions, calculates sums, sorts them, and outputs the result.
 */
function executePrimaryLogic() {
    // Read the first line containing dimensions (X, Y, Z) and a count (K)
    var firstLineData = retrieveNextIntegerArray();
    var dimX = firstLineData[0];
    var dimY = firstLineData[1];
    var dimZ = firstLineData[2];
    var countK = firstLineData[3];

    // Read the lists of values for X, Y, and Z dimensions
    var listXValues = retrieveNextIntegerArray();
    var listYValues = retrieveNextIntegerArray();
    var listZValues = retrieveNextIntegerArray();

    // Calculate all possible sums of X and Y values
    // Store them in an intermediate array
    var intermediateSumsXY = new Array(dimX * dimY);
    for (var idxA = 0; idxA < dimX; idxA++) {
        for (var idxB = 0; idxB < dimY; idxB++) {
            intermediateSumsXY[idxA * dimY + idxB] = listXValues[idxA] + listYValues[idxB];
        }
    }

    // Sort the intermediate sums in descending order
    intermediateSumsXY.sort(function(valA, valB) {
        return valB - valA;
    });

    // This slice operation creates a new array but the result is not assigned
    // back to 'intermediateSumsXY'. Thus, 'intermediateSumsXY' retains its original length.
    intermediateSumsXY.slice(0, countK);

    // Calculate all possible sums by combining the intermediate XY sums with Z values
    var finalSumsXYZ = new Array(intermediateSumsXY.length * dimZ);
    for (var idxC = 0; idxC < intermediateSumsXY.length; idxC++) {
        for (var idxD = 0; idxD < dimZ; idxD++) {
            finalSumsXYZ[idxC * dimZ + idxD] = intermediateSumsXY[idxC] + listZValues[idxD];
        }
    }

    // Sort the final sums in descending order
    finalSumsXYZ.sort(function(valA, valB) {
        return valB - valA;
    });

    // Similar to the previous step, this slice operation creates a new array
    // but the result is not assigned to 'finalSumsXYZ'. The array's length remains unchanged.
    finalSumsXYZ.slice(0, countK);

    // Output the final sums, joined by newlines, to standard output
    outputResult(convertData(finalSumsXYZ, 9));
}
