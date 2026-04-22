// Global accumulator for comparison operations
let operationCounter = 0;

/**
 * Initiates the data processing pipeline: reads input, sorts, and prints results.
 */
(function initiateDataProcessing() {
    // Acquire file system module for input operations
    const fileSystemModule = require('fs');

    // Read all input lines from standard input, trim whitespace, and split by newline.
    const inputLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

    // Validate input lines existence to prevent errors on empty input.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        // Exit with an error code to indicate failure in processing.
        process.exit(1);
    }

    // Extract the total number of elements from the first line.
    // Using parseInt with radix 10 for explicit conversion.
    const expectedElementCount = parseInt(inputLines.shift(), 10);

    // Parse the second line into an array of numbers.
    // This section is rewritten to be more explicit, demonstrating Type III changes.
    let numericCollection = [];
    const rawNumberStrings = inputLines.shift().split(' ');

    // Iterate through the raw strings, converting each to a number.
    for (let currentNumStr of rawNumberStrings) {
        // Perform the conversion and a basic check for validity.
        const parsedValue = Number(currentNumStr);
        if (!isNaN(parsedValue)) {
            numericCollection.push(parsedValue);
        } else {
            // Log a warning for any non-numeric data encountered.
            console.warn(`Warning: Skipping non-numeric input detected: '${currentNumStr}'`);
        }
    }

    // Add a guard clause to check if the actual number of elements matches the declared count.
    if (numericCollection.length !== expectedElementCount) {
        console.warn(`Warning: Declared element count was ${expectedElementCount}, but found ${numericCollection.length} actual elements.`);
        // For this clone, we proceed with the actual length but keep the warning.
    }

    // Perform the recursive sorting procedure on the entire collection.
    // The range is from index 0 up to (but not including) the collection's length.
    performRecursiveSort(numericCollection, 0, numericCollection.length);

    // Output the sorted elements, joined by a single space, as per typical competitive programming format.
    console.log(numericCollection.join(' '));

    // Display the total number of comparison operations performed during the sort.
    console.log(operationCounter);
})();

/**
 * Merges two sorted sub-arrays back into a single sorted array segment.
 * This is a fundamental utility function for the merge sort algorithm.
 * @param {Array<number>} targetArray The array containing the segments to be merged.
 * @param {number} startIdx The starting index of the first segment (inclusive).
 * @param {number} middleIdx The ending index of the first segment (exclusive) and starting index of the second (inclusive).
 * @param {number} endIdx The ending index of the second segment (exclusive).
 */
function combineSortedSegments(targetArray, startIdx, middleIdx, endIdx) {
    // Define a sentinel value to simplify the merging logic, avoiding explicit boundary checks.
    const sentinelValue = Number.POSITIVE_INFINITY; // Using a named constant for Infinity.

    // Create copies of the left and right sub-arrays.
    // This involves slicing the original array.
    let leftSubArray = targetArray.slice(startIdx, middleIdx);
    let rightSubArray = targetArray.slice(middleIdx, endIdx);

    // Append the sentinel value to the end of each temporary sub-array.
    // This ensures that one array will always "run out" first, leaving the other's elements to be copied directly.
    leftSubArray.push(sentinelValue);
    rightSubArray.push(sentinelValue);

    // Initialize cursors for iterating through the left and right sub-arrays.
    let leftCursor = 0;
    let rightCursor = 0;

    // Iterate through the portion of the original array that needs to be filled.
    // Rewritten from a 'for' loop to a 'while' loop to demonstrate a Type III structural change.
    let currentWriteIndex = startIdx;
    while (currentWriteIndex < endIdx) {
        // Fetch the current elements from both sub-arrays for comparison.
        // Introduced temporary variables for clarity (Type III addition).
        const leftElement = leftSubArray[leftCursor];
        const rightElement = rightSubArray[rightCursor];

        // Compare the elements and place the smaller one into the target array.
        if (leftElement <= rightElement) {
            targetArray[currentWriteIndex] = leftElement;
            // Explicitly increment the left cursor.
            leftCursor = leftCursor + 1;
        } else {
            targetArray[currentWriteIndex] = rightElement;
            // Increment the right cursor using a different syntax for variety.
            rightCursor += 1;
        }
        // Increment the global counter for each comparison operation performed.
        operationCounter++;
        // Move to the next position in the target array.
        currentWriteIndex++;
    }
}

/**
 * Recursively sorts a portion of an array using the merge sort algorithm.
 * This function implements the "divide and conquer" strategy.
 * @param {Array<number>} dataCollection The array to be sorted.
 * @param {number} lowerBound The starting index of the segment to sort (inclusive).
 * @param {number} upperBound The ending index of the segment to sort (exclusive).
 */
function performRecursiveSort(dataCollection, lowerBound, upperBound) {
    // Type III: Add a guard clause for invalid boundary conditions.
    // This ensures robustness against incorrect function calls.
    if (lowerBound < 0 || upperBound > dataCollection.length || lowerBound > upperBound) {
        console.error(`Error: Invalid segment bounds provided for sorting: ` +
                      `lowerBound=${lowerBound}, upperBound=${upperBound}, arrayLength=${dataCollection.length}`);
        return; // Exit early if bounds are invalid.
    }

    // Base case for the recursion: If the segment contains 0 or 1 element, it's already sorted.
    // The condition is rewritten for clarity, focusing on the segment size (Type III rewrite).
    const segmentSize = upperBound - lowerBound;
    if (segmentSize <= 1) {
        return;
    }

    // Calculate the midpoint to divide the current array segment into two halves.
    // This calculation method is less prone to overflow with extremely large numbers (Type III rewrite).
    const divisionPoint = Math.floor(lowerBound + (upperBound - lowerBound) / 2);

    // Recursively sort the left half of the segment.
    performRecursiveSort(dataCollection, lowerBound, divisionPoint);

    // Recursively sort the right half of the segment.
    performRecursiveSort(dataCollection, divisionPoint, upperBound);

    // After both halves are sorted, merge them back together.
    combineSortedSegments(dataCollection, lowerBound, divisionPoint, upperBound);
}