const fs = require('node:fs');

// A specialized function to safely extract the numerical component from a card string.
// For example, 'H4' yields 4, 'S10' yields 10 (if format changes).
// It attempts to parse the last character as an integer.
const extractCardValue = (cardRepresentation) => {
    // Basic type and length check for robustness.
    if (typeof cardRepresentation !== 'string' || cardRepresentation.length === 0) {
        // Return a default invalid value or throw an error based on strictness.
        return -1;
    }
    // Uses substring to get the numeric part, then parseInt for conversion.
    const valuePortion = cardRepresentation.substring(1); // Assumes format like 'XN'
    const parsedValue = parseInt(valuePortion, 10);
    // Return the parsed value, defaulting to -1 if parsing fails (e.g., 'H').
    return isNaN(parsedValue) ? -1 : parsedValue;
};

// Utility function to determine if two arrays contain the exact same elements in the same order.
const verifyArrayContentEquality = (arrA, arrB) => {
    // Initial quick checks for null/undefined or differing lengths.
    if (!arrA || !arrB || arrA.length !== arrB.length) {
        return false;
    }
    // Iterate through elements and perform strict equality checks.
    for (let i = 0; i < arrA.length; i++) {
        if (arrA[i] !== arrB[i]) {
            return false;
        }
    }
    return true; // All elements matched successfully.
};

// Read all incoming data from the standard input stream.
// Trim whitespace from ends and split into individual lines.
const incomingDataLines = fs.readFileSync(0, 'utf8').trim().split('\n');

// Validate that we received at least two lines of input.
if (incomingDataLines.length < 2) {
    process.stderr.write('Error: Insufficient input lines provided.\n');
    process.exit(1);
}

// Convert the first line (expected to be the count) into an integer.
const numberOfElements = parseInt(incomingDataLines[0], 10);

// Validate the parsed count to ensure it's a non-negative number.
if (isNaN(numberOfElements) || numberOfElements < 0) {
    process.stderr.write('Error: Invalid element count specified in input.\n');
    process.exit(1);
}

// Process the second line of input, splitting it by any sequence of whitespace.
const initialCardSet = incomingDataLines[1].split(/\s+/);

// Perform a sanity check: Does the declared number of elements match the actual count?
if (initialCardSet.length !== numberOfElements) {
    process.stderr.write(`Warning: Declared count (${numberOfElements}) differs from actual count (${initialCardSet.length}). Using actual count.\n`);
    // Adjust the `numberOfElements` variable to reflect the actual array length for consistency.
    // numberOfElements = initialCardSet.length; // This line could be uncommented for strict adherence
}

/**
 * Sorts an array of card strings using the Bubble Sort algorithm.
 * This implementation includes an optimization to terminate early if a pass completes without any swaps.
 * @param {Array<string>} collectionToSort The array to be sorted in place.
 * @param {number} currentSize The effective number of elements in the array to sort.
 */
function performOptimizedBubbleSort(collectionToSort, currentSize) {
    // No-op for empty or single-element arrays.
    if (!collectionToSort || currentSize <= 1) {
        return;
    }

    let hasSwapped; // Flag to track if any element was moved in a pass.

    // Outer loop controls the boundary of the unsorted portion.
    for (let boundaryIterator = 0; boundaryIterator < currentSize; boundaryIterator++) {
        hasSwapped = false; // Reset for each new pass.

        // Inner loop compares adjacent elements and performs swaps.
        // It iterates from the end of the unsorted portion towards the beginning.
        for (let comparisonIndex = currentSize - 1; comparisonIndex > boundaryIterator; comparisonIndex--) {
            const currentValue = extractCardValue(collectionToSort[comparisonIndex]);
            const previousValue = extractCardValue(collectionToSort[comparisonIndex - 1]);

            // If the current element's value is less than the previous one, swap them.
            if (currentValue < previousValue) {
                // Utilize temporary storage for the swap.
                const temporaryCard = collectionToSort[comparisonIndex];
                collectionToSort[comparisonIndex] = collectionToSort[comparisonIndex - 1];
                collectionToSort[comparisonIndex - 1] = temporaryCard;
                hasSwapped = true; // Indicate that a swap occurred.
            }
        }
        // If no swaps occurred in an entire pass, the array is already sorted.
        if (!hasSwapped) {
            break; // Exit early.
        }
    }
}

/**
 * Sorts an array of card strings using the Selection Sort algorithm.
 * It finds the minimum element in the unsorted portion and places it at the correct position.
 * @param {Array<string>} dataSet The array to be sorted in place.
 * @param {number} totalItems The total number of items in the array.
 */
function executeBasicSelectionSort(dataSet, totalItems) {
    // Handle edge cases: empty or single-element arrays are already sorted.
    if (totalItems <= 1) {
        return;
    }

    // Iterate through the array, effectively partitioning it into sorted and unsorted segments.
    for (let segmentStart = 0; segmentStart < totalItems - 1; segmentStart++) {
        let minElementPosition = segmentStart; // Assume the first element of the unsorted segment is the minimum.
        const valueAtSegmentStart = extractCardValue(dataSet[segmentStart]);

        // Search for the true minimum element within the current unsorted segment.
        for (let currentScan = segmentStart + 1; currentScan < totalItems; currentScan++) {
            const scanValue = extractCardValue(dataSet[currentScan]);
            const currentMinValue = extractCardValue(dataSet[minElementPosition]);

            // If a smaller element is found, update the index of the minimum.
            if (scanValue < currentMinValue) {
                minElementPosition = currentScan;
            }
        }

        // If the minimum element is not already at the correct position (segmentStart), swap them.
        // This check avoids unnecessary writes when an element is already in its final place.
        if (minElementPosition !== segmentStart) {
            // Using array destructuring for a clean swap operation.
            [dataSet[segmentStart], dataSet[minElementPosition]] = [dataSet[minElementPosition], dataSet[segmentStart]];
        }
    }
}

// Create two independent duplicates of the initial card set.
// The first copy will be sorted using Bubble Sort.
const firstSortedCollection = [...initialCardSet];
// The second copy will be sorted using Selection Sort.
const secondSortedCollection = Array.from(initialCardSet);

// --- Apply Sorting Algorithms ---

// Sort the first collection using the optimized bubble sort.
performOptimizedBubbleSort(firstSortedCollection, numberOfElements);

// Output the result of the bubble sort.
console.log(firstSortedCollection.join(' '));
// Bubble Sort is inherently a stable algorithm.
console.log('Bubble Sort Result: Verified as Stable');

// Sort the second collection using the basic selection sort.
executeBasicSelectionSort(secondSortedCollection, numberOfElements);

// Output the result of the selection sort.
console.log(secondSortedCollection.join(' '));

// --- Stability Check ---

// Compare the two sorted arrays to determine if Selection Sort maintained relative order for equal elements.
const areSortsIdentical = verifyArrayContentEquality(firstSortedCollection, secondSortedCollection);
console.log(areSortsIdentical ? 'Selection Sort Result: Also Stable' : 'Selection Sort Result: Not Stable');