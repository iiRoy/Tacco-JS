var inputHandler = initializeInputProcessor();

ExecuteProgram();

/**
 * Retrieves the next line from input and converts it to an integer.
 * @returns {number} The integer value.
 */
function retrieveInteger() {
    return convertInput(getNextLine(), 1);
}

/**
 * Retrieves the next line from input and splits it by space into a string array.
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
    return convertInput(getNextLine(), 2);
}

/**
 * Retrieves the next line from input, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function retrieveIntegerArray() {
    return convertInput(getNextLine(), 4);
}

/**
 * Retrieves the next line from input and splits it into an array of single characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterArray() {
    return convertInput(getNextLine(), 6);
}

/**
 * Fetches the next available line from the input source.
 * @returns {string} The next line of input.
 */
function getNextLine() {
    return inputHandler.getNextLine();
}

/**
 * Checks if there are more lines available in the input.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function hasMoreLines() {
    return inputHandler.hasMoreLines();
}

/**
 * Reads the entire standard input file.
 * @returns {string[]} An array of strings, each representing a line from the input.
 */
function readInputFile() {
    // Using Node.js 'fs' module to read from standard input
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/**
 * Sets up the input processing object.
 * This object manages reading lines from the input data.
 * @returns {object} An object with methods to access input lines.
 */
function initializeInputProcessor() {
    // Read all lines from the input source
    var rawInputData = readInputFile();

    // Create an object to manage input state
    var processorInstance = {
        "dataLines": rawInputData, // All lines read from input
        "currentLineIndex": 0,     // Current position in the input lines array
        "totalLines": rawInputData.length, // Total number of lines
        // Method to check if there are more lines to read
        "hasMoreLines": function() {
            return (this.currentLineIndex < this.totalLines);
        },
        // Method to get the next line from input
        "getNextLine": function() {
            if (!this.hasMoreLines()) {
                return ""; // Return empty string if no more lines
            } else {
                var currentLineContent = this.dataLines[this.currentLineIndex];
                this.currentLineIndex++; // Advance the index
                return currentLineContent;
            }
        }
    };
    return processorInstance;
}

/**
 * Displays a message to standard output.
 * @param {*} messageContent The content to be displayed.
 */
function displayOutput(messageContent) {
    console.log(messageContent);
}

/**
 * Displays a message to standard error output.
 * @param {*} messageContent The content to be displayed as an error.
 */
function displayError(messageContent) {
    console.error(messageContent);
}

/**
 * Converts input value based on a specified conversion type.
 * @param {*} inputValue The value to convert.
 * @param {number} conversionType The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space and convert to number array.
 *   6: Split into character array.
 *   7: Split into character array and convert to number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 * @returns {*} The converted value.
 */
function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map((itemValue) => Number(itemValue));
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map((itemValue) => Number(itemValue));
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue; // Return original value if conversion type is unknown
        }
    } catch (error) {
        return inputValue; // In case of conversion error, return original value
    }
}

/**
 * Main program logic.
 * Calculates the shortest distance around a circle given points.
 */
function ExecuteProgram() {
    // Read the first line containing K and N
    var firstLineData = retrieveIntegerArray();
    var circleLength = firstLineData[0]; // Total length of the circle
    var numPoints = firstLineData[1];    // Number of points on the circle

    // Read the line containing the coordinates of the points
    var pointCoordinates = retrieveIntegerArray();

    // Calculate differences between adjacent points
    var distanceDifferences = new Array(numPoints);

    // Calculate distances between consecutive points
    for (let idx = 0; idx < numPoints - 1; idx++) {
        distanceDifferences[idx] = pointCoordinates[idx + 1] - pointCoordinates[idx];
    }

    // Calculate the distance from the last point back to the first point,
    // considering the circular nature (K - last + first)
    distanceDifferences[numPoints - 1] = (circleLength - pointCoordinates[numPoints - 1]) + pointCoordinates[0];

    // Output the calculated differences to standard error for debugging
    displayError(distanceDifferences);

    // Sort the differences in ascending order
    distanceDifferences.sort(function(valA, valB) {
        return valA - valB;
    });

    // Remove the largest difference (this corresponds to the longest segment
    // that we want to avoid traversing)
    distanceDifferences.pop();

    // Sum the remaining differences to get the minimum total distance
    var totalDistance = 0;
    for (let idx = 0; idx < numPoints - 1; idx++) {
        totalDistance += distanceDifferences[idx];
    }

    // Display the final calculated minimum total distance
    displayOutput(totalDistance);
}
