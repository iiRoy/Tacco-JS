// A self-executing anonymous function to encapsulate the primary application logic.
(function executePrimaryProcess() {

    // Retrieve the Node.js file system module for input/output operations.
    const fileSystemModule = require('fs');

    // Define the conventional path for standard input in a Unix-like environment.
    const standardInputSourcePath = '/dev/stdin';

    let rawInputDataContent;
    try {
        // Attempt to synchronously read the entire content of the standard input file,
        // interpreting it as UTF-8 encoded text.
        rawInputDataContent = fileSystemModule.readFileSync(standardInputSourcePath, 'utf8');
    } catch (ioReadError) {
        // In case of any error during file reading, log the issue and terminate the process.
        console.error("Critical Error: Failed to acquire input from " + standardInputSourcePath + ":", ioReadError.message);
        process.exit(1); // Exit with a non-zero code to indicate failure.
    }

    // Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
    const sourceContentLines = rawInputDataContent.trim().split('\n');

    // --- Robust Input Validation and Parsing ---

    // Ensure that there are at least two lines of input data (one for count, one for elements).
    if (sourceContentLines.length < 2) {
        console.error("Input Error: Insufficient data lines detected. Expected a minimum of two lines for processing.");
        process.exit(1);
    }

    // The first line typically contains a count, which might not be directly used by the heap
    // construction logic itself but is part of the expected input format.
    const countSpecificationString = sourceContentLines.shift();
    const parsedElementCount = parseInt(countSpecificationString, 10); // Parse as base-10 integer.

    // Validate the parsed count to ensure it's a non-negative integer.
    if (isNaN(parsedElementCount) || parsedElementCount < 0) {
        console.error(`Input Error: Invalid or negative element count '${countSpecificationString}' found on the first line.`);
        process.exit(1);
    }
    // Note: This `parsedElementCount` is read but not directly utilized by `formLargestRootHeap`,
    // mirroring the behavior of the original code's `n` variable. This serves as a Type III addition.

    // The subsequent line is expected to contain the space-separated numeric elements.
    const rawElementValueStrings = sourceContentLines.shift().split(' ');

    // Filter out any empty strings that might result from multiple spaces between numbers.
    const cleanedElementStrings = rawElementValueStrings.filter(str => str.trim() !== '');

    // Convert all filtered string elements into an array of numbers.
    const numericDataSequence = cleanedElementStrings.map(elementString => {
        const valueAsNumber = parseInt(elementString, 10); // Attempt to parse each element.
        if (isNaN(valueAsNumber)) {
            // Log a warning for non-numeric input and substitute with a default value (e.g., 0).
            console.warn(`Data Warning: Non-numeric value '${elementString}' encountered; substituting with 0.`);
            return 0; // Default to 0, or could throw an error for stricter validation.
        }
        return valueAsNumber;
    });

    // --- Core Algorithm Execution ---

    // Invoke the specialized function to transform the numeric sequence into a max heap structure.
    const finalHeapArrangement = formLargestRootHeap(numericDataSequence);

    // Construct the output string, ensuring a leading space as per the original format.
    const formattedOutputResult = ' ' + finalHeapArrangement.join(' ');

    // Display the heapified array to standard output.
    console.log(formattedOutputResult);

    // Optional: Add a simple confirmation message for successful completion.
    // console.log("Application process finished successfully.");

})(); // End of the main execution block.


/**
 * Transforms a given array of numbers into a max heap (where each parent node
 * is greater than or equal to its children) in-place.
 *
 * @param {Array<number>} elementSequence The mutable array of numbers to be reordered into a max heap.
 * @returns {Array<number>} The reference to the same array, now structured as a max heap.
 */
