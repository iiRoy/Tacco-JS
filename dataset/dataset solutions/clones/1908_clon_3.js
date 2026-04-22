/**
 * Reads raw input from standard input, splits it into tokens, and filters out any empty strings.
 * This function handles the initial acquisition and basic parsing of the input data.
 * @returns {string[]} An array of string tokens extracted from the input.
 */
function acquireInputTokens() {
    try {
        // Use 'node:fs' for explicit module reference, a minor stylistic change.
        const rawContent = require("node:fs").readFileSync("/dev/stdin", "utf8");

        // Implement a guard clause: if the input content is empty or only whitespace,
        // there's no data to process, so return an empty array immediately.
        if (!rawContent || rawContent.trim().length === 0) {
            return [];
        }

        // Split the raw input by one or more whitespace characters (spaces, newlines, tabs).
        // Then, filter out any potential empty strings that might result from the split
        // (e.g., if there are multiple spaces between numbers or trailing whitespace).
        return rawContent.split(/\s+/).filter(Boolean);
    } catch (error) {
        // In a production environment, more sophisticated error handling would be present.
        // For competitive programming or a code clone, a console error is sufficient.
        console.error("An error occurred while reading input data:", error.message);
        return []; // Return an empty array to allow the program to continue gracefully.
    }
}

/**
 * This is the primary function responsible for executing the problem's logic.
 * It reads a sequence of numbers, applies two distinct transformations,
 * sorts the transformed sequences, and then calculates the total number of
 * identical pairs that exist across these two sorted sequences using a two-pointer method.
 * @returns {number} The final count of matching pairs.
 */
function computeSolution() {
    const inputTokens = acquireInputTokens();

    // Initial validation: If no tokens were acquired (e.g., empty input file),
    // there's nothing to process, so return 0 pairs.
    if (inputTokens.length < 1) {
        return 0;
    }

    // The very first token is expected to represent the total number of elements
    // that follow it in the input sequence. Convert it to a number explicitly.
    const collectionSize = Number(inputTokens[0]);

    // Further validation: Ensure that the parsed 'collectionSize' is a valid positive integer.
    // If it's not a number, or if it's zero or negative, it implies invalid input
    // or no elements to process, thus returning 0.
    if (isNaN(collectionSize) || collectionSize <= 0) {
        return 0;
    }

    // Data integrity check: Verify that the total number of input tokens is sufficient
    // to match the declared 'collectionSize' plus the initial size token itself.
    // While in competitive programming valid input is often assumed, this adds robustness.
    // For this clone, we'll proceed but slice only available elements if mismatch.
    if (inputTokens.length < collectionSize + 1) {
        // Could log a warning or adjust collectionSize, but for this clone,
        // we'll let `slice` handle the actual bounds.
    }

    // Extract the actual numeric data elements. We use `slice` to get a new array
    // containing elements from the second token up to the 'collectionSize' limit.
    // Each string token is then explicitly converted to a Number.
    const numericDataElements = inputTokens.slice(1, collectionSize + 1).map(Number);

    // First data transformation: Each original numeric element has its original
    // index added to its value. The resulting array is then sorted numerically.
    const transformedSetOne = numericDataElements
        .map((elementValue, originalIndex) => elementValue + originalIndex)
        .sort((valA, valB) => valA - valB); // Standard ascending numerical sort

    // Second data transformation: Each original numeric element is subtracted
    // from its original index. This resulting array is also sorted numerically.
    const transformedSetTwo = numericDataElements
        .map((elementValue, originalIndex) => originalIndex - elementValue)
        .sort((valA, valB) => valA - valB); // Standard ascending numerical sort

    // Initialize two pointers for traversing the sorted transformed sets
    // and a counter for the total number of matching pairs.
    let pointerLeft = 0; // Pointer for 'transformedSetOne'
    let pointerRight = 0; // Pointer for 'transformedSetTwo'
    let matchingPairCount = 0; // Accumulates the final count

    // Employ a classic two-pointer algorithm to efficiently find and count
    // identical values across two sorted arrays.
    while (pointerLeft < collectionSize && pointerRight < collectionSize) {
        const currentValueLeft = transformedSetOne[pointerLeft];
        const currentValueRight = transformedSetTwo[pointerRight];

        // Determine the size of the current group of identical values in 'transformedSetOne'.
        // This handles cases where multiple elements have the same transformed value.
        let nextGroupStartLeft = pointerLeft + 1;
        while (nextGroupStartLeft < collectionSize && transformedSetOne[nextGroupStartLeft] === currentValueLeft) {
            nextGroupStartLeft++;
        }
        const countOccurrencesLeft = nextGroupStartLeft - pointerLeft; // Number of times currentValueLeft appears consecutively

        // Similarly, determine the size of the current group of identical values in 'transformedSetTwo'.
        let nextGroupStartRight = pointerRight + 1;
        while (nextGroupStartRight < collectionSize && transformedSetTwo[nextGroupStartRight] === currentValueRight) {
            nextGroupStartRight++;
        }
        const countOccurrencesRight = nextGroupStartRight - pointerRight; // Number of times currentValueRight appears consecutively

        // Compare the current values from both sets:
        if (currentValueLeft === currentValueRight) {
            // If the values are identical, then every occurrence in the left group
            // matches every occurrence in the right group. Multiply their counts.
            matchingPairCount += countOccurrencesLeft * countOccurrencesRight;
            // Advance both pointers past their respective groups to avoid re-counting.
            pointerLeft = nextGroupStartLeft;
            pointerRight = nextGroupStartRight;
        } else if (currentValueLeft < currentValueRight) {
            // If the value from the left set is smaller, it cannot match any value
            // in the right set starting from 'currentValueRight' (due to sorting).
            // Therefore, advance the left pointer past its current group.
            pointerLeft = nextGroupStartLeft;
        } else { // currentValueLeft > currentValueRight
            // If the value from the right set is smaller, similarly advance the right pointer
            // past its current group.
            pointerRight = nextGroupStartRight;
        }
    }

    return matchingPairCount; // Return the total accumulated count.
}

// Execute the main solution logic and print the returned result to standard output.
// The `computeSolution` function is designed to always return a number (0 or positive),
// so an explicit check for `undefined` is not necessary here.
console.log(computeSolution());