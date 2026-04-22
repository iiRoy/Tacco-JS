/*
 * This module processes a numerical input obtained from standard input.
 * It performs a specific calculation and displays the result.
 */

// Define constants used in calculations for clarity and potential modification.
const DECIMAL_RADIX_BASE = 10;
const SUBTRACTOR_VALUE = 2;
const MULTIPLIER_FACTOR = 180;

/*
 * The primary function responsible for handling the input and executing the core logic.
 * It takes raw text, processes it into a number, performs a calculation, and outputs the result.
 * @param {string} rawTextContent - The raw string data received as input, potentially with leading/trailing spaces.
 */
function processInputData( rawTextContent ) {
    // First, remove any extraneous whitespace from the beginning and end of the input string.
    let cleanedString = stripWhitespace(rawTextContent);

    // Convert the cleaned string into an integer using the specified radix (base 10).
    // The result represents a key numerical measurement for subsequent operations.
    let computedNumericalVal = parseStringAsInteger(cleanedString, DECIMAL_RADIX_BASE);

    // Perform the main arithmetic operation: (value - 2) * 180.
    // This calculation might represent an angle, a geometric property, or another derived metric.
    let interimResult = (computedNumericalVal - SUBTRACTOR_VALUE) * MULTIPLIER_FACTOR;

    // Round down the interim result to the nearest whole number to get a final integer.
    let finalIntegerOutcome = roundDownToInteger(interimResult);

    // Output the final calculated integer to the standard console.
    displayResultToConsole( finalIntegerOutcome );
}


// --- Program Entry Point ---

// Define the standard input file path and its encoding for reading system input.
const STDIN_PATH_STRING = "/dev/stdin";
const UTF8_ENCODING_TYPE = "utf8";

// Read the complete content from the standard input file using the specified encoding.
let systemInputData = readSystemInputFile(STDIN_PATH_STRING, UTF8_ENCODING_TYPE);

// Invoke the main processing function with the obtained input data.
processInputData( systemInputData );


// --- Helper Functions Definitions ---
// These functions wrap standard JavaScript functionalities for consistency and semantic naming.

/*
 * Parses a string into an integer.
 * @param {string} textString - The string to be converted.
 * @param {number} base - The radix (base) for parsing (e.g., 10 for decimal).
 * @returns {number} The parsed integer.
 */
function parseStringAsInteger(textString, base) {
    return parseInt(textString, base);
}

/*
 * Removes leading and trailing whitespace from a given string.
 * @param {string} text - The input string.
 * @returns {string} The string with whitespace trimmed.
 */
function stripWhitespace(text) {
    return text.trim();
}

/*
 * Rounds a floating-point number down to the nearest whole integer.
 * @param {number} numberValue - The number to be rounded.
 * @returns {number} The largest integer less than or equal to `numberValue`.
 */
function roundDownToInteger(numberValue) {
    return Math.floor(numberValue);
}

/*
 * Prints a given message or value to the standard output console.
 * @param {*} messageContent - The content to be displayed.
 */
function displayResultToConsole(messageContent) {
    console.log(messageContent);
}

/*
 * Reads the entire content of a file from the file system.
 * This function wraps the Node.js `fs.readFileSync` method.
 * @param {string} filePath - The path to the file to be read.
 * @param {string} encodingFormat - The character encoding to use (e.g., 'utf8').
 * @returns {string} The content of the file as a string.
 */
function readSystemInputFile(filePath, encodingFormat) {
    const filesystemModule = require("fs"); // Obtain the built-in file system module.
    return filesystemModule.readFileSync(filePath, encodingFormat);
}