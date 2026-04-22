// This section handles the input reading mechanism. It's a utility block.
var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var dataProcessor;
var capturedLines = []; // Array to store lines read from input

inputHandler.on('line', function (lineContent) {
    capturedLines.push(lineContent); // Store each line as it's read
});

inputHandler.on('close', function () {
    dataProcessor = initializeProcessor(capturedLines); // Initialize the data processing object
    console.error('\n*** Input processed, displaying output below ***'); // Debug message for user
    ExecuteCalculation(); // Begin the main program logic
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} originalObject The object to clone.
 * @returns {any} A deep copy of the original object.
 */
function createDeepCopy(originalObject) {
    return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Helper functions for parsing different data types from input stream
function retrieveInteger() {
    return performConversion(fetchNextElement(), 1);
}

function retrieveStringArray() {
    return performConversion(fetchNextElement(), 2);
}

function retrieveIntegerArray() {
    return performConversion(fetchNextElement(), 4);
}

function retrieveCharacterArray() {
    return performConversion(fetchNextElement(), 6);
}

function fetchNextElement() {
    return dataProcessor.fetchNextElement();
}

function hasMoreElements() {
    return dataProcessor.hasMoreElements();
}

/**
 * Sets up the input processing object.
 * @param {string[]} incomingData An array of strings representing input lines.
 * @returns {object} An object with methods to navigate the input data.
 */
function initializeProcessor(incomingData) {
    return {
        dataBuffer: incomingData,
        currentPosition: 0,
        totalItems: incomingData.length,

        hasMoreElements: function () {
            return (this.currentPosition < this.totalItems);
        },

        fetchNextElement: function () {
            if (this.hasMoreElements()) {
                return this.dataBuffer[this.currentPosition++];
            } else {
                throw new Error('InputOutOfBounds: No more items to retrieve from the buffer.');
            }
        }
    };
}

/**
 * Prints a message to the standard output.
 * @param {string} message The string to be printed.
 */
function displayOutput(message) {
    console.log(message);
}

/**
 * Logs a debug message to the standard error stream.
 * @param {any} debugValue The value to inspect and log.
 */
function logDebugMessage(debugValue) {
    console.error('--- Debug Trace ---: ' + require('util').inspect(debugValue, false, null));
}

// This function handles various data type conversions based on a specified type code.
// The 'conversionType' parameter dictates the transformation:
// 1: Parses an integer from the input string.
// 2: Splits the string by spaces into an array of strings.
// 4: Splits by spaces and converts each part to a number.
// 6: Splits the string into an array of individual characters.
// 7: Splits into characters and converts each to a number.
// 8: Joins an array of strings with spaces.
// 9: Joins an array of strings with newline characters.
// 0: Joins an array of strings without any separator.
// Default: Returns the input as is if the type is unrecognized.
function performConversion(valueToConvert, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(valueToConvert);
            case 2:
                return valueToConvert.split(' ');
            case 4:
                return valueToConvert.split(' ').map(Number);
            case 6:
                return valueToConvert.split('');
            case 7:
                return valueToConvert.split('').map(Number);
            case 8:
                return valueToConvert.join(' ');
            case 9:
                return valueToConvert.join('\n');
            case 0:
                return valueToConvert.join('');
            default:
                return valueToConvert;
        }
    } catch (exceptionObject) {
        // In case of conversion error, return the original value
        return valueToConvert;
    }
}

// This marks the end of the utility functions and the start of the primary application logic.
function ExecuteCalculation() {
    var inputValues = retrieveIntegerArray(); // Read a line of integers

    // Extract individual integer values from the array
    var valA = inputValues[0];
    var valO = inputValues[1];
    var valT = inputValues[2];
    var valJ = inputValues[3];
    var valL = inputValues[4];
    var valS = inputValues[5];
    var valZ = inputValues[6];

    // Calculate the first possible arrangement result
    var resultOne = Math.floor(valA / 2) * 2 + Math.floor(valJ / 2) * 2 + Math.floor(valL / 2) * 2;

    // Calculate the second possible arrangement result, considering a special case
    var resultTwo = Math.floor((valA - 1) / 2) * 2 + Math.floor((valJ - 1) / 2) * 2 + Math.floor((valL - 1) / 2) * 2 + 6;

    // Output the maximum of the two results, plus an additional value
    displayOutput(Math.max(resultOne, resultTwo) + valO);
}