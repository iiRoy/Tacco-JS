'use strict'; // Enforce strict mode for the entire script.

// This function serves as the primary entry point for processing the input data.
const processInput = (rawData) => {
    // First, split the raw input string by newline characters to get individual lines.
    // Then, for each line, split it by space characters to get an array of string segments.
    const parsedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '));

    // Extract and parse the first three numerical values from the first line of input.
    // These values are converted to base-10 integers.
    const valAlpha = parseInt(parsedLines[0][0], 10); // Represents the first integer parameter.
    const valBeta = parseInt(parsedLines[0][1], 10);  // Represents the second integer parameter.
    const valXray = parseInt(parsedLines[0][2], 10);  // Represents the third integer parameter, often a target value.

    // Evaluate a specific logical condition based on the three parsed values.
    // The condition checks if 'valXray' is within the inclusive range [valAlpha, valAlpha + valBeta].
    if (valAlpha <= valXray && valAlpha + valBeta >= valXray) {
        console.log('YES'); // If the condition is true, print 'YES' to standard output.
    } else {
        console.log('NO');  // Otherwise, if the condition is false, print 'NO'.
    }
};

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is read as a UTF-8 encoded string and then passed to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
