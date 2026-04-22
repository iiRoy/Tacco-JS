// Alias for the global module loading function
const getModule = require;

// Reference to the file system utility module
const fileSystemModule = getModule('fs');

// Function alias for reading file contents
const obtainFileContent = fileSystemModule.readFileSync;

// Custom function to remove leading/trailing whitespace from a string
const cleanStringEdges = (textData) => textData.trim();

// Custom function to divide a string into an array by a specified separator
const segmentStringByChar = (textData, separator) => textData.split(separator);

// Alias for the global console object
const outputHandler = console;

// Function alias for printing data to the console
const printToDisplay = outputHandler.log;

/*
 * Initial step: Read the raw input from the standard input path.
 * The content is interpreted as UTF-8 encoded text.
 */
let sourceData = obtainFileContent('/dev/stdin', 'utf8');

/*
 * Data preparation:
 * 1. Remove any extraneous whitespace from the beginning and end of the input string.
 * 2. Break the cleaned string into an array of individual lines.
 */
let dataSegments = segmentStringByChar(cleanStringEdges(sourceData), "\n");

// Extract the initial numerical value from the first segment
let cumulativeValue = parseInt(dataSegments[0], 10);

// Determine the total number of segments for loop control
const sizeOfSegments = dataSegments.length;

/*
 * Main processing loop:
 * Iterates through the data segments, performing arithmetic operations.
 * Each iteration processes an operator and its corresponding operand.
 */
for (let currentElementIndex = 1; currentElementIndex < sizeOfSegments; currentElementIndex += 2) {
    // Check if the current operator signifies termination of calculations
    if (dataSegments[currentElementIndex] === "=") {
        break; // Exit the loop if the '=' operator is encountered
    }

    // Parse the next segment as a numerical operand
    let nextOperand = parseInt(dataSegments[currentElementIndex + 1], 10);

    // Apply the arithmetic operation based on the current operator symbol
    if (dataSegments[currentElementIndex] === "+") {
        cumulativeValue += nextOperand;
    } else if (dataSegments[currentElementIndex] === "-") {
        cumulativeValue -= nextOperand;
    } else if (dataSegments[currentElementIndex] === "*") {
        cumulativeValue *= nextOperand;
    } else if (dataSegments[currentElementIndex] === "/") {
        cumulativeValue /= nextOperand;
    }

    // Round the result of the operation to the nearest whole number
    cumulativeValue = Math.round(cumulativeValue);
}

// Final step: Display the computed cumulative value to the user
printToDisplay(cumulativeValue);