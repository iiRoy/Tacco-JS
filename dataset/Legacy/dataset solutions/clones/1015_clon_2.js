(function(inputData) {
    // Split the input string into an array of lines
    var lines = inputData.split('\n');

    // The first line is the count of elements, but it's not used directly
    // in the sorting logic, only for slicing the array.
    var elementCount = lines.shift();

    // Extract the array to be sorted from the remaining lines
    var dataArray = lines.slice(0, elementCount);

    // Initialize a counter for swaps made during sorting
    var swapCounter = 0;

    // This array will store the gap sequence for Shell Sort
    var gapSequence = [];

    // Generate the gap sequence (Knuth's sequence: 2^k)
    // The sequence is generated in ascending order and then reversed
    // to be used in descending order for Shell Sort.
    for (var idx = 0;; idx++) {
        var currentGap = Math.pow(2, idx);
        if (currentGap > dataArray.length) {
            // Stop when the gap exceeds the array length
            break;
        }
        // Add the gap to the front of the sequence array
        gapSequence.unshift(currentGap);
    }

    // Execute the Shell Sort algorithm on the data array
    performShellSort(dataArray, gapSequence);

    // Output the number of gaps used in the sequence
    console.log(gapSequence.length);

    // Output the gap sequence itself, space-separated
    console.log(gapSequence.join(' '));

    // Output the total number of swaps performed
    console.log(swapCounter);

    // Output the sorted array, each element on a new line
    console.log(dataArray.join('\n'));

    /**
     * Implements the Shell Sort algorithm using a given gap sequence.
     * @param {Array<string>} targetArray The array of strings to be sorted.
     * @param {Array<number>} gaps The sequence of gaps to use for sorting.
     */
    function performShellSort(targetArray, gaps) {
        // Iterate through each gap in the sequence
        for (var k = 0; k < gaps.length; k++) {
            // For each gap, perform a g-sorted insertion sort
            applyInsertionSort(targetArray, gaps[k]);
        }

        /**
         * Performs an insertion sort with a specified gap size.
         * This is a helper function for Shell Sort.
         * @param {Array<string>} workingArray The array being sorted.
         * @param {number} currentGapSize The gap size for this pass of insertion sort.
         */
        function applyInsertionSort(workingArray, currentGapSize) {
            // Start from the 'currentGapSize'-th element and iterate to the end
            for (var outerIdx = currentGapSize; outerIdx < workingArray.length; outerIdx += currentGapSize) {
                // Store the current element to be inserted
                var valueToInsert = workingArray[outerIdx];
                // Initialize inner index for comparison
                var innerIdx = outerIdx - currentGapSize;

                // Shift elements that are greater than 'valueToInsert' to the right
                while (innerIdx >= 0 && workingArray[innerIdx] > valueToInsert) {
                    workingArray[innerIdx + currentGapSize] = workingArray[innerIdx];
                    innerIdx -= currentGapSize;
                    // Increment the global swap counter
                    swapCounter++;
                }
                // Place 'valueToInsert' in its correct position
                workingArray[innerIdx + currentGapSize] = valueToInsert;
            }
        }
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
