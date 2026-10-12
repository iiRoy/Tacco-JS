var operationCount; // Global counter for swap operations

/**
 * Performs an insertion sort on a sub-array with a specified gap.
 * This is a helper function for Shell Sort.
 * @param {Array<number>} dataArray The array to be sorted.
 * @param {number} arraySize The total number of elements in the array.
 * @param {number} gapValue The gap between elements to be compared.
 */
function gapInsertionSort(dataArray, arraySize, gapValue) {
    // Iterate through the array starting from the gap
    for (var idx = gapValue; idx < arraySize; idx++) {
        var currentElement = dataArray[idx]; // Element to be inserted
        var innerIdx = idx - gapValue;       // Position for comparison

        // Shift elements that are larger than currentElement to the right
        while (innerIdx >= 0 && dataArray[innerIdx] > currentElement) {
            dataArray[innerIdx + gapValue] = dataArray[innerIdx]; // Move element
            innerIdx = innerIdx - gapValue;                       // Move to the next comparison position
            operationCount++;                                     // Increment operation counter
        }
        // Place the currentElement in its correct sorted position
        dataArray[innerIdx + gapValue] = currentElement;
    }
}

/**
 * Implements the Shell Sort algorithm using a 2^k - 1 gap sequence.
 * @param {Array<number>} inputArray The array of numbers to be sorted.
 * @param {number} inputLength The number of elements in the array.
 */
function performShellSort(inputArray, inputLength) {
    operationCount = 0; // Reset the global counter for this sort operation

    var gapSequence = []; // Array to store the generated gap sequence
    // Generate the gap sequence (2^k - 1)
    for (var loopCounter = 1; Math.pow(2, loopCounter) - 1 <= inputLength; loopCounter++) {
        gapSequence.push(Math.pow(2, loopCounter) - 1);
    }
    gapSequence.reverse(); // Reverse to get gaps in decreasing order
    var numGaps = gapSequence.length; // Number of gaps used

    // Apply insertion sort for each gap in the sequence
    for (var gapIndex = 0; gapIndex < numGaps; gapIndex++) {
        gapInsertionSort(inputArray, inputLength, gapSequence[gapIndex]);
    }

    // Output results as specified
    console.log(numGaps);
    console.log(gapSequence.join(' '));
    console.log(operationCount);
    // Print each element of the sorted array on a new line
    for (var outputIndex = 0; outputIndex < inputLength; outputIndex++) {
        console.log(inputArray[outputIndex]);
    }
}

// --- Input Processing ---
// Read input from standard input
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into individual lines
var inputLines = rawData.split('\n');
// The first line is the count of elements
var dataCount = inputLines.shift();

// Convert remaining lines (which are numbers) from strings to actual numbers
inputLines = inputLines.map(function(itemString) {
    return itemString - 0; // A quick way to convert string to number
});

// Execute the shell sort with the processed input
performShellSort(inputLines, dataCount);
