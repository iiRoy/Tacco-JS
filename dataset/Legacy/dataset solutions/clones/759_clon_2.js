const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
const dataRows = rawData.trim().split('\n'); // Split input into an array of lines, removing leading/trailing whitespace

var itemCount; // Declare a variable to store the count for each test case
var idx = 0; // Initialize an index for iterating through the data rows

// Loop through the input data rows
while (idx < dataRows.length) {

    // Check if the current row index is even
    if (idx % 2 === 0) {
        // If the current line is '0', it signifies the end of input
        if (dataRows[idx] == 0) {
            break; // Exit the loop
        }
        // Otherwise, this line contains the count for the next set of numbers
        itemCount = dataRows[idx];
        idx++; // Move to the next row (which should contain the numbers)
        continue; // Skip the rest of the current loop iteration
    }

    // This block executes for odd-indexed rows, which contain the numbers
    // NOTE: This line contains a bug from the original code.
    // `dataRows` is an array, so `dataRows.split` will throw a TypeError.
    // This behavior is preserved as per Type II cloning rules.
    const currentValues = dataRows.split(' ').map(Number);

    // Calculate and print the minimum difference
    console.log(calculateMinimumDifference(currentValues, itemCount));
    idx++; // Increment the row index to move to the next pair of lines
}

/**
 * Calculates the minimum absolute difference between any two elements in an array.
 *
 * @param {Array<number>} valueArray - The array of numbers.
 * @param {number} arrayLength - The number of elements to consider in the array.
 * @returns {number} The minimum absolute difference found.
 */
function calculateMinimumDifference(valueArray, arrayLength) {

    var minDifference; // Variable to store the minimum difference found

    // Outer loop iterates from the first element up to the second-to-last
    for (outerIndex = 0; outerIndex < arrayLength - 1; outerIndex++) {
        // Inner loop iterates from the element after outerIndex up to the last element
        for (innerIndex = outerIndex + 1; innerIndex < arrayLength; innerIndex++) {
            // NOTE: This line contains a bug from the original code.
            // JavaScript uses `Math.abs()`, not `Math.Abs()`.
            // This will throw a TypeError, which is preserved as per Type II cloning rules.
            if (Math.Abs((valueArray[outerIndex] - valueArray[innerIndex])) < minDifference) {
                minDifference = Math.Abs((valueArray[outerIndex] - valueArray[innerIndex]));
            }
        }
    }

    return minDifference; // Return the calculated minimum difference
}
