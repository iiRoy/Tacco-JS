// This script processes a sequence of numbers to determine the minimum
// alterations required to make all numbers at odd positions identical
// and all numbers at even positions identical, with the additional constraint
// that the chosen number for odd positions must be distinct from the chosen
// number for even positions.

// Utilize the Node.js built-in file system module for input operations.
const fileSystemUtility = require("fs");

// Read the entire standard input stream, interpreting it as UTF-8 encoded text,
// then divide the content into an array of strings based on newline characters.
const rawInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
const parsedInputLines = rawInputContent.split("\n");

// Implement a basic validation check for the input structure.
// Expecting at least two lines: one for total count, one for the sequence.
if (parsedInputLines.length < 2) {
    console.error("Error: Insufficient input data. Expected a minimum of two lines.");
    // Terminate script execution with an error status.
    process.exit(1);
}

// Parse the first line to extract the total number of elements as an integer.
// Trim whitespace and specify radix 10 for robust parsing.
const totalElementsExpected = parseInt(parsedInputLines[0].trim(), 10);

// Validate the parsed total count; it must be a positive integer.
if (isNaN(totalElementsExpected) || totalElementsExpected < 0) {
    console.error("Error: The declared total element count is invalid or non-positive.");
    process.exit(1);
}

// Extract the actual sequence of elements from the second input line.
// Trim any leading/trailing whitespace and split by single spaces.
const inputSequenceValues = parsedInputLines[1].trim().split(" ");

// Although the problem statement usually guarantees N elements,
// a robust solution might check if the actual parsed count matches `totalElementsExpected`.
// For this problem, `totalElementsExpected` acts as 'N', and `inputSequenceValues.length`
// is the actual count of elements to process. If they differ, the problem's interpretation
// usually means `inputSequenceValues.length` is the effective N.
// We will use `totalElementsExpected` as `n` from the original code.

// Initialize two distinct Map objects to store frequency counts:
// one for numbers found at odd 0-based indices, and another for even 0-based indices.
const oddIndexedValueCounts = new Map();
const evenIndexedValueCounts = new Map();

// Iterate over each value in the input sequence along with its index.
inputSequenceValues.forEach((currentValueString, currentElementIndex) => {
    // Determine which frequency map to update based on the index's parity.
    // `currentElementIndex % 2 !== 0` evaluates to true for odd indices (1, 3, 5...)
    // and false for even indices (0, 2, 4...).
    const targetFrequencyMap = (currentElementIndex % 2 !== 0)
        ? oddIndexedValueCounts
        : evenIndexedValueCounts;

    // Increment the count for the current value in the selected map.
    // If the value hasn't been encountered before, initialize its count to 0 first.
    targetFrequencyMap.set(currentValueString, (targetFrequencyMap.get(currentValueString) || 0) + 1);
});

// Convert the frequency maps into sortable arrays of objects.
// Each object will contain the `element` (the number string) and its `frequency`.
const sortedOddPositionFrequencies = Array.from(oddIndexedValueCounts.entries()).map(([element, frequency]) => ({
    element,
    frequency
}));
const sortedEvenPositionFrequencies = Array.from(evenIndexedValueCounts.entries()).map(([element, frequency]) => ({
    element,
    frequency
}));

// Sort both frequency arrays in descending order based on their frequency counts.
// This places the most common elements at the beginning of each array.
sortedOddPositionFrequencies.sort((entryA, entryB) => entryB.frequency - entryA.frequency);
sortedEvenPositionFrequencies.sort((entryA, entryB) => entryB.frequency - entryA.frequency);

// Helper function to safely retrieve the frequency count from a sorted array at a given index.
// Returns 0 if the index is out of bounds (i.e., element does not exist).
const retrieveFrequency = (frequencyList, idx) => {
    return frequencyList[idx] ? frequencyList[idx].frequency : 0;
};

// Helper function to safely retrieve the element value from a sorted array at a given index.
// Returns null if the index is out of bounds.
const retrieveElementValue = (frequencyList, idx) => {
    return frequencyList[idx] ? frequencyList[idx].element : null;
};

// Initialize a variable to store the maximum count of elements that can be kept unchanged.
let maximumPreservedElements = 0;

// Obtain the most frequent element and its count for odd-indexed positions.
const primaryOddValue = retrieveElementValue(sortedOddPositionFrequencies, 0);
const primaryOddCount = retrieveFrequency(sortedOddPositionFrequencies, 0);

// Obtain the most frequent element and its count for even-indexed positions.
const primaryEvenValue = retrieveElementValue(sortedEvenPositionFrequencies, 0);
const primaryEvenCount = retrieveFrequency(sortedEvenPositionFrequencies, 0);

// Handle edge cases where the input sequence might be very short or empty.
if (totalElementsExpected === 0) {
    maximumPreservedElements = 0; // No elements, no changes needed.
} else if (sortedOddPositionFrequencies.length === 0 && sortedEvenPositionFrequencies.length === 0) {
    // This case should ideally be caught by totalElementsExpected === 0, but as a safeguard.
    maximumPreservedElements = 0;
} else if (sortedOddPositionFrequencies.length === 0) {
    // If all elements were at even positions (e.g., totalElementsExpected = 1).
    // In this scenario, we only need to optimize even positions. Odd positions are non-existent.
    maximumPreservedElements = primaryEvenCount;
} else if (sortedEvenPositionFrequencies.length === 0) {
    // If all elements were at odd positions (e.g., totalElementsExpected = 1).
    // Similarly, optimize only odd positions. Even positions are non-existent.
    maximumPreservedElements = primaryOddCount;
} else if (primaryOddValue !== primaryEvenValue) {
    // Scenario 1: The most frequent element for odd positions is different
    // from the most frequent element for even positions.
    // This is the optimal case; we can use both without conflict.
    maximumPreservedElements = primaryOddCount + primaryEvenCount;
} else {
    // Scenario 2: The most frequent elements for both odd and even positions are identical.
    // We cannot use the same value for both sets of positions.
    // We must choose a different second-best option for one of them.

    // Option A: Keep the most frequent odd-position value, and for even positions,
    //           select the second most frequent value (if available).
    const secondaryEvenCount = retrieveFrequency(sortedEvenPositionFrequencies, 1);
    const preservedCountOptionA = primaryOddCount + secondaryEvenCount;

    // Option B: Keep the most frequent even-position value, and for odd positions,
    //           select the second most frequent value (if available).
    const secondaryOddCount = retrieveFrequency(sortedOddPositionFrequencies, 1);
    const preservedCountOptionB = secondaryOddCount + primaryEvenCount;

    // Choose the option that allows us to preserve more elements.
    maximumPreservedElements = Math.max(preservedCountOptionA, preservedCountOptionB);
}

// Calculate the minimum number of changes required.
// This is the total number of elements minus the maximum number of elements
// that can be kept unchanged.
const minimumRequiredModifications = totalElementsExpected - maximumPreservedElements;

// Define a shorthand for the console logging function.
const outputFinalResult = console.log;

// Display the calculated minimum number of modifications.
outputFinalResult(minimumRequiredModifications);