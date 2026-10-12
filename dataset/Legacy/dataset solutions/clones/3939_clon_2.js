"use strict";

// This function processes the provided input string.
function processInput(inputData) {
    // Split the input string by newline characters to get an array of lines.
    inputData = inputData.split("\n");

    // Parse the first two elements of the array as integers for the first segment.
    const firstSegment = parseInt(inputData.slice(0, 2));
    // Parse the last two elements of the array as integers for the second segment.
    const secondSegment = parseInt(inputData.slice(-2));
    
    // Calculate the minimum value from the first segment's parsed numbers.
    const minFirstCost = Math.min(...firstSegment);
    // Calculate the minimum value from the second segment's parsed numbers.
    const minSecondCost = Math.min(...secondSegment);
    
    // Output the sum of the minimum costs from both segments.
    console.log(minFirstCost + minSecondCost);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
