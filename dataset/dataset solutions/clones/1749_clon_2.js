let fileSystemModule = require('fs'); // Module to interact with the file system.

let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Reads the entire content from standard input.

let contentLines = rawInputContent.split('\n'); // Divides the input into an array of strings, one for each line.

// The first numerical value on the first line, often representing a total count, is extracted but not utilized further.
let initialDatasetSize = Number(contentLines.shift());

// The second line contains space-separated numbers, which are parsed into an array of numerical values.
let numericalDataset = contentLines.shift().split(' ').map(function(numAsString){
    // Converts each string representation of a number into an actual number.
    return Number(numAsString);
});

// The third line provides the total quantity of operations that need to be executed.
let totalOperations = Number(contentLines.shift());

contentLines.pop(); // Removes the last element from the array, which is typically an empty string due to a trailing newline.

/**
 * This function is designed to incrementally sum two numerical values.
 * @param {number} currentAccumulation - The accumulated sum so far.
 * @param {number} itemToAdd - The number to be added to the accumulation.
 * @returns {number} The updated sum after addition.
 */
function accumulateValues (currentAccumulation, itemToAdd) {
    currentAccumulation += itemToAdd; // Performs the addition operation.
    return currentAccumulation;       // Returns the new total.
}

// These global variables store the target value for replacement and its substitute.
let valueToFind;
let valueToSubstitute;

/**
 * A transformation function that checks if an input number matches a predefined target.
 * If a match is found, it returns a substitute value; otherwise, it returns the original number.
 * @param {number} originalNumber - The number to be evaluated for replacement.
 * @returns {number} Either the replacement value or the original number.
 */
function applyValueTransform(originalNumber) {
    if (originalNumber === valueToFind) { // Compares the number with the target value.
        return valueToSubstitute;         // Returns the replacement if a match occurs.
    } else {
        return originalNumber;            // Returns the original number if no match.
    }
}

let currentRunningSum = 0; // Initializes a variable to keep track of the sum of the numerical dataset.

// This loop processes each operation defined in the input.
for (let opIndex = 0; opIndex < totalOperations; opIndex++) {

    let operationParameters = contentLines[opIndex].split(' '); // Splits the current operation line into its constituent parts.

    // Extracts the target value and ensures it's an integer.
    valueToFind = Number(operationParameters[0]) | 0;
    // Extracts the replacement value and ensures it's an integer.
    valueToSubstitute = Number(operationParameters[1]) | 0;

    // An optimization: if the current sum is already positive and the target value isn't present
    // in the dataset, then performing the replacement operation would not change the sum.
    // In such cases, the current sum can be printed directly, and the loop continues to the next operation.
    if (currentRunningSum > 0 && numericalDataset.indexOf(valueToFind) === -1) {
        console.log(currentRunningSum); // Outputs the sum without any changes.
        continue;                       // Skips the rest of the current iteration.
    }

    // Applies the transformation function to every element in the numerical dataset.
    numericalDataset = numericalDataset.map(applyValueTransform);

    // Recalculates the total sum of the dataset after potential modifications.
    currentRunningSum = numericalDataset.reduce(accumulateValues, 0);

    console.log(currentRunningSum); // Prints the updated sum to the console.
}