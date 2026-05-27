'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Buffer to store incoming standard input data
let dataBuffer = '';
// Index to track the current line being read from the buffer
let lineIndex = 0;

// Event listener for 'data' on standard input
process.stdin.on('data', incomingData => {
    dataBuffer += incomingData; // Append new data to the buffer
});

// Event listener for 'end' on standard input
process.stdin.on('end', () => {
    // Split the accumulated data into an array of lines
    dataBuffer = dataBuffer.split('\n');
    // Initiate the main execution flow of the application
    executeProgram();
});

/**
 * Retrieves the next line from the buffered input.
 * @returns {string} The next line of input.
 */
function fetchLine() {
    return dataBuffer[lineIndex++]; // Return current line and increment index
}

/**
 * Computes the maximum possible score given a total capacity and arrays of item weights and values.
 * This function implements a dynamic programming approach similar to a knapsack problem.
 *
 * @param {number} totalCapacity - The maximum capacity.
 * @param {number[]} itemWeights - An array of weights for different items.
 * @param {number[]} itemValues - An array of values corresponding to the items.
 * @returns {number} The maximum score achievable within the given capacity.
 */
function calculateMaxScore(totalCapacity, itemWeights, itemValues) {
    // Initialize a DP table to store maximum scores for capacities from 0 to totalCapacity
    let memoTable = Array(totalCapacity + 1).fill(0);

    // Iterate through each possible capacity from 0 up to the totalCapacity
    for (let currentWeight = 0; currentWeight <= totalCapacity; currentWeight++) {
        let currentMaxValue = currentWeight; // Initialize max value for currentWeight with currentWeight itself

        // Iterate through each of the three available items
        for (let itemIdx = 0; itemIdx < 3; itemIdx++) {
            // Check if the current capacity is sufficient to include the current item
            if (currentWeight >= itemWeights[itemIdx]) {
                // Calculate a candidate value by adding the current item's value
                // to the max value achievable with the remaining capacity
                let candidateValue = memoTable[currentWeight - itemWeights[itemIdx]] + itemValues[itemIdx];

                // Update the current maximum value if the candidate value is greater
                if (currentMaxValue < candidateValue) {
                    currentMaxValue = candidateValue;
                }
            }
        }
        // Store the determined maximum value for the current capacity in the DP table
        memoTable[currentWeight] = currentMaxValue;
    }
    // The final result is the maximum value achievable for the totalCapacity
    return memoTable[totalCapacity];
}

/**
 * The primary function that orchestrates the program's logic.
 * Reads input, performs calculations, and prints the final result.
 */
function executeProgram() {
    // Read the initial capacity from input and parse it as an integer
    const initialCapacity = parseInt(fetchLine(), 10);

    // Read the first set of weights, split by space, and parse as integers
    const firstWeights = fetchLine().split(' ').map(val => parseInt(val, 10));

    // Read the first set of values, split by space, and parse as integers
    const firstValues = fetchLine().split(' ').map(val => parseInt(val, 10));

    // Calculate the first intermediate result using initial capacity, first weights, and first values
    let resultOne = calculateMaxScore(initialCapacity, firstWeights, firstValues);

    // Calculate the final result using the first intermediate result as new capacity,
    // and swapping the roles of first values and first weights
    let finalResult = calculateMaxScore(resultOne, firstValues, firstWeights);

    // Output the final calculated result to the console
    console.log(finalResult);
}
