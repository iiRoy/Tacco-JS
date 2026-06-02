"use strict";

// Initialize standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer for accumulating raw input data
let rawInputBuffer = '';
// Array to store input lines after splitting
let lineSegments = '';

// Event listener for incoming data chunks
process.stdin.on('data', function (incomingDataChunk) {
    rawInputBuffer += incomingDataChunk; // Append new data to the buffer
});

// Event listener for the end of input stream
process.stdin.on('end', function () {
    lineSegments = rawInputBuffer.split('\n'); // Split the accumulated data into lines
    initiateCalculation(); // Begin the main processing logic
});

/**
 * Main function to perform the calculation based on processed input.
 */
function initiateCalculation() {
    // Parse the first line as the number of elements
    const elementCount = parseInt(lineSegments.shift(), 10);

    // Parse the second line into an array of numbers
    let valueSequence = lineSegments[0].split(' ').map(Number);

    // Initialize a dynamic programming table with a large value (Infinity)
    const dynamicProgrammingTable = Array(elementCount).fill(Infinity);

    // The cost to reach the first element is 0
    dynamicProgrammingTable[0] = 0;

    // Iterate through each element in the sequence
    for (let currentPosition = 0; currentPosition < elementCount; currentPosition++) {
        // Consider jumps to the next one or two elements
        for (let nextPosition = currentPosition + 1;
             nextPosition < currentPosition + 3 && nextPosition < elementCount;
             nextPosition++) {
            // Calculate the cost to jump from currentPosition to nextPosition
            // and update the minimum cost if a shorter path is found
            dynamicProgrammingTable[nextPosition] = Math.min(
                dynamicProgrammingTable[nextPosition],
                dynamicProgrammingTable[currentPosition] + Math.abs(valueSequence[currentPosition] - valueSequence[nextPosition])
            );
        }
    }

    // Output the minimum cost to reach the last element
    console.log(dynamicProgrammingTable[elementCount - 1]);
}
