// This script processes input data to determine if a sequence can be sorted
// by a series of swaps, considering only elements that are initially out of place.

// Import the file system module for reading standard input.
const fileSystem = require('fs');

// Read all input from /dev/stdin, assuming UTF-8 encoding.
let rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the input into lines and remove any leading/trailing whitespace.
let inputLines = rawInputData.trim().split('\n');

// The first line contains the total number of elements, converted to a number.
let totalElementsCount = parseInt(inputLines.shift(), 10);

// The second line contains the initial sequence of numbers.
// Split by space, then convert each part to a number.
let initialSequence = inputLines.shift().split(' ').map(Number);

// Create a sorted version of the initial sequence for comparison.
// Use slice() to create a shallow copy before sorting to avoid modifying the original.
let correctlyOrderedSequence = initialSequence.slice().sort((valueA, valueB) => valueA - valueB);

// The next line contains the number of swap queries.
let numberOfQueries = parseInt(inputLines.shift(), 10);

// Parse the remaining lines as swap operations.
// Each line has two indices (0-based), which are then adjusted to be 0-based.
let swapOperationsList = inputLines.map(lineStr =>
    lineStr.split(' ').map(Number).map(val => val - 1)
);

// Prepend a dummy operation [0,0] at the beginning.
// This aligns the loop indexing with the original logic.
swapOperationsList.unshift([0, 0]);

// Objects to store elements that are in different positions in the initial and sorted sequences.
// Keys are indices, values are the numbers at those indices.
let currentMismatchedElements = {};
let targetMismatchedElements = {};

// Populate the mismatch objects.
// Iterate through the initial sequence to find elements that are not in their sorted positions.
for (let elementIndex = 0; elementIndex < initialSequence.length; elementIndex++) {
    if (initialSequence[elementIndex] !== correctlyOrderedSequence[elementIndex]) {
        currentMismatchedElements[elementIndex] = initialSequence[elementIndex];
        targetMismatchedElements[elementIndex] = correctlyOrderedSequence[elementIndex];
    }
}

// Get the count of initial mismatches.
let initialMismatchCount = Object.keys(currentMismatchedElements).length;

// Concatenate the values of the target mismatched elements into a string.
// This string represents the "sorted" state of only the mismatched elements.
let targetMismatchString = '';
for (let key in targetMismatchedElements) {
    targetMismatchString += targetMismatchedElements[key];
}

// Flag to indicate if a match is found after any swap operation.
let isMatchAchieved = false;

// Iterate through each swap operation, including the dummy one at index 0.
for (let operationIdx = 0; operationIdx <= numberOfQueries; operationIdx++) {
    // Perform the swap on the `currentMismatchedElements` object.
    // Note: This swaps values at the specified indices, even if the indices
    // are not currently keys in the object. If a key doesn't exist, its value is undefined.
    let firstSwapIndex = swapOperationsList[operationIdx][0];
    let secondSwapIndex = swapOperationsList[operationIdx][1];

    // Use array destructuring for a concise swap.
    [
        currentMismatchedElements[firstSwapIndex],
        currentMismatchedElements[secondSwapIndex]
    ] = [
        currentMismatchedElements[secondSwapIndex],
        currentMismatchedElements[firstSwapIndex]
    ];

    // After the swap, reconstruct the string of current mismatched elements.
    let currentMismatchString = '';
    for (let propertyKey in currentMismatchedElements) {
        currentMismatchString += currentMismatchedElements[propertyKey];
    }

    // Check if the current state of mismatched elements matches the target sorted state.
    if (currentMismatchString === targetMismatchString) {
        isMatchAchieved = true;
        // If a match is found, we can stop processing further swaps.
        break;
    }
}

// Output the result based on the analysis.
if (initialMismatchCount === 0) {
    // If there were no initial mismatches, the sequence was already sorted.
    console.log(0);
} else if (isMatchAchieved) {
    // If a match was achieved after some swaps, output the index of the operation
    // that led to the match.
    console.log(operationIdx); // 'operationIdx' retains its value from the loop's last iteration.
} else {
    // If no match was ever achieved.
    console.log(-1);
}
