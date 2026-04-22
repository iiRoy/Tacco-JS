(function processAndSortData(rawInputString) {
    // Split the entire input string into individual lines for easier parsing.
    const inputLines = rawInputString.split('\n');

    // Extract the first line, which is expected to be the count of numbers.
    // Use optional chaining and a default empty string to prevent errors if the line is missing.
    const expectedElementCountStr = inputLines.shift() || '';
    // Convert the string count to an integer, specifying radix 10 for safety.
    const expectedElementCount = parseInt(expectedElementCountStr, 10);

    // Validate the expected count. If it's not a positive number, handle this edge case.
    if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
        // For invalid or missing count, output an empty line for the array and zero swaps,
        // mimicking the result of sorting an empty list without erroring out.
        console.log("");
        console.log("0");
        return; // Exit early as there's nothing valid to sort.
    }

    // Extract the second line, which contains the space-separated numbers to be sorted.
    const numberStringData = inputLines.shift() || '';

    // Parse the numbers from the string:
    // 1. Split by one or more whitespace characters (`/\s+/`) for robustness.
    // 2. Filter out any empty strings that might result from multiple spaces.
    // 3. Convert each string element to a number using `map(Number)`.
    // 4. Use `slice(0, expectedElementCount)` to ensure we only process the number of elements
    //    specified by the first input line, even if more numbers are present on the second line.
    const initialNumericValues = numberStringData
        .split(/\s+/)
        .filter(Boolean)
        .map(Number)
        .slice(0, expectedElementCount);

    // Call the primary sorting routine with the prepared array of numbers.
    // The sorting function itself will handle printing the results to standard output.
    performOptimizedBubbleSort(initialNumericValues);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from the standard input stream.

/**
 * Sorts an array of numbers using an optimized bubble sort algorithm.
 * This function modifies the input array in place and then logs the sorted array
 * (space-separated) and the total number of swaps performed during the sort.
 *
 * @param {number[]} dataCollection - The array of numbers that needs to be sorted.
 */
function performOptimizedBubbleSort(dataCollection) {
    let totalSwaps = 0; // Initialize a counter for tracking the total number of element exchanges.
    // Cache the array's current length for efficiency in loop conditions.
    const currentArraySize = dataCollection.length;

    // Handle edge cases: an array with zero or one element is already considered sorted.
    if (currentArraySize <= 1) {
        // Output the array as is (which is already sorted) and zero swaps.
        console.log(dataCollection.join(' '));
        console.log(totalSwaps);
        return; // Exit the function early.
    }

    let hasSwappedInCurrentPass; // A boolean flag to indicate if any swap occurred in the current full pass.

    // Outer loop: This loop controls the number of passes through the array.
    // In each pass, the largest unsorted element "bubbles up" to its correct final position
    // at the end of the unsorted portion. The `outerIteration` variable helps
    // reduce the upper bound of the inner loop as elements are placed correctly.
    for (let outerIteration = 0; outerIteration < currentArraySize - 1; outerIteration++) {
        hasSwappedInCurrentPass = false; // Reset the swap flag for the start of a new pass.

        // Inner loop: This loop traverses through the currently unsorted portion of the array.
        // The upper bound `currentArraySize - 1 - outerIteration` shrinks with each outer pass,
        // as elements at the end are progressively sorted.
        for (let innerIndex = 0; innerIndex < currentArraySize - 1 - outerIteration; innerIndex++) {
            // Compare adjacent elements. If the current element is greater than the next one,
            // they are in the wrong order and need to be swapped.
            if (dataCollection[innerIndex] > dataCollection[innerIndex + 1]) {
                // Perform a swap using modern JavaScript array destructuring syntax.
                [dataCollection[innerIndex], dataCollection[innerIndex + 1]] =
                [dataCollection[innerIndex + 1], dataCollection[innerIndex]];
                
                hasSwappedInCurrentPass = true; // Mark that a swap has occurred in this pass.
                totalSwaps++; // Increment the global swap counter.
            }
        }

        // Optimization: If no swaps occurred during an entire inner pass, it means
        // the array (or the remaining unsorted portion) is already sorted,
        // so we can terminate the sorting process early.
        if (!hasSwappedInCurrentPass) {
            break; // Exit the outer loop.
        }
    }

    // After sorting, output the final sorted array with elements joined by spaces.
    console.log(dataCollection.join(' '));
    // Then, output the total count of swaps performed.
    console.log(totalSwaps);
}