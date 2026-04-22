import * as filesystem from 'fs'; // Import the file system module

// This section reads raw data from standard input, typically used in competitive programming.
let rawInputContent = filesystem.readFileSync('/dev/stdin', 'utf-8');

// Process the raw text: trim whitespace, split into lines, then split each line into individual characters,
// and finally convert each character to its numerical equivalent.
let numericGrid = rawInputContent
    .trim() // Remove leading/trailing whitespace from the entire input.
    .split('\n') // Divide the input string into an array of strings, one for each line.
    .map(currentLine => // For each line...
        currentLine.split('') // Split the line string into an array of single-character strings.
                   .map(charValue => parseInt(charValue, 10)) // Convert each character string to an integer.
    );


/**
 * Generates a new sequence of numbers from an existing one by summing adjacent elements.
 * Each sum's unit digit is retained.
 *
 * @param {number[]} sourceSequence - The input array of numbers.
 * @returns {number[]} A new array where each element is the unit digit of the sum of two adjacent elements from the input.
 */
function createDerivedSequence(sourceSequence) {
    let derivedNumbers = []; // Initialize an empty array to store the results.

    // Iterate through the input sequence, stopping one element before the end to allow for pairwise summing.
    for (let currentPosition = 0; currentPosition < sourceSequence.length - 1; ++currentPosition) {
        // Sum the current element and the next element.
        let pairSum = sourceSequence[currentPosition] + sourceSequence[currentPosition + 1];
        // Add the sum to the new array.
        derivedNumbers.push(pairSum);
    }
    // After generating all sums, map them to their unit digits (modulo 10).
    return derivedNumbers.map(total => total % 10);
}


/**
 * Recursively reduces an array of numbers until only a single number remains.
 * This is done by repeatedly applying the `createDerivedSequence` function.
 *
 * @param {number[]} digitCollection - The array of digits to reduce.
 * @returns {number} The single digit resulting from the reduction process.
 */
function reduceArrayToSingle(digitCollection) {
    // Base case: if the array contains only one element, return that element.
    if (digitCollection.length === 1) {
        return digitCollection[0];
    }
    // Recursive step: generate a new sequence and call the function again with the new sequence.
    else {
        // Generate the next level of the sequence using the helper function.
        let nextIterationArray = createDerivedSequence(digitCollection);
        // Recursively call this function with the newly generated array.
        return reduceArrayToSingle(nextIterationArray);
    }
}


// Apply the reduction process to each row of numbers in the numeric grid.
// This generates a final single digit for every initial sequence.
let finalResultDigits = numericGrid.map(numberRow => reduceArrayToSingle(numberRow));

// Output the array of final single digits to the console.
console.log(finalResultDigits);