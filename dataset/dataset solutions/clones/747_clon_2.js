/*
 * This module processes input data to compute a specific numerical result.
 * It involves reading from standard input, parsing various data types,
 * and performing calculations using a dynamic programming approach.
 */

// Function to adjust a numerical value based on a threshold.
// If the input value is 10 or greater, it undergoes a specific transformation.
function adjustNumber(inputValue) {
    if (inputValue >= 10) { // Check if the value exceeds the threshold of ten
        inputValue = inputValue - 10 + 1; // Apply the transformation logic: subtract 10, then add 1
    }
    return inputValue; // Return the potentially modified numerical value
}

/*
 * Main execution block:
 * This section orchestrates the reading of data, its processing,
 * and the computation of the final answer based on specific rules.
 */
var fileSystem = require('node:fs'); // Import the Node.js file system module for synchronous operations.
var rawInputData = fileSystem.readFileSync('/dev/fd/0', 'utf-8'); // Read all data from standard input as a UTF-8 string.

// Split the raw input into an array of lines, first trimming any leading/trailing whitespace.
var inputLineSegments = rawInputData.trim().split('\n');

// Extract the first integer from the input array, representing a primary count.
var totalItemCount = parseInt(inputLineSegments.shift(), 10); // Use parseInt for explicit base-10 conversion

// Extract the next line and split it into an array of individual characters for sequence processing.
var characterSequence = inputLineSegments.shift().split('');

// Extract another integer constant from the input, used in subsequent calculations.
var initialNumericConstant = parseInt(inputLineSegments.shift(), 10); // Explicit base-10 conversion

// Extract the next line, split it by spaces, and convert all resulting parts to numbers.
var numericValueList = inputLineSegments.shift().split(' ').map(Number); // Map directly to the Number constructor

// Initialize an array to store dynamically calculated factors.
var factorCollection = [];
// Initialize a variable to accumulate a running sum based on character processing.
var cumulativeTotal = 0;

// Iterate through the character sequence to populate factors and calculate an initial part of the sum.
characterSequence.forEach(function(currentSymbol, currentPosition) {
    // If the current character is an asterisk, determine its factor based on its positional parity.
    if (currentSymbol === '*') {
        if (currentPosition % 2 === 0) { // If the position is even (0, 2, 4...)
            factorCollection.push(1); // Add factor 1 to the collection
        } else { // If the position is odd (1, 3, 5...)
            factorCollection.push(2); // Add factor 2 to the collection
        }
    } else { // If the character is a digit (not an asterisk)
        if (currentPosition % 2 === 0) { // If the position is even
            cumulativeTotal += parseInt(currentSymbol, 10); // Add the digit's value directly to the sum
        } else { // If the position is odd
            // Convert digit to number, multiply by 2, and then apply the adjustment function before adding to sum.
            cumulativeTotal += adjustNumber(parseInt(currentSymbol, 10) * 2);
        }
    }
});

// Initialize a 2D array for dynamic programming computations.
// The dimensions are determined by the count of factors and a fixed maximum sum (100).
var dynamicProgrammingGrid = [];
for (var rowIdx = 0; rowIdx <= factorCollection.length; rowIdx++) {
    dynamicProgrammingGrid[rowIdx] = []; // Initialize each row as an empty array
    for (var colIdx = 0; colIdx < 100; colIdx++) {
        dynamicProgrammingGrid[rowIdx][colIdx] = 0; // Populate all cells with zero initially
    }
}

// Set the base case for the dynamic programming table:
// There is one way to achieve a sum of 0 at the initial state (before processing any factors).
dynamicProgrammingGrid[0][0] = 1;

// Perform the core dynamic programming calculation.
// This involves iterating through each factor, then through each numeric value,
// and finally through all possible intermediate sums.
for (var factorIndex = 0; factorIndex < factorCollection.length; factorIndex++) {
    for (var valueIndex = 0; valueIndex < numericValueList.length; valueIndex++) {
        for (var currentSumValue = 0; currentSumValue < 100; currentSumValue++) {
            // Update the DP table: calculate a new sum by applying the adjustment function
            // to the product of a numeric value and a factor, then add the ways from the previous state.
            dynamicProgrammingGrid[factorIndex + 1][currentSumValue + adjustNumber(numericValueList[valueIndex] * factorCollection[factorIndex])] += dynamicProgrammingGrid[factorIndex][currentSumValue];
        }
    }
}

// Calculate the final count of valid combinations that meet the criteria.
var finalResultCount = 0;
// Iterate through all possible sums in the last row of the DP table.
for (var finalSumCandidate = 0; finalSumCandidate < 100; finalSumCandidate++) {
    // Check if the combined total (cumulative sum + current DP sum candidate) is perfectly divisible by 10.
    if ((cumulativeTotal + finalSumCandidate) % 10 === 0) {
        // If the divisibility condition is met, add the number of ways to achieve this sum to the final result.
        finalResultCount += dynamicProgrammingGrid[factorCollection.length][finalSumCandidate];
    }
}

// Output the computed final result to the console.
console.log(finalResultCount);