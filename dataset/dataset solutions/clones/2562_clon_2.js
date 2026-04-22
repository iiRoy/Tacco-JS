'use strict';
// This function processes an array of text lines to perform specific numerical operations.
const processInputData = rawLinesOfText => {
    // Parse the first line to get two integer parameters.
    // The first parameter represents an initial count, though not directly used in the main loop logic.
    const initialValueCount = parseInt(rawLinesOfText[0].split(' ')[0], 10);
    // The second parameter specifies the number of times a reduction operation should be performed.
    const operationRepetitions = parseInt(rawLinesOfText[0].split(' ')[1], 10);

    // Convert the second line of input into an array of numbers.
    let numericDataSet = rawLinesOfText[1].split(' ').map(stringFragment => parseInt(stringFragment, 10));

    // Iterate a specified number of times to modify the numerical data set.
    for (let currentIteration = 0; currentIteration < operationRepetitions; currentIteration++) {
        // Find the index of the maximum element within the current numerical data set.
        // Math.max.apply(null, array) is used to find the maximum value from an array.
        const indexOfLargest = numericDataSet.indexOf(Math.max.apply(null, numericDataSet));
        // Halve the value at the found index, rounding down to the nearest integer.
        numericDataSet[indexOfLargest] = Math.floor(numericDataSet[indexOfLargest] / 2);
    }

    // Calculate the sum of all elements remaining in the modified numerical data set.
    // The reduce method iterates through the array, accumulating the sum.
    console.log(numericDataSet.reduce((partialSum, itemValue) => partialSum + itemValue));
};

// Execute the main processing function with input read from standard input.
// The input is read as a UTF-8 string, then split into an array of lines.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));