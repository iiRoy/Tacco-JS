"use strict"; /* This directive enforces strict parsing and error handling in the script. */

// Aliases for core functionality to provide distinct identifier names.
const getExternalModule = require; // Function to import Node.js modules.
const convertToInteger = parseInt; // Function to parse a string argument and returns an integer.
const outputUtility = console; // Global object providing access to debugging console.

/**
 * A custom logging function to replace the direct console.log call.
 * @param {any} content - The data to be displayed.
 */
function displayMessage(content) {
  outputUtility.log(content); // Utilizes the aliased console object's log method.
}

// Configuration constants for input processing.
const standardInputLocation = "/dev/stdin"; // Path to standard input file.
const utf8CharEncoding = "utf8"; // Standard character encoding for text.
const whitespaceDelimiter = " "; // Character used to separate input values.
const firstElementIndex = 0; // Index for the initial value in an array.
const secondElementIndex = 1; // Index for the subsequent value in an array.
const minimumThreshold = 1; // Threshold for value comparison.
const defaultResultIfBelow = 0; // Fallback value if the threshold is not met.


// Acquire the file system module.
const fileSystemHandler = getExternalModule('fs');

// Read the entire content from the specified standard input path.
const rawContentBuffer = fileSystemHandler.readFileSync(standardInputLocation, utf8CharEncoding);

// Convert the received buffer to a string format and then segment it.
const contentAsString = rawContentBuffer.toString(); // Convert buffer object to string.
const numericalPartsArray = contentAsString.split(whitespaceDelimiter); // Split string by whitespace.

// Extract and parse the first numeric component from the segmented array.
const initialValueA = convertToInteger(numericalPartsArray[firstElementIndex]);

// Determine the first final value: if greater than threshold, use as is; otherwise, use default.
const processedValueA = initialValueA > minimumThreshold ? initialValueA : defaultResultIfBelow;

// Extract and parse the second numeric component from the segmented array.
const initialValueB = convertToInteger(numericalPartsArray[secondElementIndex]);

// Determine the second final value: if greater than threshold, use as is; otherwise, use default.
const processedValueB = initialValueB > minimumThreshold ? initialValueB : defaultResultIfBelow;

// Compute the product of the two processed values and output the result.
displayMessage(processedValueA * processedValueB);