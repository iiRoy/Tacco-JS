const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Helper function to parse a line as an integer
const parseIntegerLine = (lineContent) => parseInt(lineContent, 10);

// Helper function to parse a line as an array of numbers
const parseNumberArrayLine = (lineContent) => lineContent.split(" ").map(Number);

let lineData = rawData.trim().split("\n");

// Extract initial parameters from the input lines
const elementCount = parseIntegerLine(lineData.shift()); // Corresponds to 'n'
const originalArray = parseNumberArrayLine(lineData.shift()); // Corresponds to 'a'
const queryCount = parseIntegerLine(lineData.shift()); // Corresponds to 'q'

// Prepare swap indices. The first entry [0,0] represents the initial state before any actual swaps.
// This allows checking the initial array state at opIdx = 0.
const rawSwapIndices = lineData.map(val => val.split(" ").map(Number).map(idx => idx - 1));
const swapOperations = [[0, 0], ...rawSwapIndices]; // Prepend the no-op for initial check

// Create a sorted version of the original array for comparison
const sortedArray = [...originalArray].sort((valX, valY) => valX - valY);

// Helper function to build a map of elements that are *not* in their sorted position.
// This map only stores entries for indices where originalArr[idx] !== sortedArr[idx].
const buildMismatchMap = (sourceArr, targetSortedArr) => {
    const mismatchTracker = {};
    for (let idx = 0; idx < sourceArr.length; idx++) {
        if (sourceArr[idx] !== targetSortedArr[idx]) {
            mismatchTracker[idx] = sourceArr[idx];
        }
    }
    return mismatchTracker;
};

// Initialize the map that will be modified by swaps. It tracks the current values at mismatched positions.
let currentMismatchMap = buildMismatchMap(originalArray, sortedArray);

// Initialize the target map, which contains the *correct* sorted values for the initially mismatched positions.
const targetMismatchValuesMap = buildMismatchMap(sortedArray, sortedArray); // This will contain b[i] for original a[i] != b[i]
// The original code's B was `B[i]=b[i]` if `a[i]!=b[i]`.
// So, `targetMismatchValuesMap` should store `sortedArray[idx]` for `idx` where `originalArray[idx] !== sortedArray[idx]`.
// Let's re-implement `targetMismatchValuesMap` more directly to match `B` from the original.
const buildTargetValuesForMismatchedPositions = (initialArr, sortedArr) => {
    const targetValues = {};
    for (let idx = 0; idx < initialArr.length; idx++) {
        if (initialArr[idx] !== sortedArr[idx]) {
            targetValues[idx] = sortedArr[idx];
        }
    }
    return targetValues;
};
const targetCorrectValuesMap = buildTargetValuesForMismatchedPositions(originalArray, sortedArray);
const targetMismatchValuesString = Object.values(targetCorrectValuesMap).join(",");

let foundMatch = false;
let resultQueryIndex = -1; // Default output if no match is found

// Iterate through all swap operations, including the initial state (opIdx = 0)
for (let opIdx = 0; opIdx < swapOperations.length; opIdx++) {
    const currentSwapPair = swapOperations[opIdx];
    const firstSwapIndex = currentSwapPair[0];
    const secondSwapIndex = currentSwapPair[1];

    // Perform the swap on the currentMismatchMap.
    // This correctly handles cases where an index might not exist in the map (value is undefined).
    const tempValueAtFirstIndex = currentMismatchMap[firstSwapIndex];
    currentMismatchMap[firstSwapIndex] = currentMismatchMap[secondSwapIndex];
    currentMismatchMap[secondSwapIndex] = tempValueAtFirstIndex;

    // Generate a string representation of the current values in the mismatch map for comparison.
    const currentMismatchValuesString = Object.values(currentMismatchMap).join(",");

    // Check if the current state of mismatched values matches the target sorted state.
    if (currentMismatchValuesString === targetMismatchValuesString) {
        foundMatch = true;
        resultQueryIndex = opIdx; // Store the 0-indexed query number that resulted in a sorted state.
        break; // Exit the loop as soon as a match is found.
    }
}

// Output the final result
console.log(resultQueryIndex);
