"use strict";

/*
 * This module processes incoming text data.
 * It identifies the second line, parses numbers, sorts them,
 * and then outputs the difference between the largest and smallest values.
 */
function processInput(inputData) {
    // Extract the relevant line, parse it into numbers, and sort them numerically.
    const sortedNumbers = inputData.split("\n")[1].split(" ").sort((val1, val2) => val1 - val2);

    // Calculate the range (difference between maximum and minimum) and print it.
    console.log(sortedNumbers[sortedNumbers.length - 1] - sortedNumbers[0]);
}

// Read data from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
