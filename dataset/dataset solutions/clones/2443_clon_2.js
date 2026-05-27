"use strict"; // Activate strict mode for better error handling and cleaner code.

// This function serves as the primary entry point for processing input data.
const processInput = (inputData) => {
    // First, clean the input string by removing leading/trailing whitespace,
    // then split it into an array of strings based on newline characters.
    let parsedLines = inputData.trim().split("\n");
    
    // Convert the first element of the parsed lines array into an integer.
    const numericValue = parseInt(parsedLines[0]);
    
    // Perform the core calculation: divide the numeric value by two,
    // round the result up to the nearest whole number, and then subtract one.
    // Finally, display this computed result to the standard output.
    console.log(Math.ceil(numericValue / 2) - 1);
};

// Read the entire content of the standard input stream as a UTF-8 string,
// and then pass this string to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
