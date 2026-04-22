// Define operational parameters for the script
const systemOptions = {
    // fileSource: 'temp_input.txt', // For Windows-like systems
    fileSource: '/dev/stdin',      // Standard input for Unix/Linux environments
    lineSeparator: '\n'            // Newline character for parsing input
};

// Retrieve content from the specified input source
// and divide it into an array of strings based on the line separator.
const rawDataLines = require('fs')
    .readFileSync(systemOptions.fileSource, 'ascii')
    .split(systemOptions.lineSeparator, 2); // Read at most two lines

// Parse the second line of the input into an array of numbers.
// This assumes the input numbers are space-separated.
const elementList = rawDataLines[1].split(' ').map(Number);

// Execute the partitioning algorithm on the numerical array.
// The function rearranges elements such that all elements less than
// the pivot are to its left, and greater elements to its right.
const pivotPointIndex = arrangeAroundPivot(elementList, 0, elementList.length);

// Highlight the pivot element in the array for output.
elementList[pivotPointIndex] = '[' + elementList[pivotPointIndex] + ']';

// Display the modified array elements joined by spaces.
console.log(elementList.join(' '));

/**
 * Implements a variant of the Hoare partition scheme.
 * This function selects the last element as the pivot,
 * then rearranges the subarray elements around this pivot.
 *
 * @param {Array<number>} targetCollection - The array to be partitioned.
 * @param {number} startIdx - The starting index of the subarray (inclusive).
 * @param {number} endIdx - The ending index of the subarray (exclusive).
 * @returns {number} The final index of the pivot element after partitioning.
 */
function arrangeAroundPivot(targetCollection, startIdx, endIdx)
{
    let pivotVal, leftPtr, scanIdx, tempSwap; // Declare local variables

    // Choose the last element of the subarray as the pivot value
    pivotVal = targetCollection[endIdx - 1];

    // Initialize the pointer for the "less than pivot" section
    leftPtr = startIdx;

    // Iterate through the subarray, excluding the pivot itself
    for (scanIdx = startIdx + 1; scanIdx < endIdx - 1; scanIdx++)
    {
        // If the current element is less than or equal to the pivot
        if (targetCollection[scanIdx] <= pivotVal)
        {
            // Perform a swap to move the element to the left partition
            tempSwap = targetCollection[leftPtr];
            targetCollection[leftPtr] = targetCollection[scanIdx];
            targetCollection[scanIdx] = tempSwap;
            leftPtr++; // Advance the left pointer
        }
    }

    // Place the pivot element in its correct sorted position
    tempSwap = targetCollection[leftPtr];
    targetCollection[leftPtr] = targetCollection[endIdx - 1];
    targetCollection[endIdx - 1] = tempSwap;

    // Return the final index of the pivot
    return leftPtr;
}