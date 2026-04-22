const fileSystem = require('fs'); // Renamed 'fs' module for clarity
const standardInputPath = '/dev/stdin'; // Extracted the standard input path to a constant

// Function to read raw input data from the specified source
// Type II: Renamed 'input' to 'rawInputData', added a descriptive comment.
// Type III: Wrapped input reading in a function for modularity (minor).
const readInputData = (path) => fileSystem.readFileSync(path, 'utf8');

let rawInputData = readInputData(standardInputPath);

// Type II: Renamed 'arr' to 'inputLines', changed 'var' to 'let'.
// Type III: Added an explicit guard clause for handling empty or invalid input.
if (!rawInputData || rawInputData.trim().length === 0) {
    console.log(-1); // Indicate no solution if input is missing
    process.exit(0); // Terminate execution gracefully
}

let inputLines = rawInputData.trim().split("\n");

// Type II: Renamed 'a' to 'originalSequence', changed 'var' to 'const'.
// Type III: Explicitly removed the unused 'n' variable (which was `arr.shift()-0`).
// The length is derived directly from the parsed sequence.
const elementsLine = inputLines.shift();
const originalSequence = elementsLine.split(" ").map(Number);
const sequenceSize = originalSequence.length; // Storing array length for future loops

// Create a sorted reference sequence from a copy of the original.
// Type II: Renamed 'b' to 'sortedReferenceSequence', used spread operator for cloning.
const sortedReferenceSequence = [...originalSequence].sort((itemA, itemB) => itemA - itemB);

// Parse the number of operations/queries.
// Type II: Renamed 'q' to 'operationCount', used `parseInt` with radix for robustness.
const operationCountString = inputLines.shift();
const operationCount = parseInt(operationCountString, 10);

// Parse the list of swap instructions. Each instruction is a pair of 0-based indices.
// Type II: Renamed 'xy' to 'swapInstructions', used clearer variable names in map callback.
// Type III: Removed the `xy.unshift([0,0])` call. The loop structure will now explicitly
// handle the initial state check before any operations.
const swapInstructions = inputLines.map(line =>
    line.split(" ").map(Number).map(val => val - 1)
);

// --- Initialize Mismatch Tracking Maps ---
// These Maps will store elements that are not in their sorted positions.
// Keys are the original indices, values are the numbers themselves.
// Type II: Renamed 'A' to 'activeDifferencesMap', 'B' to 'targetDifferencesMap'.
// Type III: Switched from plain JavaScript objects `{}` to `Map` objects.
const activeDifferencesMap = new Map();
const targetDifferencesMap = new Map();

// Populate the difference maps by comparing the original and sorted sequences.
for (let currentIdx = 0; currentIdx < sequenceSize; currentIdx++) {
    if (originalSequence[currentIdx] !== sortedReferenceSequence[currentIdx]) {
        activeDifferencesMap.set(currentIdx, originalSequence[currentIdx]);
        targetDifferencesMap.set(currentIdx, sortedReferenceSequence[currentIdx]);
    }
}

// --- Generate Target Signature for Comparison ---
// Create a string representation of the target state (sorted mismatched elements).
// This string serves as the goal that `activeDifferencesMap` needs to match.
// Type II: Renamed 'BB' to 'targetMismatchSignature'.
// Type III: Used `Array.from(map.values()).join('')` for string construction,
// which is a more modern and explicit way to concatenate map values.
const targetMismatchSignature = Array.from(targetDifferencesMap.values()).join('');

// --- Initial State Check (Type III addition) ---
// Before any swaps, check if the initial configuration of `activeDifferencesMap`
// already matches the target. This covers the case where the answer is 0.
const currentActiveSignature = Array.from(activeDifferencesMap.values()).join('');
if (currentActiveSignature === targetMismatchSignature) {
    console.log(0); // Array is already in a solvable state or perfectly sorted
    process.exit(0);
}

// --- Main Simulation Loop ---
// Iterates through each operation, applies the swap, and checks if the
// `activeDifferencesMap` now matches the `targetDifferencesMap`.
// Type II: Renamed 'flag' to 'solutionFound', 'i' to 'operationCounter'.
let solutionFound = false;
let foundAtOperationIndex = -1; // Stores the 1-based index of the operation that solved it

// The loop runs for each actual operation, from 1 to `operationCount`.
for (let operationCounter = 1; operationCounter <= operationCount; operationCounter++) {
    // Retrieve the indices for the current swap instruction.
    // Type III: Adjusted index to `operationCounter - 1` because `swapInstructions`
    // no longer contains a dummy element at index 0.
    const [idxA, idxB] = swapInstructions[operationCounter - 1];

    // Retrieve the values associated with these indices from the active differences map.
    // If a key is not present, `get()` returns `undefined`.
    const valueAtIdxA = activeDifferencesMap.get(idxA);
    const valueAtIdxB = activeDifferencesMap.get(idxB);

    // --- Perform the swap on `activeDifferencesMap` ---
    // This logic precisely replicates the behavior of `[obj[k1], obj[k2]] = [obj[k2], obj[k1]]`
    // for `Map` objects, handling cases where keys might not exist (i.e., value is `undefined`).
    // Type III: Replaced direct destructuring with explicit `Map.set` and `Map.delete` calls
    // for verbosity and clear handling of `undefined` values.
    if (valueAtIdxB !== undefined) {
        activeDifferencesMap.set(idxA, valueAtIdxB);
    } else {
        activeDifferencesMap.delete(idxA); // If valueAtIdxB is undefined, idxA should no longer have a value
    }

    if (valueAtIdxA !== undefined) {
        activeDifferencesMap.set(idxB, valueAtIdxA);
    } else {
        activeDifferencesMap.delete(idxB); // If valueAtIdxA is undefined, idxB should no longer have a value
    }

    // Reconstruct the current signature of active differences after the swap.
    // Type II: Renamed 'AA' to 'currentMismatchSignature'.
    // Type III: Used `Array.from(map.values()).join('')` for string construction.
    const updatedActiveSignature = Array.from(activeDifferencesMap.values()).join('');

    // Check if the current state of active differences matches the target state.
    if (updatedActiveSignature === targetMismatchSignature) {
        solutionFound = true;
        foundAtOperationIndex = operationCounter; // Store the 1-based operation index
        break; // Exit the loop as the solution has been found
    }
}

// --- Output the Final Result ---
// Type II: Renamed 'flag' to 'solutionFound', 'i' to 'foundAtOperationIndex'.
if (solutionFound) {
    console.log(foundAtOperationIndex);
} else {
    console.log(-1); // Indicate no solution found after all operations
}