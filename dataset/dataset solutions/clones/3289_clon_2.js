"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the character encoding for the input stream

let receivedInputData = ''; // Buffer to accumulate all incoming data
let processedInputSegments = ''; // Array to hold lines after splitting

process.stdin.on('data', function (incomingChunk) { // Event listener for 'data' chunks
    receivedInputData += incomingChunk; // Append current data chunk to the buffer
});

process.stdin.on('end', function () { // Event listener for 'end' of input
    processedInputSegments = receivedInputData.split('\n'); // Split buffer into individual lines
    performComputation(); // Initiate the main calculation logic
});

function performComputation() {
    // Extract the total count of items from the first line of input
    const totalItemsCount = Number.parseInt(processedInputSegments.shift());

    // Parse the sequence of numerical values from the second line
    let valueSequence = processedInputSegments[0].split(' ').map(Number);

    // Initialize a dynamic programming array to store minimum costs
    // Fill it with a very large number representing 'infinity' for unreached states
    const minimumCosts = Array(totalItemsCount).fill(Number.MAX_VALUE);

    // The cost to reach the very first element is always zero
    minimumCosts[0] = 0;

    // Iterate through each element to determine the optimal path costs
    for (let currentPosition = 0; currentPosition < totalItemsCount; currentPosition++) {
        // Evaluate possible jumps: one or two steps forward from the current position
        for (let nextPosition = currentPosition + 1;
             nextPosition < currentPosition + 3 && nextPosition < totalItemsCount;
             nextPosition++) {
            // Update the minimum cost to reach 'nextPosition'
            // Compare the currently stored cost with the cost from 'currentPosition'
            // plus the absolute difference (jump cost) between element values
            minimumCosts[nextPosition] = Math.min(
                minimumCosts[nextPosition],
                minimumCosts[currentPosition] + Math.abs(valueSequence[currentPosition] - valueSequence[nextPosition])
            );
        }
    }

    // Output the final calculated minimum cost to reach the last element of the sequence
    console.log(minimumCosts[totalItemsCount - 1]);
}