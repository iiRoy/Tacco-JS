"use strict";

/**
 * Processes the input data to calculate a specific mathematical result.
 * This function reads two integers, N and K, from the input and computes
 * a sum based on these values and their divisors.
 *
 * @param {string} inputData - The raw string content read from standard input.
 */
const processInput = (inputData) => {
    // Trim leading/trailing whitespace and split the input into lines.
    // We only expect one line for this problem.
    inputData = inputData.trim().split("\n");

    // Parse the first line to extract the two integer parameters.
    // The parameters are space-separated on the first line.
    const parameters = inputData[0].split(" ");
    const upperBound = parseInt(parameters[0], 10); // Represents 'N' from the problem description.
    const divisorThreshold = parseInt(parameters[1], 10); // Represents 'K' from the problem description.
    
    // Initialize a variable to store the cumulative sum.
    let finalResult = 0;
    
    // Handle a special edge case where the threshold 'K' is zero.
    // In this specific scenario, the result is simply N * N.
    if (divisorThreshold === 0) {
        console.log(upperBound * upperBound);
        return; // Exit the function early as the calculation is complete.
    }
    
    // Iterate through all possible divisors, from 1 up to 'upperBound' (N).
    for (let currentDivisor = 1; currentDivisor <= upperBound; currentDivisor++) {
        // Calculate the contribution to the total sum from full multiples of 'currentDivisor'.
        // This part accounts for (N / currentDivisor) * max(0, currentDivisor - K).
        finalResult += Math.floor(upperBound / currentDivisor) * Math.max(0, currentDivisor - divisorThreshold);
        
        // If there's a remainder when 'upperBound' is divided by 'currentDivisor',
        // it means there's a partial block of numbers to consider.
        if (upperBound % currentDivisor > 0) {
            // Calculate the contribution from this partial block.
            // This part accounts for max(0, (N % currentDivisor) - K + 1).
            finalResult += Math.max(0, (upperBound % currentDivisor) - divisorThreshold + 1);
        }
    }
    
    // Output the final calculated result to the console.
    console.log(finalResult);
};

// Read the entire content of standard input synchronously and
// then pass it to the 'processInput' function for computation.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
