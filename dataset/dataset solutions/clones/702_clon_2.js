/*
 * This program reads numerical data from standard input, processes it
 * in blocks, and calculates an adjusted average for each block.
 * The core logic involves parsing numbers, sorting, removing extremes,
 * and then finding the floor of the average.
 */

// Acquire the file system module from Node.js standard library.
var initialContent = require('fs')
    .readFileSync(
        '/sys/input', // Path to the standard input file descriptor.
        'UTF-8'       // Specify the character encoding for reading.
    )
    .trim(); // Remove leading and trailing whitespace from the raw input string.

// Process the acquired content:
// 1. Split the string into an array of individual lines, using CRLF as separator.
// 2. Map each line string to its numerical representation.
var numericRows = initialContent.split('\r\n').map(
    function (elementString) {
        return Number(elementString); // Convert string to number.
    }
);

// Declare a variable to hold the size of the current data set.
var currentSetSize;

// Main loop: continues as long as a non-zero size is extracted from the numeric data stream.
while (currentSetSize = numericRows.shift()) {

    // If the extracted size is zero, it's a termination signal.
    if (currentSetSize === 0x0) { /* Using a hexadecimal literal for zero */
        break; // Exit the processing loop immediately.
    }

    // Initialize an empty array to store the scores for the current iteration.
    var scoreCollection = [];

    // Populate the scoreCollection with 'currentSetSize' number of elements
    // taken sequentially from the beginning of the numericRows array.
    for (var loopIndex = 0; loopIndex < currentSetSize; loopIndex = loopIndex + 1) {
        scoreCollection.push(numericRows.shift());
    }

    // Sort the collected scores in ascending order.
    scoreCollection.sort(function (firstElement, secondElement) {
        // Comparison function for numerical sorting.
        return firstElement - secondElement;
    });

    // Remove the smallest score (the first element after sorting).
    scoreCollection.shift();
    // Remove the largest score (the last element after sorting).
    scoreCollection.pop();

    // Calculate the total sum of the remaining scores using the reduce method.
    var totalValue = scoreCollection.reduce(function (previousSum, currentElement) {
        return previousSum + currentElement; // Summation logic.
    });

    // Calculate the final average:
    // Divide the total sum by the count of remaining scores.
    // Use Math.floor to get the integer part of the average.
    // Output this result to the console.
    console.log(Math.floor(totalValue / scoreCollection.length));
}