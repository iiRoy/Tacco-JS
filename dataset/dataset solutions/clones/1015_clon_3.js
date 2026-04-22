(function(sourceData) {
    // Parse the raw input string into an array of individual lines.
    // Utilizes a regex to handle both Windows (\r\n) and Unix (\n) line endings for broader compatibility.
    const inputLines = sourceData.split(/\r?\n/);

    // The very first line of the input is expected to be the total number of elements
    // that need to be processed and sorted.
    let numElements = parseInt(inputLines.shift(), 10);

    // Introduce a validation check for the parsed number of elements.
    // If it's not a valid positive integer, we'll treat it as zero to prevent errors
    // in subsequent array operations. A real application might throw an error or log.
    if (isNaN(numElements) || numElements < 0) {
        // console.warn("Warning: Invalid or negative number of elements provided. Defaulting to 0.");
        numElements = 0; // Ensure a non-negative, sensible default for processing.
    }

    // Extract the actual data elements from the remaining input lines.
    // The `slice(0, numElements)` ensures we only take the specified number of elements.
    // `map(Number)` converts each string element to its numeric equivalent.
    const sortableData = inputLines.slice(0, numElements).map(Number);

    // Initialize a global counter for tracking operations during the sorting process.
    // This counter accumulates the number of element shifts/comparisons performed.
    let totalSwapsOrComparisons = 0;

    // This section is dedicated to generating the gap sequence, which is a crucial
    // component for the Shell Sort algorithm. We'll use a sequence based on powers of 2.
    const shellGaps = [];
    let currentIteration = 0; // Represents the exponent for the power of 2.

    // Continuously generate gaps until the calculated gap value exceeds the array's length.
    // This ensures we have a comprehensive set of gaps relevant to the data size.
    while (true) {
        // Calculate the current gap value using a bit shift operation (1 << currentIteration),
        // which is an efficient way to compute 2 raised to the power of `currentIteration`.
        const currentGapValue = 1 << currentIteration;

        // If the calculated gap is larger than the number of elements in our array,
        // it means we've generated all practical gaps, so we can exit the loop.
        if (currentGapValue > sortableData.length) {
            break;
        }

        // Add the current gap value to the beginning of the `shellGaps` array.
        // This ensures the gaps are stored in descending order, which is typical for Shell Sort.
        shellGaps.unshift(currentGapValue);
        currentIteration++; // Move to the next power of 2.
    }

    // As an additional robustness measure, ensure that if `sortableData` is not empty
    // but no gaps were generated (e.g., due to very small `numElements` or specific edge cases),
    // we at least include a gap of 1 to ensure a final insertion sort pass.
    if (shellGaps.length === 0 && sortableData.length > 0) {
        shellGaps.push(1); // A gap of 1 is equivalent to a standard insertion sort.
    }

    // Now, invoke the primary sorting function, `applyShellSort`, passing in the data
    // to be sorted and the pre-calculated sequence of gaps.
    applyShellSort(sortableData, shellGaps);

    // --- Output Section ---
    // The following `console.log` statements produce the required output based on the problem specification.

    // 1. Print the total number of distinct gaps used during the Shell Sort process.
    console.log(shellGaps.length);

    // 2. Print the sequence of gaps, with each gap separated by a single space.
    console.log(shellGaps.join(' '));

    // 3. Print the accumulated count of element shifts/comparisons that occurred during sorting.
    console.log(totalSwapsOrComparisons);

    // 4. Print the final sorted array, with each element displayed on a new line.
    console.log(sortableData.join('\n'));

    /**
     * Orchestrates the Shell Sort algorithm by iterating through a sequence of gaps.
     * For each gap, it applies a g-insertion sort to the entire array.
     * @param {number[]} dataToProcess - The array of numerical data that needs to be sorted.
     * @param {number[]} gapSequenceArray - A pre-defined array containing the decreasing gap values.
     */
    function applyShellSort(dataToProcess, gapSequenceArray) {
        // Iterate through each gap value provided in the `gapSequenceArray`.
        // Each iteration represents a pass of the g-insertion sort with a specific gap.
        for (let gapIndex = 0; gapIndex < gapSequenceArray.length; gapIndex++) {
            const currentShellGap = gapSequenceArray[gapIndex]; // Extract the current gap value.

            // Delegate the actual sorting for the current gap to the `performGapInsertionSort` function.
            performGapInsertionSort(dataToProcess, currentShellGap);
        }

        /**
         * Implements a g-insertion sort, which is a variation of insertion sort where
         * comparisons and shifts occur at intervals of `currentGap` rather than 1.
         * This function is called repeatedly by `applyShellSort` with different `currentGap` values.
         * @param {number[]} targetArray - The array on which the g-insertion sort is performed.
         * @param {number} currentGap - The interval (gap) to use for comparisons and element movements.
         */
        function performGapInsertionSort(targetArray, currentGap) {
            // The outer loop starts from the `currentGap`-th element. This is because
            // elements before this index do not have a preceding element at `currentGap` distance.
            for (let outerLoopIndex = currentGap; outerLoopIndex < targetArray.length; outerLoopIndex++) {
                // Store the value of the element that is currently being considered for insertion
                // into its correct position within its g-sub-array.
                const valueToInsert = targetArray[outerLoopIndex];

                // Initialize an inner pointer that points to the element `currentGap` positions
                // before the `outerLoopIndex`. This is the first element in the g-sub-array
                // to compare against `valueToInsert`.
                let innerLoopPointer = outerLoopIndex - currentGap;

                // This inner `while` loop performs the actual shifting of elements.
                // It continues as long as `innerLoopPointer` is a valid index (non-negative)
                // AND the element at `innerLoopPointer` is greater than `valueToInsert`.
                while (innerLoopPointer >= 0 && targetArray[innerLoopPointer] > valueToInsert) {
                    // Shift the element at `innerLoopPointer` forward by `currentGap` positions.
                    // This creates space for `valueToInsert` or other smaller elements.
                    targetArray[innerLoopPointer + currentGap] = targetArray[innerLoopPointer];

                    // Move the `innerLoopPointer` backward by `currentGap` to check the next element
                    // in the g-sub-array for comparison.
                    innerLoopPointer -= currentGap;

                    // Increment the global counter for each element shift operation.
                    totalSwapsOrComparisons++;
                }
                // After the `while` loop finishes, `innerLoopPointer + currentGap` represents
                // the correct sorted position for `valueToInsert` within its g-sub-array.
                targetArray[innerLoopPointer + currentGap] = valueToInsert;
            }
        }
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));