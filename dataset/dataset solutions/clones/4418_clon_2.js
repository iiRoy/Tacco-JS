"use strict"; // Enforce strict JavaScript parsing rules.

// A helper function to convert a string representation of a number
// into an integer value using a specified base.
const convertToInteger = (    valueString, radixBase) =>  {
    return parseInt(valueString, radixBase);
};

// A utility function to determine the larger of two numerical inputs.
const findMaximum = (firstNum, secondNum) => {
    return Math.max(firstNum, secondNum);
};

// A utility function to determine the smaller of two numerical inputs.
const findMinimum = (    firstValue, secondValue    ) => {
    return Math.min(firstValue, secondValue);
};

// A function designed to output a given value to the standard console.
const displayOutput = (outputValue) => {
    console.log(outputValue);
};

// A helper function to eliminate leading and trailing whitespace from any string.
const removeWhitespace = (inputString) => {
    return inputString.trim();
};

// A function to break down a source string into an array of smaller strings
// based on a specified character separator.
const divideString = (sourceString, separatorChar) => {
    return sourceString.split(separatorChar);
};

// A general-purpose function to iterate over an array's elements, applying
// a provided processing function to each one, returning a new array.
const processArrayElements = (targetArray, processingFunction) => {
    return targetArray.map(processingFunction);
};

// A function to dynamically load a Node.js module by its identifier.
const retrieveModule = (moduleIdentifier) => {
    return require(moduleIdentifier);
};

// The primary function that encapsulates the core program logic.
const ExecuteProgram = (rawText) => {

    // First, remove any extraneous whitespace from the input text.
    // Then, divide the cleaned text into individual string elements using a space as a delimiter.
    // Finally, transform each string element into an integer, using base 10 for conversion.
    let numericElements = processArrayElements(
        divideString(
            removeWhitespace(rawText), ' '
        ),
        strElement => convertToInteger(strElement, 10)
    );

    // Extract the four boundary values from the processed numerical array.
    // These represent the start and end points of two distinct intervals.
    let rangeOneStart = numericElements[0];
    let rangeOneEnd = numericElements[1];
    let rangeTwoStart = numericElements[2];
    let rangeTwoEnd = numericElements[3];

    // Calculate the potential starting point of the overlap between the two intervals.
    // This is the maximum of the two interval starting points.
    let overlapBeginning = findMaximum(rangeOneStart, rangeTwoStart);

    // Calculate the potential ending point of the overlap between the two intervals.
    // This is the minimum of the two interval ending points.
    let overlapEnding = findMinimum(rangeOneEnd, rangeTwoEnd);

    // Compute the length of the calculated overlapping segment.
    let overlapLength = overlapEnding - overlapBeginning;

    // Evaluate if an actual positive overlap exists.
    if (overlapLength >= 0) {
        // If the overlap length is non-negative, display this length.
        displayOutput(overlapLength);
    } else if (overlapLength < 0) {
        // If the overlap length is negative, it implies no actual overlap; thus, display zero.
        displayOutput(0);
    }
};

// Obtain the necessary file system module using the helper function.
const fileSystemModule = retrieveModule('fs');

// Read the complete content from a specified input file path,
// assuming a 'utf-16' encoding for the file.
const fileContent = fileSystemModule.readFileSync('/app/input_source.txt', 'utf-16');

// Initiate the main program execution by passing the retrieved file content.
ExecuteProgram(fileContent);