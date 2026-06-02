'use strict';

// This function processes the raw input data
const processInputData = (rawContent) => {
    // Trim whitespace and split the content into an array of lines
    const processedLines = rawContent.trim().split("\n");

    // Evaluate the first line as a JavaScript expression and print the result
    console.log(eval(processedLines[0]));
};

// Read the standard input synchronously and pass it to the processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
