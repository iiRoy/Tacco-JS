(function executeSortingProcess() {
    // This script processes a list of numbers from a specified input source,
    // sorts them using a bubble sort algorithm, and reports the total number of swaps.
    // It's a Type III clone, featuring extensive structural and lexical modifications.

    // --- Configuration and Essential Utilities Setup ---
    const FILE_SYSTEM_UTILITY = require('fs'); // Renamed 'fs' module reference for clarity
    const SYSTEM_PROCESSING_CONFIG = {       // Renamed 'config' object to reflect its purpose
        dataFilePath: '/dev/stdin',          // Renamed 'input' to 'dataFilePath'
        lineBreakChar: '\n'                // Renamed 'newline' to 'lineBreakChar'
    };

    // --- Input Validation and Data Acquisition ---
    // Added a preliminary validation step for critical configuration parameters.
    if (!SYSTEM_PROCESSING_CONFIG.dataFilePath || !SYSTEM_PROCESSING_CONFIG.lineBreakChar) {
        console.error("ERROR: Essential system processing configurations are missing. Cannot proceed.");
        process.exit(1); // Terminate execution upon critical configuration failure
    }

    let rawFileContentBuffer;
    try {
        // Attempt to read the input file synchronously. Using 'utf8' encoding for broader character support.
        rawFileContentBuffer = FILE_SYSTEM_UTILITY.readFileSync(SYSTEM_PROCESSING_CONFIG.dataFilePath, 'utf8');
    } catch (fileReadError) {
        // Added comprehensive error handling for file reading operations.
        console.error(`ERROR: Failed to access or read the specified data file: ${SYSTEM_PROCESSING_CONFIG.dataFilePath}. Details: ${fileReadError.message}`);
        process.exit(1);
    }

    // Split the entire content into an array of lines.
    // The original code used `split(..., 2)` and then accessed `A[1]`.
    // This version first splits all lines and then explicitly targets the second one.
    const allContentLines = rawFileContentBuffer.split(SYSTEM_PROCESSING_CONFIG.lineBreakChar);

    // Added a guard clause to ensure the input contains sufficient data.
    if (allContentLines.length < 2) {
        console.error("ERROR: Input data is insufficient. Expected at least two lines, but received fewer.");
        process.exit(1);
    }

    // Extract the second line, which contains the numbers to be sorted.
    const numbersAsStringSequence = allContentLines[1]; // Renamed 'A[1]'
    let numericSequenceForSorting = numbersAsStringSequence.split(' ').map(Number); // Renamed 'A', used 'let'

    // --- Execution of Sorting Algorithm ---
    // Call the custom sorting function and capture the total exchange count.
    const finalExchangeTally = executeBubbleSort(numericSequenceForSorting); // Renamed 'cnt', 'sort(A)'

    // --- Outputting Processed Results ---
    console.log(numericSequenceForSorting.join(' ')); // Output the sorted array, renamed 'A'
    console.log(finalExchangeTally);                  // Output the total swap count, renamed 'cnt'

    /**
     * Implements a bubble sort algorithm to sort an array of numbers in ascending order in-place.
     * This version uses a common left-to-right pass, bubbling larger elements to the end
     * of the unsorted portion of the array in each iteration. It also counts and returns
     * the total number of element swaps performed.
     *
     * @param {number[]} dataCollection - The array of numerical values to be sorted.
     * @returns {number} The total count of swap operations executed during the sorting process.
     */
    function executeBubbleSort(dataCollection) { // Renamed 'sort' function and its parameter 'A'
        let totalExchangeCount = 0; // Renamed 'cnt'
        let hasAnySwapOccurred;     // Renamed 'flag'
        const collectionSize = dataCollection.length; // Renamed 'A.length', introduced a constant

        // --- Helper Function: Element Swapping ---
        // Extracted swap logic into a dedicated helper function for modularity.
        const swapElementsInArray = (arrayRef, firstIdx, secondIdx) => {
            const temporaryHolder = arrayRef[firstIdx]; // Renamed 'tmp'
            arrayRef[firstIdx] = arrayRef[secondIdx];
            arrayRef[secondIdx] = temporaryHolder;
        };

        // --- Early Exit for Trivial Cases ---
        // Added a guard clause for arrays that are already sorted by definition (empty or single element).
        if (collectionSize <= 1) {
            return 0;
        }

        // --- Main Sorting Loop Structure (Rewritten) ---
        // Outer loop: Manages the passes. In each pass, the largest unsorted element
        // "bubbles" to its correct position at the end of the unsorted segment.
        for (let passIteration = 0; passIteration < collectionSize - 1; passIteration++) {
            hasAnySwapOccurred = false; // Reset the swap indicator for the current pass

            // Inner loop: Compares adjacent elements within the unsorted portion of the array.
            // The `collectionSize - 1 - passIteration` ensures that already sorted elements
            // at the end of the array are not re-checked, optimizing subsequent passes.
            for (let comparisonIndex = 0; comparisonIndex < collectionSize - 1 - passIteration; comparisonIndex++) { // Renamed 'j'
                // Compare current element with the next one.
                if (dataCollection[comparisonIndex] > dataCollection[comparisonIndex + 1]) {
                    // Perform a swap if elements are in the incorrect order.
                    swapElementsInArray(dataCollection, comparisonIndex, comparisonIndex + 1);
                    hasAnySwapOccurred = true;  // Indicate that a swap took place
                    totalExchangeCount++;       // Increment the total swap counter
                }
            }

            // --- Optimization: Early Termination ---
            // If no swaps occurred during an entire pass, the array is already sorted,
            // so we can terminate early. This replaces the original 'while(flag)' logic.
            if (!hasAnySwapOccurred) {
                break;
            }
        }
        return totalExchangeCount;
    }

})(); // End of the Immediately Invoked Function Expression (IIFE)