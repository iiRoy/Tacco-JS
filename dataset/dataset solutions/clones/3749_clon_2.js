"use strict";

/**
 * This module processes a single line of input containing two space-separated integers.
 * It then outputs a number based on specific conditions related to the first integer.
 * The output consists of the second integer followed by a certain number of zeros.
 *
 * @param {string} inputData - The raw string content read from standard input.
 */
const executeLogic = (inputData) => {
    // Normalize the input string by removing leading/trailing whitespace
    // and splitting it into an array of lines.
    const inputLines = inputData.trim().split("\n");

    // Extract the first line, which contains the two numeric parameters.
    const firstLineTokens = inputLines[0].split(" ");

    // Parse the first token as the 'depth' parameter.
    const depthParam = parseInt(firstLineTokens[0], 10);
    // Parse the second token as the 'number' parameter.
    const numberParam = parseInt(firstLineTokens[1], 10);

    // The original code contained commented-out lines for an array 'temp'.
    // These non-executable comments are not included in the clone.

    // Conditional logic to determine the output based on 'depthParam'.
    // Each condition handles a specific 'depthParam' value and prints 'numberParam'
    // concatenated with a specific string of zeros.
    if (depthParam === 0) {
        // If depth is zero, simply print the number parameter.
        console.log(numberParam);
        return; // Terminate function execution.
    }

    if (depthParam === 1) {
        // If depth is one, append two zeros to the number parameter.
        console.log(numberParam + "00");
        return; // Terminate function execution.
    }

    if (depthParam === 2) {
        // If depth is two, append four zeros to the number parameter.
        console.log(numberParam + "0000");
        return; // Terminate function execution.
    }
    // No explicit handling for other 'depthParam' values,
    // implying they are not expected or result in no output.
};

// Read the entire content from standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass this content to the main processing function.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