function formLargestRootHeap(elementSequence) {
    // --- Pre-condition Checks for Robustness ---
    if (!Array.isArray(elementSequence)) {
        console.error("Function Error: The input 'elementSequence' must be an array for heap formation.");
        return []; // Return an empty array or throw an exception for invalid input type.
    }
    if (elementSequence.length === 0) {
        // An empty array is intrinsically a valid, albeit trivial, max heap.
        return elementSequence;
    }

    // Store the array's current size for efficient access within the heap operations.
    const currentCollectionSize = elementSequence.length;

    // --- Internal Helper for Element Comparison ---
    /**
     * Determines if the element at `idxA` is strictly greater than the element at `idxB`.
     * Includes basic bounds checking for safety.
     * @param {number} idxA Index of the first element.
     * @param {number} idxB Index of the second element.
     * @returns {boolean} True if element at idxA is greater, false otherwise or if indices are invalid.
     */
    const isFirstElementDominant = (idxA, idxB) => {
        // Ensure both indices are within the valid range of the array.
        if (idxA < 0 || idxA >= currentCollectionSize || idxB < 0 || idxB >= currentCollectionSize) {
            // For production, could throw an error or return a specific error code.
            console.warn(`Comparison Warning: Attempted to access out-of-bounds index (${idxA} or ${idxB}) in a collection of size ${currentCollectionSize}.`);
            return false; // Treat as not dominant if indices are invalid.
        }
        return elementSequence[idxA] > elementSequence[idxB];
    };

    // --- Internal Helper for Element Swapping ---
    /**
     * Swaps two elements within the `elementSequence` array given their indices.
     * Performs basic validation on indices.
     * @param {number} indexOne The index of the first element to swap.
     * @param {number} indexTwo The index of the second element to swap.
     */
    const exchangeElements = (indexOne, indexTwo) => {
        // Only proceed with swapping if indices are distinct and valid.
        if (indexOne === indexTwo ||
            indexOne < 0 || indexOne >= currentCollectionSize ||
            indexTwo < 0 || indexTwo >= currentCollectionSize) {
            return; // No operation needed or invalid indices provided.
        }
        // Use a temporary variable for a clear, explicit swap operation.
        const tempValue = elementSequence[indexOne];
        elementSequence[indexOne] = elementSequence[indexTwo];
        elementSequence[indexTwo] = tempValue;
    };


    /**
     * Recursively adjusts a subtree rooted at `rootElementIndex` to satisfy the max heap property.
     * This operation is often referred to as "percolate down" or "sift down".
     * It ensures that the element at `rootElementIndex` is larger than its children.
     *
     * @param {number} rootElementIndex The index of the current node to heapify downwards from.
     */
    const siftElementDown = (rootElementIndex) => {
        // Assume the current root is the largest initially.
        let dominantNodeIndex = rootElementIndex;

        // Calculate the indices of the left and right children based on 0-indexing.
        const leftChildPosition = (rootElementIndex * 2) + 1;
        const rightChildPosition = (rootElementIndex * 2) + 2;

        // Check if the left child exists and if it is larger than the current dominant node.
        if (leftChildPosition < currentCollectionSize && isFirstElementDominant(leftChildPosition, dominantNodeIndex)) {
            dominantNodeIndex = leftChildPosition;
        }

        // Check if the right child exists and if it is larger than the (potentially updated) dominant node.
        if (rightChildPosition < currentCollectionSize && isFirstElementDominant(rightChildPosition, dominantNodeIndex)) {
            dominantNodeIndex = rightChildPosition;
        }

        // If the dominant node is no longer the original root, a swap is required.
        if (dominantNodeIndex !== rootElementIndex) {
            // Perform the swap to move the larger element upwards in the heap.
            exchangeElements(rootElementIndex, dominantNodeIndex);

            // Recursively call siftElementDown on the subtree where the swap occurred
            // to ensure the heap property is maintained throughout.
            siftElementDown(dominantNodeIndex);
        }
    };

    // --- Heap Construction Phase ---
    // The process of building a heap (heapify) starts from the last non-leaf node
    // and proceeds upwards towards the root (index 0).
    // For a 0-indexed array representing a complete binary tree:
    // Any node with an index 'i' such that `i >= Math.floor(currentCollectionSize / 2)` is a leaf node.
    // The loop iterates from the last node that can possibly have children (or even a leaf, as per original logic)
    // down to the root node (index 0). Calling `siftElementDown` on a leaf node has no effect,
    // so this range is functionally equivalent to only processing parent nodes.
    for (let iterativeIndex = Math.floor(currentCollectionSize / 2); iterativeIndex >= 0; iterativeIndex--) {
        siftElementDown(iterativeIndex);
    }

    // The `elementSequence` array has now been reordered in-place to satisfy the max heap property.
    return elementSequence;
}