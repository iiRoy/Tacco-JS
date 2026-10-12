'use strict';

/*
 * This function processes incoming text data.
 * It splits the input into lines, extracts a numerical value from the first line,
 * and then iterates through a specific range of subsequent lines,
 * printing each one twice to the standard output.
 *
 * @param {string} rawTextContent - The complete string content received from the input source.
 */
const processInputData = (rawTextContent) => {
    // Divide the entire input string into an array of individual lines.
    rawTextContent = rawTextContent.split('\n');

    // Determine the count of relevant lines by parsing the first number
    // found on the initial line of the input.
    const firstLineValue = parseInt(rawTextContent[0].split(' ')[0]);

    // Create a new array containing only the lines that are relevant
    // based on the 'firstLineValue' extracted earlier.
    const relevantLines = rawTextContent.slice(1, firstLineValue + 1);

    // For each line identified as relevant, print it to the console two times.
    relevantLines.forEach(singleLine => {
        console.log(singleLine); // First output of the current line.
        console.log(singleLine); // Second output of the current line.
    });
};

// Execute the main processing function by reading the content
// from standard input using Node.js's file system module.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
