// --- Configuration and Core Utilities ---

// Define immutable settings for file operations and parsing.
const fileInputConfiguration = Object.freeze({
    sourceFilePath: '/dev/stdin',      // The designated path for input data.
    lineSeparationCharacter: '\n',     // The character marking the end of a line.
    fileContentEncoding: 'utf8'        // Character encoding for reading the file.
});

// Import necessary Node.js modules for file system and path manipulation.
const nodeFileSystem = require('fs');
const nodePathResolver = require('path');

// --- Input Acquisition and Data Transformation ---

/**
 * Reads raw data from a specified file, parses it, and transforms it
 * into a structured array suitable for sorting. Handles potential file errors
 * and input format inconsistencies.
 *
 * The expected input format is two lines:
 * 1. An integer (often N, ignored in this context).
 * 2. Space-separated strings (e.g., "A1 B2 C1").
 * Each string is converted into a `[numericKey, originalString]` pair.
 *
 * @param {object} settings - Configuration object containing file path, delimiter, and encoding.
 * @returns {Array<Array<number|string>>} An array of data elements, each
 *   represented as `[sortKey, originalIdentifier]`. Returns an empty array on error or invalid input.
 */
function obtainAndProcessDataFromSource(settings) {
    const absoluteInputPath = nodePathResolver.resolve(settings.sourceFilePath);
    let rawFileContents;

    try {
        rawFileContents = nodeFileSystem.readFileSync(absoluteInputPath, settings.fileContentEncoding);
    } catch (readError) {
        console.error(`ERROR: Failed to read input file at '${absoluteInputPath}'. Details: ${readError.message}`);
        return []; // Gracefully handle file read errors.
    }

    // Validate if the file content is meaningful.
    if (!rawFileContents || rawFileContents.trim().length === 0) {
        console.warn('WARNING: Input file is empty or contains only whitespace. Returning an empty dataset.');
        return [];
    }

    const allContentLines = rawFileContents.split(settings.lineSeparationCharacter);

    // Enforce minimum line requirement for valid data.
    if (allContentLines.length < 2) {
        console.warn('WARNING: Input file contains fewer than two lines. Expected metadata + data. Returning empty dataset.');
        return [];
    }

    // The first line is typically metadata (e.g., count 'N') and is often ignored for the actual data.
    // We explicitly acknowledge it here.
    const firstLineInfo = allContentLines[0]; // Can be processed further if 'N' is actually needed.
    const dataStringLine = allContentLines[1];

    // Split the data line into individual string fragments (e.g., "A1", "B2").
    const rawFragments = dataStringLine.split(' ');

    // Transform each fragment into a [numericKey, originalString] pair.
    const structuredDataItems = rawFragments.map(fragment => {
        // Extract the numeric part (e.g., '1' from 'A1') as the sorting key.
        const numericKeyCandidate = parseInt(fragment.substring(1), 10);

        // Validate the extracted numeric key.
        if (isNaN(numericKeyCandidate)) {
            console.error(`WARNING: Could not parse a valid numeric key from fragment "${fragment}". This item will be skipped.`);
            return null; // Mark invalid items for filtering.
        }
        return [numericKeyCandidate, fragment]; // Store the pair.
    }).filter(item => item !== null); // Remove any nulls resulting from invalid fragments.

    return structuredDataItems;
}

// Execute input processing to get the initial dataset.
const primaryDataSource = obtainAndProcessDataFromSource(fileInputConfiguration);

// --- Stable Sorting Algorithms Implementation ---

/**
 * A recursive helper for `applyBubbleSortRecursive`. It performs a single "bubble" pass,
 * comparing the first two elements and recursively processing the rest.
 * This operation is inherently stable.
 * @param {Array<Array<number|string>>} segment - The array segment to reorder.
 * @returns {Array<Array<number|string>>} The reordered segment.
 */
const executePairwiseOrdering = (segment) => {
    // Base case: segments of one or zero elements are already "ordered" in this context.
    if (segment.length <= 1) {
        return segment;
    }

    // Deconstruct the segment into its first two elements and the remaining tail.
    const elementOne = segment[0];
    const elementTwo = segment[1];
    const tailSegment = segment.slice(2);

    // Compare elements based on their numeric key (first item in the inner array).
    if (elementOne[0] > elementTwo[0]) {
        // If elementOne's key is larger, swap them to maintain ascending order.
        // Recursively apply ordering to the rest, with elementOne now in the second position.
        return [elementTwo, ...executePairwiseOrdering([elementOne, ...tailSegment])];
    } else {
        // Elements are already in the correct relative order (or equal, maintaining stability).
        // Recursively apply ordering to the rest, with elementTwo now in the second position.
        return [elementOne, ...executePairwiseOrdering([elementTwo, ...tailSegment])];
    }
};

