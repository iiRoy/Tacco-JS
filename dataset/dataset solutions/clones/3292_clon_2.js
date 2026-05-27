'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section contains utility functions for array operations.

/**
 * Determines the largest numerical value within a given array.
 * @param {number[]} inputArray - The array of numbers to search through.
 * @returns {number} The maximum value found in the array.
 */
const findMaximum = (inputArray) => {
    let idx = inputArray.length; // Initialize index with array length
    let currentMaxVal = -Infinity; // Start with the smallest possible number
    // Iterate backwards through the array
    while (idx--) {
        // If the current element is greater than the recorded maximum, update it
        if (inputArray[idx] > currentMaxVal) {
            currentMaxVal = inputArray[idx];
        }
    }
    return currentMaxVal; // Return the highest value
};

/**
 * Determines the smallest numerical value within a given array.
 * @param {number[]} inputArray - The array of numbers to search through.
 * @returns {number} The minimum value found in the array.
 */
const findMinimum = (inputArray) => {
    let idx = inputArray.length; // Initialize index with array length
    let currentMinVal = Infinity; // Start with the largest possible number
    // Iterate backwards through the array
    while (idx--) {
        // If the current element is smaller than the recorded minimum, update it
        if (inputArray[idx] < currentMinVal) {
            currentMinVal = inputArray[idx];
        }
    }
    return currentMinVal; // Return the lowest value
};

/**
 * Processes the input data to calculate minimum costs based on height differences.
 * This function implements a dynamic programming approach similar to the "Frog Jump" problem.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
const processInputData = (rawData) => {
    // Split the input string into an array of lines
    let lines = rawData.split("\n");

    // Parse the first line to get the number of elements (N)
    let numElements = parseInt(lines[0]);

    // Parse the second line to get the array of heights
    // It splits by space and converts each part to a number
    let heightsArr = (lines[1].split(" ").map(Number));

    // Initialize a cost array with a size of N, filled with a large value (Infinity)
    // This array will store the minimum cost to reach each position
    let costArray = new Array(numElements).fill(Infinity);

    // Output the initial heights array for debugging or verification
    console.log(heightsArr);

    // Base cases for the cost array
    // Cost to reach the first position (index 0) is 0
    costArray[0] = 0;
    // Cost to reach the second position (index 1) is the absolute difference between h[0] and h[1]
    costArray[1] = Math.abs(heightsArr[0] - heightsArr[1]);

    // Iterate from the third position (index 2) up to N-1
    for (let loopCounter = 2; loopCounter < numElements; loopCounter++) {
        // Calculate the cost to reach the current position (loopCounter)
        // This is the minimum of two options:
        // 1. Jumping from two steps back (loopCounter - 2) + cost of that jump
        // 2. Jumping from one step back (loopCounter - 1) + cost of that jump
        let costFromTwoStepsBack = costArray[loopCounter - 2] + Math.abs(heightsArr[loopCounter] - heightsArr[loopCounter - 2]);
        let costFromOneStepBack = costArray[loopCounter - 1] + Math.abs(heightsArr[loopCounter] - heightsArr[loopCounter - 1]);
        costArray[loopCounter] = Math.min(costFromTwoStepsBack, costFromOneStepBack);
    }

    // Output the complete cost array and the minimum cost to reach the last position (N-1)
    console.log(costArray, costArray[numElements - 1]);
};

// The following line reads input from standard input, trims it, and passes it to the main processing function.
// This part should not be modified as it handles the standard I/O mechanism.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
