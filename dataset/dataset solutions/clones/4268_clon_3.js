"use strict";

/**
 * Helper function to find the lower bound index in a sorted array of numbers.
 * This function returns the index of the first element that is
 * greater than or equal to the specified 'referenceValue'.
 * If all elements in the array are less than 'referenceValue', it returns the array's length.
 * This returned index also represents the count of elements strictly less than 'referenceValue'.
 *
 * @param {number[]} sortedValues - The array of numbers, which must be sorted in ascending order.
 * @param {number} referenceValue - The value to search for or compare against.
 * @returns {number} The index representing the lower bound.
 */
const locateLowerBoundIndex = (sortedValues, referenceValue) => {
    // Validate input array. If empty or invalid, the "insertion point" is at index 0.
    if (!Array.isArray(sortedValues) || sortedValues.length === 0) {
        return 0;
    }

    let searchLeftBoundary = 0;
    let searchRightBoundary = sortedValues.length; // Exclusive upper boundary for the search range.
    let potentialInsertionPosition = sortedValues.length; // Default: value would be inserted at the end.

    // Standard binary search algorithm for finding the lower bound.
    while (searchLeftBoundary < searchRightBoundary) {
        // Calculate the middle index of the current search segment.
        const middlePointIndex = Math.floor((searchLeftBoundary + searchRightBoundary) / 2);

        // If the element at middlePointIndex is greater than or equal to the referenceValue,
        // it means middlePointIndex is a potential candidate for our lower bound.
        // We then attempt to find an even smaller index to its left.
        if (sortedValues[middlePointIndex] >= referenceValue) {
            potentialInsertionPosition = middlePointIndex; // Store this as a possible answer.
            searchRightBoundary = middlePointIndex;        // Continue searching in the left half (including middlePointIndex).
        } else {
            // If the element is less than the referenceValue, we must search in the right half.
            // The lower bound must be to the right of middlePointIndex.
            searchLeftBoundary = middlePointIndex + 1;
        }
    }
    // The 'potentialInsertionPosition' now holds the index of the first element
    // that is greater than or equal to 'referenceValue', or sortedValues.length
    // if all elements are less than 'referenceValue'.
    // This value also directly represents the count of elements strictly less than 'referenceValue'.
    return potentialInsertionPosition;
};

/**
 * Helper utility to parse a space-separated string of numbers into a numerically sorted array.
 * It handles potential whitespace and non-numeric entries gracefully.
 *
 * @param {string} inputLineContent - The string containing space-separated numbers.
 * @returns {number[]} A new array of numbers, sorted in ascending order.
 */
const parseAndSortNumericalData = (inputLineContent) => {
    // Basic validation for the input string to ensure it's processable.
    if (typeof inputLineContent !== 'string' || inputLineContent.trim() === '') {
        // If the input is invalid or empty, return an empty array to prevent errors.
        console.warn("Warning: Received empty or invalid line for numerical data. Returning empty array.");
        return [];
    }

    // Split the string by spaces, parse each part to an integer,
    // filter out any results that are not valid numbers (NaN),
    // and finally sort the resulting numbers in ascending order.
    return inputLineContent.split(" ")
        .map(strValue => {
            const trimmedValue = strValue.trim();
            return trimmedValue === '' ? NaN : parseInt(trimmedValue, 10); // Handle multiple spaces
        })
        .filter(num => !isNaN(num)) // Keep only valid numbers.
        .sort((valA, valB) => valA - valB); // Sort numerically in ascending order.
};

/**
 * Main function responsible for processing the input data and calculating
 * the total number of valid triplets (a, b, c) where a < b and c >= b.
 *
 * @param {string} rawInputString - The entire input data as a single string, typically from stdin.
 */
const processInputData = (rawInputString) => {
    // Input validation: ensure the raw input is a string.
    if (typeof rawInputString !== 'string') {
        console.error("Execution Error: The provided input must be a string.");
        return; // Terminate execution if input is of wrong type.
    }

    const inputLines = rawInputString.split("\n");

    // Expecting at least 4 lines: N (dataset size), and three sets of numbers.
    const EXPECTED_MIN_LINES = 4;
    if (inputLines.length < EXPECTED_MIN_LINES) {
        console.error(`Execution Error: Insufficient input lines. Expected at least ${EXPECTED_MIN_LINES}, received ${inputLines.length}.`);
        return;
    }

    // Extract and parse the initial dataset size (N).
    const initialDatasetSize = parseInt(inputLines[0].trim(), 10);
    if (isNaN(initialDatasetSize) || initialDatasetSize <= 0) {
        console.error("Execution Error: Invalid or non-positive dataset size 'N' provided.");
        return;
    }

    // Parse and sort the three distinct sets of numbers using the helper function.
    const upperNumbersCollection = parseAndSortNumericalData(inputLines[1]);
    const centralValuesCollection = parseAndSortNumericalData(inputLines[2]);
    const lowerNumbersCollection = parseAndSortNumericalData(inputLines[3]);

    // Initialize an accumulator for the final total count of valid triplets.
    let totalValidTripletsCount = 0;

    // Iterate through each number in the central collection.
    // This number 'currentCentralValue' acts as 'b' in the (a < b, c >= b) triplet condition.
    for (const currentCentralValue of centralValuesCollection) {
        // Step 1: Find how many numbers in 'upperNumbersCollection' are strictly less than 'currentCentralValue'.
        // The 'locateLowerBoundIndex' function directly provides this count.
        const countElementsSmallerInUpper = locateLowerBoundIndex(upperNumbersCollection, currentCentralValue);

        // Step 2: Find how many numbers in 'lowerNumbersCollection' are greater than or equal to 'currentCentralValue'.
        // This is calculated by subtracting the count of elements strictly less than 'currentCentralValue'
        // from the total number of elements in 'lowerNumbersCollection'.
        const countElementsGreaterOrEqualInLower = lowerNumbersCollection.length - locateLowerBoundIndex(lowerNumbersCollection, currentCentralValue);

        // Add the product of these two counts to the total accumulator.
        // Each such product represents the number of valid (a, c) pairs for the current 'b'.
        totalValidTripletsCount += countElementsSmallerInUpper * countElementsGreaterOrEqualInLower;
    }

    // Output the final calculated total.
    console.log(totalValidTripletsCount);
};

// Entry point for script execution:
// Reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it to the main processing function.
try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(fileContent);
} catch (ioError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("An unhandled error occurred during file I/O or initial data processing:", ioError.message);
    // Optionally, exit with a non-zero code to indicate failure.
    // process.exit(1);
}