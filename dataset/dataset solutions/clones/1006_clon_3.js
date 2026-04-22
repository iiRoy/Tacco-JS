const fileSystemUtility = require('fs');

// Global counter for tracking element exchanges during the sorting process.
// This variable is modified directly by the sorting function.
let totalSwapsPerformed = 0;

/**
 * A robust helper function to parse a string line into an array of integers.
 * It includes validation for the expected length and checks for non-numeric values.
 *
 * @param {string} line - The string containing space-separated numbers.
 * @param {number} expectedLength - The anticipated number of elements in the array.
 * @returns {Array<number>} An array of parsed integers.
 * @throws {Error} If the parsed array length does not match expected, or if non-numeric values are found.
 */
const parseIntegerArray = (line, expectedLength) => {
    // Split the line by spaces to get raw string values.
    const rawValues = line.trim().split(' ');

    // Type III: Add a validation step for array length.
    if (rawValues.length !== expectedLength) {
        throw new Error(`Input array length mismatch. Expected ${expectedLength} items, but received ${rawValues.length}.`);
    }

    // Map raw string values to integers, with individual validation.
    const parsedValues = rawValues.map(str => {
        const num = parseInt(str, 10); // Use radix 10 for explicit base.
        // Type III: Validate each parsed number.
        if (isNaN(num)) {
            throw new Error(`Detected an invalid number in the input list: '${str}'.`);
        }
        return num;
    });
    return parsedValues;
};

/**
 * Implements the Selection Sort algorithm to arrange elements of an array in ascending order.
 * This function sorts the array in-place and updates a global counter for element exchanges.
 *
 * @param {Array<number>} dataCollection - The array of numbers that needs to be sorted.
 * @param {number} collectionItemCount - The total number of elements currently in the dataCollection.
 */
function organizeElementsViaSelection(dataCollection, collectionItemCount) {
    // Type III: Guard clause for edge cases where sorting is unnecessary or impossible.
    if (!Array.isArray(dataCollection) || collectionItemCount <= 1) {
        // No sorting operations are required for empty or single-element arrays.
        // Or if the input is not a valid array.
        return;
    }

    // Outer loop: Iterates through each position in the array where the smallest element
    // from the unsorted part should eventually reside.
    // The loop runs up to 'collectionItemCount - 1' because the last element will
    // automatically be in its correct place after (N-1) passes.
    for (let currentSlotIndex = 0; currentSlotIndex < collectionItemCount - 1; currentSlotIndex++) {
        // Initialize the index of the minimum element for the current pass.
        // We assume the element at 'currentSlotIndex' is the smallest initially.
        let indexOfMinimalElement = currentSlotIndex;

        // Inner loop: Scans the remaining unsorted portion of the array
        // (starting from the element *after* currentSlotIndex)
        // to find the true smallest element's index.
        for (let comparisonIndex = currentSlotIndex + 1; comparisonIndex < collectionItemCount; comparisonIndex++) {
            // Compare the current element with the assumed minimal element.
            if (dataCollection[comparisonIndex] < dataCollection[indexOfMinimalElement]) {
                // If a smaller element is found, update the index of the minimal element.
                indexOfMinimalElement = comparisonIndex;
            }
        }

        // Type III: Rewritten conditional swap using array destructuring.
        // Only perform a swap if the smallest element found is actually different
        // from the element currently at 'currentSlotIndex'.
        // This preserves the original logic of only incrementing 'totalSwapsPerformed'
        // when a value-based difference necessitates a swap.
        if (dataCollection[currentSlotIndex] !== dataCollection[indexOfMinimalElement]) {
            // Exchange the elements at 'currentSlotIndex' and 'indexOfMinimalElement'.
            [dataCollection[currentSlotIndex], dataCollection[indexOfMinimalElement]] =
                [dataCollection[indexOfMinimalElement], dataCollection[currentSlotIndex]];

            // Increment the global counter for successful element exchanges.
            totalSwapsPerformed++;
        }
    }
}

// --- Main Program Execution Flow ---

// Read all input lines from standard input ('/dev/stdin') using Node.js 'fs' module.
// Type III: Added .trim() to each line to remove leading/trailing whitespace,
// and .filter() to remove any completely empty lines, making input more robust.
const allInputLines = fileSystemUtility.readFileSync('/dev/stdin', 'utf8')
                                        .split('\n')
                                        .map(line => line.trim())
                                        .filter(line => line.length > 0);

// Type III: Guard against insufficient input data.
if (allInputLines.length < 2) {
    console.error("Error: Not enough input lines provided. Expected at least two lines (count and data).");
    process.exit(1); // Terminate with an error status.
}

// Parse the first line to determine the expected count of elements.
const numberOfElements = parseInt(allInputLines[0], 10);

// Type III: Validate the parsed number of elements.
if (isNaN(numberOfElements) || numberOfElements < 0) {
    console.error(`Error: Invalid number of elements specified: '${allInputLines[0]}'. Must be a non-negative integer.`);
    process.exit(1);
}

// Parse the second line into an array of numbers using the helper function.
let numericDataArray;
try {
    numericDataArray = parseIntegerArray(allInputLines[1], numberOfElements);
} catch (error) {
    // Type III: Catch and report specific parsing errors.
    console.error(`Error processing the data array: ${error.message}`);
    process.exit(1);
}

// Execute the selection sort on the collected numeric data.
// The array 'numericDataArray' will be modified directly (in-place).
organizeElementsViaSelection(numericDataArray, numberOfElements);

// Output the sorted array elements, joined by a single space.
console.log(numericDataArray.join(' '));

// Output the final count of element swaps performed during the sorting process.
console.log(totalSwapsPerformed);