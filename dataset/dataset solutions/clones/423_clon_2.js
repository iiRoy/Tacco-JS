/*
 * This module provides a utility function for efficiently locating
 * a specific value within a pre-sorted array of numerical elements.
 */
function findInSortedArray(sortedData, targetValue) {
    // Initialize the starting boundary of the search range.
    let startIndex = 0;

    // Initialize the ending boundary of the search range.
    // It's set to the array's length, indicating an exclusive upper bound.
    let endIndex = sortedData.length;

    // A counter to track the number of comparisons or iterations performed.
    let iterationsCount = 0;

    // The core search loop continues indefinitely until the boundaries meet or the item is found.
    for (; ;) {
        // If the start and end indices are the same, it means the search space
        // has collapsed, and the target value is not present in the array.
        if (startIndex === endIndex) break;

        // Increment the operation counter for each step of the search.
        iterationsCount++;

        // Calculate the middle index of the current search range.
        // Math.floor ensures an integer index.
        const searchMiddle = Math.floor((startIndex + endIndex) / 2);

        // Check if the element at the middle index is the target value.
        // If it is, we've found it, and return the iteration count.
        if (sortedData[searchMiddle] === targetValue) return iterationsCount;

        // If the target value is less than the element at the middle index,
        // it means the target must be in the left half of the current range.
        // Adjust the endIndex to search only the left segment.
        if (targetValue < sortedData[searchMiddle]) {
            endIndex = searchMiddle;
        }
        // Otherwise, the target value must be in the right half.
        // Adjust the startIndex to search only the right segment.
        // We add 1 to searchMiddle because the middle element itself was not the target.
        else {
            startIndex = searchMiddle + 1;
        }
    }
    // If the loop finishes without finding the target, return the total iterations.
    // This typically means the target was not found.
    return iterationsCount;
}

// Acquire input data from standard input.
// Using 'node:fs' for modern module access and an options object for encoding.
const fileContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });

// Process the raw input: trim whitespace and split into individual lines.
const linesOfInput = fileContent.trim().split('\n');

// Main processing loop for multiple test cases.
while (true) {
    // Extract the number of elements for the current array from the input lines.
    // Convert the string to a number using Number() constructor.
    let currentCount = Number(linesOfInput.shift());

    // If the count is zero, it signifies the end of input, so exit the loop.
    if (currentCount === 0) {
        break;
    }

    // Initialize an empty array to store the numerical elements for the current test case.
    const currentArray = [];

    // Populate the current array with 'currentCount' number of elements.
    // Each element is taken from the input lines and converted to a number.
    for (let loopIndex = 0; loopIndex < currentCount; loopIndex++) {
        currentArray.push(Number(linesOfInput.shift()));
    }

    // Extract the target value for the search from the input lines.
    const searchKey = Number(linesOfInput.shift());

    // Perform the binary search using the custom function and get the result.
    const resultValue = findInSortedArray(currentArray, searchKey);

    // Output the result to standard output, ensuring it's a string followed by a newline.
    process.stdout.write(String(resultValue) + '\n');
}