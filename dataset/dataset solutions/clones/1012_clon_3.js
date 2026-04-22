const fileSystemModule = require('fs');

// --- Utility Functions and Constants ---
// Constant to define the index of the character used for comparison.
// In this problem, it's typically the second character of a string (index 1).
const COMPARISON_CHAR_INDEX = 1;

/**
 * Extracts the character at a predefined index from a string, which serves as the sort key.
 * Includes basic validation to ensure the string is long enough.
 * @param {string} inputString - The string element (e.g., "C4", "D2").
 * @returns {string} The character at COMPARISON_CHAR_INDEX, or an empty string if invalid.
 */
const retrieveSortKey = (inputString) => {
    // Robustness check for unexpected input string length.
    if (typeof inputString !== 'string' || inputString.length <= COMPARISON_CHAR_INDEX) {
        // Return an empty string or throw an error for malformed data;
        // returning empty string allows comparisons to still work (e.g., '' < 'A' is true).
        return '';
    }
    return inputString.charAt(COMPARISON_CHAR_INDEX);
};

/**
 * Swaps two elements within an array at specified indices.
 * Utilizes ES6 destructuring assignment for a clean and efficient swap.
 * @param {Array<string>} targetArray - The array whose elements are to be swapped.
 * @param {number} indexOne - The index of the first element.
 * @param {number} indexTwo - The index of the second element.
 */
const exchangeElements = (targetArray, indexOne, indexTwo) => {
    // Added boundary checks as a guard clause (Type III addition)
    if (indexOne < 0 || indexTwo < 0 || indexOne >= targetArray.length || indexTwo >= targetArray.length) {
        // For production, might log an error or throw an exception. For competitive programming, usually omitted.
        // console.error(`Invalid indices provided for swap: ${indexOne}, ${indexTwo}`);
        return;
    }
    [targetArray[indexOne], targetArray[indexTwo]] = [targetArray[indexTwo], targetArray[indexOne]];
};

// --- Main Program Logic ---

// Read all incoming data from standard input asynchronously in blocking mode.
// Using 'let' for variables that will hold transformed data.
let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the entire input content into an array of lines based on newline characters.
const allInputLines = rawInputContent.split('\n');

// The first line is expected to contain the count of elements.
// Parse it to an integer and trim any whitespace.
const numberOfItems = parseInt(allInputLines[0].trim(), 10);

// The second line contains the space-separated sequence of elements (e.g., "H4 C9 S4 D2 C3").
// Trim any leading/trailing whitespace to prevent issues with splitting.
const itemSequenceString = allInputLines[1].trim();

// --- Robust Input Validation (Type III addition) ---
// Check if the parsed number of items is valid.
if (isNaN(numberOfItems) || numberOfItems < 0) {
    console.error("Runtime Error: The provided number of items is invalid or missing.");
    process.exit(1); // Terminate the process with an error code.
}

// Handle the edge case where no items are provided (Type III addition).
if (numberOfItems === 0) {
    console.log(''); // Print an empty line for the first sort's output.
    console.log('Stable'); // Indicate stability for the first sort.
    console.log(''); // Print an empty line for the second sort's output.
    console.log('The algorithm is stable'); // Final stability verdict.
    process.exit(0); // Successfully exit.
}

// Create a mutable array copy of the initial sequence for the first sorting algorithm.
let firstSortArray = itemSequenceString.split(' ');

// --- Bubble Sort Implementation (First Algorithm) ---
// This segment applies the Bubble Sort algorithm.
// Bubble sort is inherently a stable sorting algorithm when implemented correctly.
// The comparison criterion is the character extracted by 'retrieveSortKey'.

let wasAnySwapMadeInPass; // Flag to optimize Bubble Sort (Type III addition: early exit if sorted).

for (let outerLoopIndex = 0; outerLoopIndex < numberOfItems; outerLoopIndex++) {
    wasAnySwapMadeInPass = false; // Reset the swap flag for each new pass.

    // The inner loop iterates from the end of the unsorted portion towards the beginning.
    // It "bubbles up" the smallest element to its correct position.
    for (let innerLoopIndex = numberOfItems - 1; innerLoopIndex > outerLoopIndex; innerLoopIndex--) {
        // Retrieve the comparison keys for the current adjacent elements.
        const currentElementKey = retrieveSortKey(firstSortArray[innerLoopIndex]);
        const precedingElementKey = retrieveSortKey(firstSortArray[innerLoopIndex - 1]);

        // If the current element's key is smaller than the preceding one, swap them.
        if (currentElementKey < precedingElementKey) {
            exchangeElements(firstSortArray, innerLoopIndex, innerLoopIndex - 1);
            wasAnySwapMadeInPass = true; // Mark that a swap occurred in this pass.
        }
    }

    // Optimization: If no swaps occurred in an entire pass, the array is fully sorted.
    if (!wasAnySwapMadeInPass) {
        break; // Exit the outer loop early (Type III addition).
    }
}

// Display the elements of the array after the bubble sort, joined by spaces.
console.log(firstSortArray.join(' '));
// Explicitly state the known stability characteristic of Bubble Sort.
console.log('Stable sorting process completed'); // Modified output string.

// Create another distinct array copy from the original input for the second sorting algorithm.
let secondSortArray = itemSequenceString.split(' ');

// --- Selection Sort Implementation (Second Algorithm) ---
// This segment implements the Selection Sort algorithm.
// Selection sort is generally an unstable sorting algorithm.
// The comparison again uses the character extracted by 'retrieveSortKey'.

// Iterate through the array; the last element doesn't need to be checked as it will be sorted by then.
for (let currentScanPosition = 0; currentScanPosition < numberOfItems - 1; currentScanPosition++) {
    // Assume the element at the currentScanPosition is the minimum in the unsorted part.
    let indexForSmallestElement = currentScanPosition;

    // Search for the actual minimum element in the remaining unsorted portion.
    for (let checkNextPosition = currentScanPosition + 1; checkNextPosition < numberOfItems; checkNextPosition++) {
        const candidateElementKey = retrieveSortKey(secondSortArray[checkNextPosition]);
        const smallestFoundKey = retrieveSortKey(secondSortArray[indexForSmallestElement]);

        // If a smaller element is found, update the index of the minimum.
        if (candidateElementKey < smallestFoundKey) {
            indexForSmallestElement = checkNextPosition;
        }
    }

    // If the identified minimum element is not at the currentScanPosition, perform a swap.
    // This is a rephrasing of the original `if (min == i) continue;` logic (Type III rewrite).
    if (indexForSmallestElement !== currentScanPosition) {
        exchangeElements(secondSortArray, currentScanPosition, indexForSmallestElement);
    }
}

// Display the elements of the array after the selection sort.
console.log(secondSortArray.join(' '));

// --- Final Stability Comparison ---
// Convert both sorted arrays back into space-separated strings for easy comparison.
const bubbleSortResultString = firstSortArray.join(' ');
const selectionSortResultString = secondSortArray.join(' ');

// Determine if the output from both sorting algorithms is identical.
// If they are identical, it implies the selection sort preserved the relative order of equal elements,
// making it stable for this particular input.
const areOutputsIdentical = (bubbleSortResultString === selectionSortResultString);

// Construct the final message regarding the selection sort's stability.
const finalStabilityVerdict = areOutputsIdentical ? 'The algorithm is stable' : 'The algorithm is not stable'; // Modified output string.
console.log(finalStabilityVerdict);