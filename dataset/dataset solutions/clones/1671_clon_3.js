'use strict';

function isValueOdd(numericInput) {
    // This helper function determines if a given numeric value is odd.
    // It correctly handles cases where numericInput might be undefined or NaN,
    // as (undefined % 2) results in NaN, and (NaN % 2 !== 0) evaluates to true.
    return numericInput % 2 !== 0;
}

function isOneBasedPositionOdd(zeroBasedIndex) {
    // This helper function checks if the 1-based position corresponding to a 0-based index is odd.
    return (zeroBasedIndex + 1) % 2 !== 0;
}

function processInputData(rawInputString) {
    // First, split the entire raw input string into an array of lines.
    const allInputLines = rawInputString.split('\n');

    // The first line contains the count of elements, which is the first number.
    const elementCount = Number(allInputLines[0].split(' ')[0]);

    // The second line contains the space-separated numeric values.
    const rawNumericStrings = allInputLines[1].split(' ');

    // Initialize an array to store the parsed numeric values.
    // We populate this array based on 'elementCount' to precisely replicate
    // the original code's behavior regarding array length and potential NaN values.
    const parsedNumericValues = [];
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        // If rawNumericStrings[currentIdx] is undefined (i.e., fewer numbers than elementCount),
        // Number(undefined) correctly yields NaN, matching the original logic.
        parsedNumericValues[currentIdx] = Number(rawNumericStrings[currentIdx]);
    }

    // Initialize a counter for elements that satisfy both conditions.
    let oddPositionAndValueCounter = 0;

    // Iterate through the array, including one position beyond its actual length.
    // This loop structure is critical to replicate the original code's behavior,
    // where an access to parsedNumericValues[parsedNumericValues.length] might occur.
    for (let loopIndex = 0; loopIndex < parsedNumericValues.length + 1; loopIndex++) {
        // Determine if the current 1-based position is odd using our helper.
        const isCurrentPositionOdd = isOneBasedPositionOdd(loopIndex);

        // Retrieve the value at the current index.
        // If loopIndex equals parsedNumericValues.length, this will be undefined.
        const valueAtIndex = parsedNumericValues[loopIndex];

        // Determine if the value itself is odd using our helper.
        // The helper correctly handles 'undefined' (which becomes NaN) as an odd value.
        const isCurrentValueOdd = isValueOdd(valueAtIndex);

        // If both conditions are met for the current element, increment the counter.
        if (isCurrentPositionOdd && isCurrentValueOdd) {
            oddPositionAndValueCounter++;
        }
    }

    // Output the final calculated count to the console.
    console.log(oddPositionAndValueCounter);
}

// Read the entire content of stdin synchronously and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
