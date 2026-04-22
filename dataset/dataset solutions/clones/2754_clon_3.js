/**
 * This module is responsible for processing a sequence of numerical data.
 * It implements a specific reduction algorithm where, in each step, the smallest
 * inner element is identified, its value is added to its immediate neighbors,
 * and then the element itself is removed from the sequence. This process
 * continues until only two elements remain, whose sum is then reported.
 */

/**
 * Parses the raw input string, extracts the numerical sequence from the second line,
 * and performs basic validation to ensure the data is suitable for processing.
 *
 * @param {string} rawInputContent The entire content read from the standard input.
 * @returns {number[] | null} An array of numbers if parsing is successful and valid, otherwise null.
 */
function extractAndValidateNumericSequence(rawInputContent) {
    const inputLines = rawInputContent.split('\n');

    // Expected input format includes at least two lines: a metadata line and a data line.
    if (inputLines.length < 2) {
        console.error("Input Error: Expected at least two lines of data, but fewer were provided.");
        return null;
    }

    // The actual numerical data is expected on the second line (index 1).
    const dataStringLine = inputLines[1].trim();

    if (!dataStringLine) {
        console.error("Input Error: The second line containing numerical data is empty.");
        return null;
    }

    // Split the data line by spaces and convert each part to a number.
    // The filter removes any elements that couldn't be converted to a valid number (e.g., empty strings).
    const parsedNumberElements = dataStringLine.split(' ').map(Number).filter(val => !isNaN(val));

    // The algorithm requires at least three elements to begin the reduction loop,
    // as it needs inner elements and their neighbors.
    if (parsedNumberElements.length < 2) {
        console.error(`Input Error: Insufficient valid numerical elements (${parsedNumberElements.length} found). At least 2 are required for a final sum.`);
        return null;
    }

    return parsedNumberElements;
}

/**
 * Identifies the index of the smallest numerical value within a given sequence,
 * specifically excluding the first and last elements. This is crucial for the
 * algorithm's reduction logic.
 *
 * @param {number[]} currentSequence The array of numbers to search within.
 * @returns {number} The index of the smallest inner element, or -1 if no such element
 *                   can be found (e.g., if the sequence has fewer than 3 elements).
 */
function findSmallestInnerElementIndex(currentSequence) {
    const sequenceCount = currentSequence.length;

    // A sequence must have at least three elements to have "inner" elements
    // (i.e., elements not at the very beginning or end).
    if (sequenceCount < 3) {
        return -1; // No inner elements to consider for reduction.
    }

    let discoveredMinimumValue = Number.MAX_SAFE_INTEGER; // Initialize with a very large number.
    let indexForMinimumElement = -1;

    // Iterate through the sequence, skipping the first (index 0) and last (index `sequenceCount - 1`) elements.
    for (let currentElementIdx = 1; currentElementIdx < sequenceCount - 1; currentElementIdx++) {
        const valueAtIndex = currentSequence[currentElementIdx];
        if (valueAtIndex < discoveredMinimumValue) {
            discoveredMinimumValue = valueAtIndex;
            indexForMinimumElement = currentElementIdx;
        }
    }

    return indexForMinimumElement;
}

/**
 * Executes a single reduction step on the numerical array. This involves finding
 * the smallest inner element, adding its value to its immediate left and right
 * neighbors, and then removing the smallest element from the array.
 *
 * @param {number[]} dataArray The array of numbers to be modified.
 * @returns {boolean} True if a reduction step was successfully performed, false otherwise.
 */
function performArrayReductionStep(dataArray) {
    // Reduction is only possible if there are at least three elements.
    if (dataArray.length <= 2) {
        return false;
    }

    // Find the index of the element to be merged and removed.
    const elementRemovalIndex = findSmallestInnerElementIndex(dataArray);

    // If no valid inner element is found, it indicates an unexpected state.
    if (elementRemovalIndex === -1) {
        console.error("Runtime Error: Failed to locate an inner element for removal despite sufficient array length.");
        return false;
    }

    const leftNeighborPosition = elementRemovalIndex - 1;
    const rightNeighborPosition = elementRemovalIndex + 1;

    const valueToMerge = dataArray[elementRemovalIndex];
    const initialLeftNeighborValue = dataArray[leftNeighborPosition];
    const initialRightNeighborValue = dataArray[rightNeighborPosition];

    // Update the values of the adjacent elements by adding the merged element's value.
    dataArray[leftNeighborPosition] = initialLeftNeighborValue + valueToMerge;
    dataArray[rightNeighborPosition] = initialRightNeighborValue + valueToMerge;

    // Remove the central element that has now been merged into its neighbors.
    dataArray.splice(elementRemovalIndex, 1);
    
    return true;
}

/**
 * The main orchestrator function that manages the entire data transformation process.
 * It reads raw input, validates it, repeatedly applies reduction steps, and outputs the final result.
 *
 * @param {string} rawInputString The complete input content received from standard input.
 */
function executeDataTransformation(rawInputString) {
    // Phase 1: Initialize and validate the input numerical sequence.
    let currentNumericalSet = extractAndValidateNumericSequence(rawInputString);

    if (!currentNumericalSet) {
        // If validation fails, the process cannot continue.
        return;
    }

    // Phase 2: Iteratively reduce the sequence until only two elements remain.
    // The loop continues as long as there are enough elements to perform a reduction.
    while (currentNumericalSet.length > 2) {
        const stepSuccessful = performArrayReductionStep(currentNumericalSet);
        if (!stepSuccessful && currentNumericalSet.length > 2) {
            // This condition should ideally not be met if `performArrayReductionStep` is correctly implemented.
            console.error("Algorithm Stalled: Reduction step failed unexpectedly, preventing further processing.");
            break; // Prevent potential infinite loop in case of logic error.
        }
    }

    // Phase 3: Compute and display the final sum.
    // At this point, the array should ideally contain exactly two elements.
    let finalAggregateSum = 0;
    if (currentNumericalSet.length === 2) {
        finalAggregateSum = currentNumericalSet[0] + currentNumericalSet[1];
    } else if (currentNumericalSet.length === 1) {
        // This scenario might occur with specific edge-case inputs (e.g., initial length 2).
        // The original problem implies summing two values, so this is a deviation.
        console.warn("Warning: Only one element remained after reduction. The final sum is simply this element.");
        finalAggregateSum = currentNumericalSet[0];
    } else {
        // This indicates a more significant issue if the array ends up with 0 or >2 elements unexpectedly.
        console.error(`Error: Unexpected number of elements (${currentNumericalSet.length}) remaining after reduction. Cannot compute final sum as expected.`);
        finalAggregateSum = 0; // Default to zero in error case.
    }
    
    // Output the final calculated sum.
    console.log(finalAggregateSum);
}

// Standard boilerplate for reading input in competitive programming environments.
// This part typically remains unchanged and invokes the primary processing function.
executeDataTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));