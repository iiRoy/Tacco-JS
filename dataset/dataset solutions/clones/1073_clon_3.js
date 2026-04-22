(function (inputDataString) {
    // Helper function to extract lines from the raw input string
    const parseInputLines = (rawStr) => rawStr.split('\n');

    // Helper function to read a specific line as a number
    const readLineAsNumber = (lines, index) => {
        const value = Number(lines[index]);
        if (isNaN(value)) {
            // Basic validation: handle cases where the line isn't a number
            console.error(`Error: Expected a number at line ${index}, but got "${lines[index]}"`);
            return 0; // Default to 0 or throw an error
        }
        return value;
    };

    // Helper function to swap elements in an array
    const swapArrayElements = (arr, firstIndex, secondIndex) => {
        if (firstIndex === secondIndex) return; // Optimization for identical indices
        const temporaryHolder = arr[firstIndex];
        arr[firstIndex] = arr[secondIndex];
        arr[secondIndex] = temporaryHolder;
    };

    // Process the initial input
    let linesArray = parseInputLines(inputDataString);

    // Determine the number of elements to process, and remove that line
    const totalElementsToProcess = readLineAsNumber(linesArray, 0);
    linesArray.shift(); // Remove the count line from the array

    // Extract the actual data elements based on the count
    const sortableItems = linesArray.slice(0, totalElementsToProcess);

    // Create an immutable snapshot of the original order for stability verification
    const initialOrderReference = Array.from(sortableItems);

    /**
     * Extracts the numeric component from a card string (e.g., 'S10' -> 10).
     * Handles potential non-numeric parts by using parseInt.
     * @param {string} cardIdentifier - The string representing a card (e.g., "H1", "D13").
     * @returns {number} The numeric value of the card.
     */
    const extractNumericValue = (cardIdentifier) => {
        // Guard against invalid inputs
        if (typeof cardIdentifier !== 'string' || cardIdentifier.length < 2) {
            return NaN; // Or throw an error, depending on desired robustness
        }
        // Extract substring starting from the second character
        const numericPart = cardIdentifier.substring(1);
        return parseInt(numericPart, 10); // Use parseInt for explicit base
    };

    /**
     * Gathers and concatenates all elements from a source list that have a specific numeric value.
     * This is used to check the relative order of elements with identical values.
     * @param {string[]} sourceList - The array of card strings to search through.
     * @param {number} targetNumericValue - The numeric value to match.
     * @returns {string} A concatenated string of all matching elements in their original order.
     */
    const retrieveElementsMatchingValue = (sourceList, targetNumericValue) => {
        const matchingItems = [];
        // Iterate through the source list to find elements whose numeric part matches
        for (let currentIdx = 0; currentIdx < sourceList.length; currentIdx++) {
            const currentItem = sourceList[currentIdx];
            if (extractNumericValue(currentItem) === targetNumericValue) {
                matchingItems.push(currentItem); // Add to the temporary array
            }
        }
        return matchingItems.join(''); // Join them into a single string for comparison
    };

    /**
     * Verifies if the sorting operation maintained the relative order of equal elements.
     * This is the definition of a stable sort.
     * @param {string[]} originalList - The array in its initial order.
     * @param {string[]} processedList - The array after sorting.
     * @returns {boolean} True if the sort was stable, false otherwise.
     */
    const verifyStability = (originalList, processedList) => {
        // Basic check for different lengths, which would indicate a major issue
        if (originalList.length !== processedList.length) {
            return false; // Lists must be of the same length
        }

        // Iterate through each element of the processed list
        for (let elementIndex = 0; elementIndex < processedList.length; ++elementIndex) {
            const currentNumericVal = extractNumericValue(originalList[elementIndex]);

            // Compare the concatenated strings of elements with the same numeric value
            // from both the original and the processed lists. If they differ, stability is lost.
            if (retrieveElementsMatchingValue(originalList, currentNumericVal) !==
                retrieveElementsMatchingValue(processedList, currentNumericVal)) {
                return false; // Instability detected
            }
        }
        return true; // All checks passed, the sort is stable
    };

    /**
     * Implements a partitioning step similar to Quicksort's Lomuto partition scheme.
     * It rearranges elements in a subarray such that elements less than or equal to the pivot
     * come before it, and elements greater than the pivot come after it.
     * @param {string[]} targetArray - The array to be partitioned.
     * @param {number} segmentStartIdx - The starting index of the current segment.
     * @param {number} segmentEndIdx - The ending index of the current segment (inclusive).
     * @returns {number} The final index of the pivot element after partitioning.
     */
    const performPartition = (targetArray, segmentStartIdx, segmentEndIdx) => {
        // The last element of the segment is chosen as the pivot
        const pivotElementValue = extractNumericValue(targetArray[segmentEndIdx]);
        let leftWallIndex = segmentStartIdx - 1; // Index for the "smaller than pivot" section

        // Iterate through the segment, excluding the pivot itself
        for (let currentScanIdx = segmentStartIdx; currentScanIdx < segmentEndIdx; currentScanIdx++) {
            const currentElementNumericValue = extractNumericValue(targetArray[currentScanIdx]);

            // If the current element is less than or equal to the pivot,
            // move it to the "smaller" section by incrementing leftWallIndex and swapping
            if (currentElementNumericValue <= pivotElementValue) {
                leftWallIndex++;
                swapArrayElements(targetArray, leftWallIndex, currentScanIdx);
            }
        }

        // Place the pivot element in its correct sorted position
        // It should go right after all elements that are less than or equal to it
        const pivotFinalPosition = leftWallIndex + 1;
        swapArrayElements(targetArray, pivotFinalPosition, segmentEndIdx);

        return pivotFinalPosition; // Return the pivot's final index
    };

    /**
     * Recursively sorts a segment of the array using a Quicksort-like approach.
     * This function calls the partition function and then recursively sorts the
     * sub-segments created by the partition.
     * Note: This particular recursive call structure is a direct clone of the original,
     * which may not be a standard Quicksort implementation regarding pivot exclusion from sub-calls.
     * @param {string[]} targetArray - The array to be sorted.
     * @param {number} segmentStartIdx - The starting index of the current segment.
     * @param {number} segmentEndIdx - The ending index of the current segment (inclusive).
     */
    const recursiveSortSegment = (targetArray, segmentStartIdx, segmentEndIdx) => {
        // Base case: if the segment has one or zero elements, it's already sorted
        if (segmentStartIdx >= segmentEndIdx) {
            return;
        }

        // Perform the partitioning step
        const pivotIndex = performPartition(targetArray, segmentStartIdx, segmentEndIdx);

        // Recursively sort the left sub-segment (including the pivot based on original logic)
        recursiveSortSegment(targetArray, segmentStartIdx, pivotIndex);
        // Recursively sort the right sub-segment (including the pivot based on original logic)
        recursiveSortSegment(targetArray, pivotIndex, segmentEndIdx);
    };

    // Initiate the sorting process on the `sortableItems` array
    recursiveSortSegment(sortableItems, 0, sortableItems.length - 1);

    // Determine and log the stability of the sort
    const stabilityStatus = verifyStability(initialOrderReference, sortableItems) ? 'Stable' : 'Not stable';
    console.log(stabilityStatus);

    // Log the sorted array, with each element on a new line
    console.log(sortableItems.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));