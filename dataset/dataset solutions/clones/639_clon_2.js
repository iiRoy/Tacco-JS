var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is split into an array of lines.
var dataLines = fileContent.trim().split("\n");

// The first line contains two numbers, 'n' and 'm', separated by a space.
// These are extracted, converted to numbers, and stored in 'dimensionsArray'.
var dimensionsArray = dataLines.shift().split(" ").map(Number);

// 'numItemsD' corresponds to 'n' from the problem description.
var numItemsD = dimensionsArray[0];
// 'numItemsC' corresponds to 'm' from the problem description.
var numItemsC = dimensionsArray[1];

// 'itemValuesD' will store 'n' numeric values.
var itemValuesD = [];
// Populate 'itemValuesD' by taking the next 'n' lines from 'dataLines'.
for (var outerLoopIndex = 0; outerLoopIndex < numItemsD; outerLoopIndex++) {
    // The '- 0' is a concise way to convert a string to a number.
    itemValuesD.push(dataLines.shift() - 0);
}

// 'itemCostsC' will store 'm' numeric values.
var itemCostsC = [];
// Populate 'itemCostsC' by taking the next 'm' lines from 'dataLines'.
for (var outerLoopIndex = 0; outerLoopIndex < numItemsC; outerLoopIndex++) {
    itemCostsC.push(dataLines.shift() - 0);
}

// Initialize a 2D array for dynamic programming, named 'memoizationTable'.
var memoizationTable = [];

// Fill the 'memoizationTable' with 'Infinity' as initial values.
// The table dimensions are (numItemsC + 1) by (numItemsD + 1).
for (var outerLoopIndex = 0; outerLoopIndex <= numItemsC; outerLoopIndex++) {
    memoizationTable[outerLoopIndex] = [];
    for (var innerLoopIndex = 0; innerLoopIndex <= numItemsD; innerLoopIndex++) {
        memoizationTable[outerLoopIndex][innerLoopIndex] = Infinity;
    }
}

// Set the base case for the DP problem: the cost to achieve nothing is zero.
memoizationTable[0][0] = 0;

// Begin the main dynamic programming calculation.
// The outer loop iterates through the 'itemCostsC' array.
for (var outerLoopIndex = 0; outerLoopIndex < numItemsC; outerLoopIndex++) {
    // Store the current cost value for easier access.
    var currentCostValue = itemCostsC[outerLoopIndex];

    // The inner loop iterates through the 'itemValuesD' array.
    for (var innerLoopIndex = 0; innerLoopIndex < numItemsD; innerLoopIndex++) {
        // Store the current data value.
        var currentDataValue = itemValuesD[innerLoopIndex];

        // This line in the original code attempts to use 'k' (renamed to 'stepOffset')
        // before it is declared and initialized in the subsequent loop.
        // Due to JavaScript's 'var' hoisting, 'stepOffset' will be 'undefined' here,
        // leading to a TypeError when attempting to access 'memoizationTable[outerLoopIndex + undefined]'.
        // This behavior is preserved as per Type II cloning rules.
        memoizationTable[outerLoopIndex + stepOffset][innerLoopIndex] = Math.min(
            memoizationTable[outerLoopIndex + stepOffset][innerLoopIndex],
            memoizationTable[outerLoopIndex][innerLoopIndex]
        );

        // This loop calculates possible transitions based on 'stepOffset'.
        for (var stepOffset = 1; outerLoopIndex + stepOffset + numItemsD - innerLoopIndex + 1 <= numItemsC; stepOffset++) {
            // Update the DP table: find the minimum cost to reach the current state.
            memoizationTable[outerLoopIndex + stepOffset][innerLoopIndex + 1] = Math.min(
                memoizationTable[outerLoopIndex + stepOffset][innerLoopIndex + 1],
                memoizationTable[outerLoopIndex][innerLoopIndex] + currentCostValue * currentDataValue
            );
        }
    }
}

// Print the final result, which is the minimum cost stored at memoizationTable[numItemsC][numItemsD].
console.log(memoizationTable[numItemsC][numItemsD]);