/**
 * Implements a recursive version of Bubble Sort. This algorithm is stable.
 * It repeatedly calls `executePairwiseOrdering` to move the largest unsorted
 * element to its correct position at the end of the current sub-array.
 * @param {Array<Array<number|string>>} inputSequence - The array to sort.
 * @returns {Array<Array<number|string>>} A new array, sorted stably in ascending order.
 */
const applyBubbleSortRecursive = (inputSequence) => {
    // Input validation.
    if (!Array.isArray(inputSequence)) {
        console.error("ERROR: Input for applyBubbleSortRecursive must be an array.");
        return [];
    }
    // Base case: an empty array is considered sorted.
    if (inputSequence.length === 0) {
        return [];
    }

    // Perform one full pass of pairwise comparisons. This ensures the largest
    // element in `inputSequence` "bubbles" to the last position.
    const singlePassResult = executePairwiseOrdering(inputSequence);

    // Separate the sorted "tail" (the last element) from the "head" (the rest).
    const headElements = singlePassResult.slice(0, singlePassResult.length - 1);
    const tailElement = singlePassResult[singlePassResult.length - 1];

    // Recursively sort the head elements and then append the now-correctly-placed tail element.
    return [...applyBubbleSortRecursive(headElements), tailElement];
};

/**
 * Helper function to find the minimum element in an array.
 * Crucially, it returns the *first* occurrence of the minimum element
 * if there are duplicates with the same numeric key, which is vital for stability.
 * @param {Array<Array<number|string>>} elements - The array to search.
 * @returns {Array<number|string>|null} The minimum element, or null if the array is empty.
 */
const findFirstMinimumElement = (elements) => {
    if (!elements || elements.length === 0) {
        return null;
    }
    let currentSmallest = elements[0];
    for (let k = 1; k < elements.length; k++) {
        // If a new smaller key is found, update currentSmallest.
        // If keys are equal, the existing currentSmallest (which is an earlier occurrence) is kept, ensuring stability.
        if (elements[k][0] < currentSmallest[0]) {
            currentSmallest = elements[k];
        }
    }
    return currentSmallest;
};

/**
 * Implements a recursive Selection Sort variant. This version is designed to be stable.
 * It works by repeatedly finding the minimum element, placing it at the beginning
 * of the sorted portion, and recursively sorting the remainder.
 * Stability is preserved by precisely handling the displacement of the element
 * that was originally at the front of the list.
 * @param {Array<Array<number|string>>} inputCollection - The array to sort.
 * @returns {Array<Array<number|string>>} A new array, sorted stably in ascending order.
 */
const applySelectionSortRecursive = (inputCollection) => {
    // Input validation.
    if (!Array.isArray(inputCollection)) {
        console.error("ERROR: Input for applySelectionSortRecursive must be an array.");
        return [];
    }
    // Base case: an empty array is considered sorted.
    if (inputCollection.length === 0) {
        return [];
    }

    // Find the minimum element in the current collection, ensuring the first occurrence is chosen for duplicates.
    const minimumValueElement = findFirstMinimumElement(inputCollection);
    // Store the element that was initially at the front of this collection.
    const originalFrontElement = inputCollection[0];

    // Construct the list of elements for the next recursive call.
    // This process is critical for maintaining stability:
    // The `minimumValueElement` is conceptually removed from its current position.
    // If `minimumValueElement` was NOT the `originalFrontElement`, then `originalFrontElement`
    // takes the place of `minimumValueElement` in the `remainingElements` list.
    const remainingElementsForNextRecursion = [];
    let minimumReplacedOrSkipped = false; // Flag to ensure only the first instance of the minimum's original string is handled.

    for (let currentIndex = 0; currentIndex < inputCollection.length; currentIndex++) {
        const currentItem = inputCollection[currentIndex];

        // If the current item is the minimum (by its original string identifier) and we haven't processed it yet.
        if (currentItem[1] === minimumValueElement[1] && !minimumReplacedOrSkipped) {
            // This is the minimum element. It will be prepended later, so it's "removed" from here.
            // If this minimum element was not the `originalFrontElement` (i.e., `currentIndex !== 0`),
            // then `originalFrontElement` needs to be inserted into the `remainingElementsForNextRecursion`
            // to fill the gap and maintain relative order.
            if (currentIndex !== 0) {
                remainingElementsForNextRecursion.push(originalFrontElement);
            }
            minimumReplacedOrSkipped = true; // Mark as handled.
        } else if (currentIndex === 0) {
            // This is the `originalFrontElement`. If it's not the minimum, it should be kept in the list.
            // (If it *is* the minimum, it would have been handled by the first `if` block above).
            remainingElementsForNextRecursion.push(currentItem);
        } else {
            // For all other elements, just add them to the list for the next recursion.
            remainingElementsForNextRecursion.push(currentItem);
        }
    }

    // Recursively sort the `remainingElementsForNextRecursion` and prepend the `minimumValueElement`.
    return [minimumValueElement, ...applySelectionSortRecursive(remainingElementsForNextRecursion)];
};


