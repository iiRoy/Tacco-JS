const fileSystemModule = require('node:fs');

// --- Input Processing Section ---
// Read raw data from standard input, ensuring UTF-8 encoding.
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' });

// Split the raw input into individual lines, removing any leading/trailing whitespace from the whole string.
const dataLines = rawInputData.trim().split('\n');

// A basic guard clause to ensure we have at least two lines of input.
// The first line is typically metadata (like N, the count of numbers) which we implicitly ignore
// by directly accessing the second line for the actual numbers.
if (dataLines.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least two lines.");
    process.exit(1); // Terminate execution with an error code.
}

// Extract the string containing space-separated numbers, which is expected on the second line.
const numericValuesString = dataLines[1];

// Parse the string into an array of integers.
// Includes validation for non-numeric entries and trims each string value before parsing.
const initialNumericList = numericValuesString.split(' ').map(strVal => {
    const trimmedVal = strVal.trim();
    const parsedNumber = parseInt(trimmedVal, 10); // Always specify radix for parseInt.

    // Validate if the parsed value is a valid number.
    if (isNaN(parsedNumber)) {
        console.error(`Error: Invalid numeric value encountered in input: '${trimmedVal}'`);
        process.exit(1); // Terminate execution.
    }
    return parsedNumber;
});

// Create a mutable copy of the list to be sorted.
let targetArrayForSorting = [...initialNumericList];

// --- Sorting Algorithm (Selection Sort) ---
/**
 * Sorts an array of numbers using the Selection Sort algorithm and counts the total number of swaps.
 * @param {number[]} collection - The array of numbers to be sorted.
 * @returns {{sortedData: number[], totalExchanges: number}} An object containing the sorted array
 *          and the count of swap operations performed.
 */
function sortAndCountSwaps(collection) {
    let currentSwapCount = 0;
    const collectionLength = collection.length;

    // Outer loop: Iterates through each position in the array.
    // The last element doesn't need to be checked as it will naturally be in place.
    for (let currentPosition = 0; currentPosition < collectionLength - 1; ++currentPosition) {
        // Assume the current element is the minimum in the unsorted part of the array.
        let potentialMinimumElementIndex = currentPosition;

        // Inner loop: Finds the actual minimum element in the remaining unsorted portion.
        // It starts from the element *after* the currentPosition to avoid redundant checks.
        for (let comparisonPosition = currentPosition + 1; comparisonPosition < collectionLength; ++comparisonPosition) {
            // If a smaller element is found, update the index of the minimum element.
            if (collection[comparisonPosition] < collection[potentialMinimumElementIndex]) {
                potentialMinimumElementIndex = comparisonPosition;
            }
        }

        // If the minimum element found is not at the current position, a swap is necessary.
        if (potentialMinimumElementIndex !== currentPosition) {
            // Perform the swap using array destructuring for conciseness.
            [collection[currentPosition], collection[potentialMinimumElementIndex]] =
            [collection[potentialMinimumElementIndex], collection[currentPosition]];
            currentSwapCount++; // Increment the counter for successful swaps.
        }
    }
    // Return an object containing both the sorted array and the swap count.
    return { sortedData: collection, totalExchanges: currentSwapCount };
}

// Execute the sorting function on our target array.
const sortResult = sortAndCountSwaps(targetArrayForSorting);

// --- Output Section ---
// Display the final sorted sequence of numbers, joined by a space.
console.log(sortResult.sortedData.join(' '));

// Display the total number of swap operations performed during the sorting process.
console.log(sortResult.totalExchanges);