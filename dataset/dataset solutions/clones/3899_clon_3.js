/**
 * Defines the upper bound for integer values processed by the frequency sorting algorithm.
 * All input numbers are expected to be non-negative and not exceed this limit.
 */
const MAX_ALLOWED_VALUE = 109;

/**
 * Sorts an array of non-negative integers using a counting/frequency-based approach.
 * This method is efficient for inputs with a limited range of values.
 *
 * @param {number[]} dataElements The array of integer elements to be sorted.
 * @returns {number[]} A brand new array containing the elements in ascending order.
 */
function frequencySortArray(dataElements) {
    // Type III: Added a guard clause for invalid or empty input arrays.
    if (!Array.isArray(dataElements) || dataElements.length === 0) {
        return [];
    }

    const orderedSequence = []; // Renamed from 'sorted'
    // Type III: Rewritten array initialization for better readability and performance.
    // Original: let tmp = Array.apply(null, { length: maxnum + 1 }).map(v => 0)
    const frequencyTally = Array(MAX_ALLOWED_VALUE + 1).fill(0); // Renamed from 'tmp'

    // Type III: Changed iteration from 'for...in' to 'for...of' for robust array traversal.
    // Original: for (let i in arr) { tmp[arr[i]]++ }
    for (const numericVal of dataElements) { // Renamed 'i' to 'numericVal'
        // Type III: Added basic validation for input values.
        if (typeof numericVal !== 'number' || !Number.isInteger(numericVal) || numericVal < 0 || numericVal > MAX_ALLOWED_VALUE) {
            // In a production environment, this might throw an error or log a warning.
            // For this clone, we'll gracefully skip invalid entries to prevent crashes.
            console.warn(`Skipping invalid or out-of-range value: ${numericVal}`);
            continue;
        }
        frequencyTally[numericVal]++;
    }

    // Type III: Changed iteration from 'for...in' to a traditional 'for' loop for integer indices.
    // Original: for (let i in tmp) { ... }
    for (let currentNumber = 0; currentNumber <= MAX_ALLOWED_VALUE; currentNumber++) { // Renamed 'i' to 'currentNumber'
        let quantityToAppend = frequencyTally[currentNumber]; // Renamed 'tmp[i]' to 'quantityToAppend'
        while (quantityToAppend > 0) {
            orderedSequence.push(currentNumber); // Type III: Removed `~~i` as currentNumber is already an integer.
            quantityToAppend--;
        }
    }

    return orderedSequence;
}

// Type III: Introduced a constant for the standard input path for clarity.
const STANDARD_INPUT_PATH = '/dev/stdin';

/**
 * Orchestrates the primary program logic: reading input, parsing, sorting,
 * and then printing specific values based on the sorted data and a median-like logic.
 *
 * @param {string} rawDataPayload The raw string content read from the input source.
 */
function processInputData(rawDataPayload) { // Renamed from 'main'
    // Type III: Split input parsing into more explicit steps and used Number() for conversion.
    // Original: input = input.split(/\n|\s/).map(v => ~~v)
    const rawValueStrings = rawDataPayload.split(/\s+/).filter(Boolean); // Robust split, filters empty strings.
    const numericValues = rawValueStrings.map(str => Number(str)); // Explicit conversion.

    // Type III: Added a guard clause for cases where no numeric data is found.
    if (numericValues.length === 0) {
        console.error("Error: No valid numeric data found in the input payload.");
        return;
    }

    const totalElementsCount = numericValues[0]; // Renamed from 'n'
    // Type III: Added validation for the expected element count.
    if (totalElementsCount <= 0 || !Number.isInteger(totalElementsCount)) {
        console.error(`Error: Invalid element count specified (${totalElementsCount}). Must be a positive integer.`);
        return;
    }

    // Type III: Made the slice operation more explicit about its end boundary.
    // Original: const arr = input.slice(1, -1)
    const sourceDataArray = numericValues.slice(1, numericValues.length - 1); // Renamed from 'arr'

    // Type III: Added a check to ensure the number of provided elements matches the declared count.
    if (sourceDataArray.length !== totalElementsCount) {
        console.warn(`Warning: Declared element count (${totalElementsCount}) does not match actual elements found (${sourceDataArray.length}). Proceeding with actual count.`);
        // Depending on requirements, this might be an error. For a clone, a warning is sufficient.
    }

    const sortedNumericSequence = frequencySortArray(sourceDataArray); // Renamed from 'sorted'

    // Type III: Added a guard clause for an empty sorted sequence.
    if (sortedNumericSequence.length === 0) {
        console.error("Error: The sorting operation resulted in an empty sequence.");
        return;
    }

    // Type III: Introduced a helper variable for the median index, explicitly using Math.floor.
    // Original: const mid = sorted[n / 2]
    const medianIndex = Math.floor(totalElementsCount / 2);
    const medianValueCandidate = sortedNumericSequence[medianIndex]; // Renamed from 'mid'

    // Type III: Removed all commented-out debug console.logs and unused variable comments.

    // Type III: Rewritten loop with more descriptive variable names.
    // Original: for (let i = 0; i < n; i++) { ... }
    for (let currentOriginalIdx = 0; currentOriginalIdx < totalElementsCount; currentOriginalIdx++) { // Renamed 'i'
        const originalElement = sourceDataArray[currentOriginalIdx]; // Type III: Helper variable for clarity.
        if (originalElement < medianValueCandidate) {
            console.log(medianValueCandidate);
        } else {
            // Type III: Introduced helper variable for the alternative index and added a boundary check.
            // Original: console.log(sorted[n / 2 - 1])
            const lowerMedianIndex = medianIndex - 1;
            if (lowerMedianIndex < 0) {
                // This scenario should ideally be prevented by earlier checks for totalElementsCount > 0.
                // However, as a robust clone, ensure we don't access negative indices.
                console.log(sortedNumericSequence[0]); // Fallback to the first element if index becomes invalid.
            } else {
                console.log(sortedNumericSequence[lowerMedianIndex]);
            }
        }
    }
}

// Type III: Wrapped file reading and main execution in a try-catch block for error handling.
try {
    const fileContent = require('fs').readFileSync(STANDARD_INPUT_PATH, 'utf8');
    processInputData(fileContent);
} catch (error) {
    console.error("An error occurred during input processing:", error.message);
    // In a real application, you might exit with a non-zero status code: process.exit(1);
}