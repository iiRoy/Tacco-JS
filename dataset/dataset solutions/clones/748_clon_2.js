/*
 * This helper function processes a numerical value,
 * applying a specific transformation if it's a double-digit number.
 * It ensures the processed value remains within a certain range or pattern.
 */
function normalizeDigit(digitValue) {
    // Check if the input numerical value is 10 or greater.
    // This is a custom rule for digit manipulation.
    if (digitValue >= 10) {
        // If it meets the condition, modify it by subtracting 10 and adding 1.
        // For example, 10 becomes 1, 15 becomes 6, 19 becomes 10.
        digitValue = digitValue - 10 + 1;
    }
    // Return the resulting numerical value after potential transformation.
    return digitValue;
}

// Load the complete content of standard input as a string.
// This uses the Node.js file system module for synchronous reading.
var rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

// Pre-process the input string: remove leading/trailing whitespace,
// then split it into an array of individual lines.
var lineSegments = rawData.trim().split('\n');

// Extract the first line, convert it to an integer, and store it.
// This value represents a quantity, though it might not be used later.
var numCases = parseInt(lineSegments.shift(), 10);

// Take the next line from the input, split it into an array of characters,
// effectively creating a sequence of symbols or digits.
var digitPattern = lineSegments.shift().split('');

// A previous development step might have considered reversing the pattern,
// but this operation is commented out and not active in the final logic.
// digitPattern.reverse();

// Retrieve another numerical value from the input lines.
// This specific value appears to be unused in the subsequent calculations.
var anotherValue = Number(lineSegments.shift());

// Parse the next line as a space-separated list of numbers,
// converting each segment into an integer and storing them in an array.
var factorList = lineSegments.shift().split(' ').map(val => parseInt(val, 10));

// Initialize an empty array that will store specific factors derived from the pattern.
var patternFactors = [];

// Initialize a variable to accumulate a base sum based on certain input characters.
var initialSum = 0;

// Iterate through each character in the `digitPattern` array.
// This loop populates `patternFactors` and updates `initialSum`.
for (
    let idx = 0; // 'idx' serves as the current index in the pattern.
    idx < digitPattern.length; // The loop continues for the entire length of the pattern.
    idx++ // Increment the index for the next character.
) {
    // Get the character at the current index.
    const currentSymbol = digitPattern[idx];

    // Check if the current character is a special wildcard symbol.
    if (currentSymbol === '*') {
        // If it's a wildcard, a factor (1 or 2) is added to `patternFactors`
        // depending on whether the index is even or odd.
        if (idx % 2 === 0) {
            patternFactors.push(1); // Even indices get a factor of 1.
        } else {
            patternFactors.push(2); // Odd indices get a factor of 2.
        }
    } else {
        // If the character is not a wildcard, it's treated as a digit.
        // Its value is added to `initialSum`, with a potential transformation.
        if (idx % 2 === 0) {
            // For even indices, the digit's integer value is added directly.
            initialSum += parseInt(currentSymbol, 10);
        } else {
            // For odd indices, the digit's value is doubled,
            // then passed through the `normalizeDigit` function,
            // and the result is added to `initialSum`.
            initialSum += normalizeDigit(parseInt(currentSymbol, 10) * 2);
        }
    }
}

// Declare a 2D array that will serve as the dynamic programming table.
// This table is crucial for accumulating counts of possible sums.
var dynamicProgramTable = [];

// Initialize the DP table with dimensions based on `patternFactors` length and a max sum of 100.
// Each cell is set to zero initially.
for (let rowIdx = 0; rowIdx <= patternFactors.length; rowIdx++) {
    dynamicProgramTable[rowIdx] = []; // Create a new empty row for the table.
    for (let currentSumVal = 0; currentSumVal < 100; currentSumVal++) {
        dynamicProgramTable[rowIdx][currentSumVal] = 0; // Initialize each cell in the row to 0.
    }
}

// Set the base condition for the dynamic programming process:
// There is exactly one way to achieve a sum of 0 at the very beginning (no factors considered).
dynamicProgramTable[0][0] = 1;

// Begin the core dynamic programming calculation.
// This set of nested loops iterates through all combinations of factors and sums
// to populate the `dynamicProgramTable`.
for (
    let outerIdx = 0; // This index tracks the current pattern factor being considered.
    outerIdx < patternFactors.length; // Loop through each element in `patternFactors`.
    outerIdx++ // Move to the next pattern factor.
) {
    for (
        let innerIdx = 0; // This index tracks the current numerical factor from `factorList`.
        innerIdx < factorList.length; // Loop through each element in `factorList`.
        innerIdx++ // Move to the next numerical factor.
    ) {
        for (
            let dpSum = 0; // This index represents a possible sum achieved in the previous DP state.
            dpSum < 100; // Iterate through all possible sums up to 99 from the previous state.
            dpSum++ // Move to the next possible sum.
        ) {
            // Calculate the value that would be added to the current sum.
            // This is the product of a numerical factor and a pattern factor,
            // then normalized by the `normalizeDigit` function.
            const valueToAdd = normalizeDigit(factorList[innerIdx] * patternFactors[outerIdx]);

            // Update the dynamic programming table for the next state.
            // The count of ways to reach `dpSum` at `outerIdx` is added
            // to the cell corresponding to `outerIdx + 1` and the new total sum.
            // JavaScript's dynamic array resizing handles indices beyond 99;
            // these values are effectively ignored by the final summation loop.
            dynamicProgramTable[outerIdx + 1][dpSum + valueToAdd] += dynamicProgramTable[outerIdx][dpSum];
        }
    }
}

// Initialize a variable to store the final aggregated result.
var finalResult = 0;

// Iterate through the last row of the dynamic programming table (sums achieved
// after considering all pattern factors) to calculate the final answer.
for (let finalSumVal = 0; finalSumVal < 100; finalSumVal++) {
    // Check if the combination of the `initialSum` and the current `finalSumVal`
    // results in a total sum that is a multiple of 10.
    if ((initialSum + finalSumVal) % 10 === 0) {
        // If the condition is met, add the number of ways to achieve this `finalSumVal`
        // (as stored in the DP table) to the `finalResult`.
        finalResult += dynamicProgramTable[patternFactors.length][finalSumVal];
    }
}

// Print the computed `finalResult` to the console.
console.log(finalResult);