// --- Stability Verification Logic ---

/**
 * Compares two sorted arrays to verify if the candidate array maintains the
 * relative order of equal elements as established by the reference stable sort.
 * This is a check for the "stability" property of sorting algorithms.
 * @param {Array<Array<number|string>>} stableReferenceArray - An array sorted by a known stable algorithm.
 * @param {Array<Array<number|string>>} arrayToCheckConsistency - The array whose stability is being evaluated.
 * @returns {boolean} True if `arrayToCheckConsistency` is stable relative to `stableReferenceArray`, false otherwise.
 */
const evaluateSortingConsistency = (stableReferenceArray, arrayToCheckConsistency) => {
    // Perform initial validation for robust comparison.
    if (!Array.isArray(stableReferenceArray) || !Array.isArray(arrayToCheckConsistency)) {
        console.error("ERROR: Both inputs for evaluateSortingConsistency must be arrays.");
        return false;
    }
    if (stableReferenceArray.length !== arrayToCheckConsistency.length) {
        console.warn("WARNING: Arrays have different lengths. Cannot reliably check consistency. Returning false.");
        return false;
    }
    if (stableReferenceArray.length === 0) {
        return true; // Two empty arrays are trivially consistent.
    }

    // Iterate through both arrays and compare elements at corresponding positions.
    for (let k = 0; k < stableReferenceArray.length; k++) {
        // Stability is determined by comparing the *original string identifiers* (index 1)
        // of elements at each position. If they don't match, stability is broken.
        if (stableReferenceArray[k][1] !== arrayToCheckConsistency[k][1]) {
            return false; // Inconsistency found, early exit.
        }
    }
    return true; // All elements matched, arrays are consistent (stable).
};


// --- Main Execution Flow and Output Presentation ---

// Execute the stable sorting algorithms on the initial dataset.
const finalBubbleSortedResult = applyBubbleSortRecursive(primaryDataSource);
const finalSelectionSortedResult = applySelectionSortRecursive(primaryDataSource);

/**
 * A utility function to format and print the output of a sorting algorithm.
 * It extracts only the original string identifiers for display.
 * @param {string} algorithmLabel - A descriptive name for the sorting algorithm.
 * @param {Array<Array<number|string>>} sortedCollection - The array of sorted data elements.
 */
const presentFormattedSortOutput = (algorithmLabel, sortedCollection) => {
    // Map each data item to its original string identifier and join them with spaces.
    const outputStringIdentifiers = sortedCollection.map(item => item[1]).join(' ');
    console.log(`${algorithmLabel} Output: ${outputStringIdentifiers}`);
};

// Display the results for the Bubble Sort.
presentFormattedSortOutput('Recursive Bubble Sort', finalBubbleSortedResult);
console.log('NOTE: Recursive Bubble Sort, as implemented, maintains relative order of equal elements.');

// Display the results for the Selection Sort.
presentFormattedSortOutput('Recursive Selection Sort', finalSelectionSortedResult);

// Perform and report the stability check between the two sorting results.
const areSortsConsistent = evaluateSortingConsistency(finalBubbleSortedResult, finalSelectionSortedResult);
const consistencyVerdict = areSortsConsistent ? 'Stable' : 'Not Stable';
console.log(`Stability Evaluation (Selection Sort vs. Bubble Sort): ${consistencyVerdict}`);

// Provide a concluding message for the script's execution.
console.log('\n--- Script Execution Concluded ---');