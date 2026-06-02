"use strict";

function processInput(inputString) {
    // This section handles the initial parsing of the input string.
    // It splits the entire input into an array of individual lines.
    const lineData = inputString.split("\n");

    // The first line indicates the total number of elements to process.
    // We store this value, allowing JavaScript's implicit type coercion for comparison later.
    let numElements = lineData[0];

    // An empty array is initialized to store the numeric values from subsequent lines.
    const numberCollection = [];

    // A loop iterates from the second line (index 1) up to the number of elements specified.
    // Each line is pushed into our collection array.
    for (let currentLineIndex = 1; currentLineIndex <= numElements; currentLineIndex++) {
        numberCollection.push(lineData[currentLineIndex]);
    }

    // The following loop iterates through each element in the `numberCollection`.
    // For each iteration, one element is temporarily removed, and the maximum of the remaining is found.
    for (let iterationIndex = 0; iterationIndex < numberCollection.length; iterationIndex++) {
        // A temporary copy of the original number collection is created.
        // This ensures the original array remains unchanged for subsequent iterations.
        const temporaryCollection = numberCollection.slice();

        // The element at the current `iterationIndex` is removed from the temporary copy.
        // The `splice` method modifies the array in place.
        temporaryCollection.splice(iterationIndex, 1);

        // The maximum value among the remaining elements in the `temporaryCollection` is calculated.
        // `Math.max.apply(null, array)` is used to find the maximum in an array.
        // The result is then printed to the console.
        console.log(Math.max.apply(null, temporaryCollection));
    }
}

// The main execution point of the script.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
// This string is then passed to the `processInput` function for processing.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
