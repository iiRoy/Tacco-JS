const fileSystem = require('fs');

const LARGE_NUMBER_BASE = 1000000000;
const MAX_LOOKUP_VALUE = 1000000; // Corresponds to the maximum value an element can take

/**
 * Utility function to safely convert a string to an integer.
 * @param {string} text - The string to be converted.
 * @returns {number} The parsed integer.
 */
const parseNumericString = (text) => parseInt(text, 10);

/**
 * Reads all lines from standard input, trims whitespace, and splits them into an array.
 * @returns {string[]} An array of strings, where each string is a line from the input.
 */
const obtainRawInputLines = () => {
    const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    return rawContent.trim().split('\n');
};

// Start processing the input.
let allInputLines = obtainRawInputLines();

// The first line is usually a count for the first array, but its value is not used in the logic.
// We consume it to advance to the next relevant line.
const primaryNumbersCount = parseNumericString(allInputLines.shift());

// The second line contains space-separated numbers for the primary set.
const primaryDataset = allInputLines.shift().split(' ').map(parseNumericString);

// Sort the primary dataset in ascending order. This is crucial for calculating cumulative sums correctly.
primaryDataset.sort((a, b) => a - b);

// The third line is typically a count for the query array, also consumed but not used.
const queryValuesCount = parseNumericString(allInputLines.shift());

// The fourth line holds the space-separated query values.
const queryDataset = allInputLines.shift().split(' ').map(parseNumericString);

// The fifth line contains space-separated string representations of large numbers for comparison.
const comparisonTargetStrings = allInputLines.shift().split(' ');

// Initialize a map (array) to store cumulative sums.
// Each entry at index 'k' will store the cumulative sum up to 'k' from `primaryDataset`.
// Values are stored as [high_part, low_part] to handle large numbers.
// Initialize with `null` to indicate no sum has been calculated for that index yet.
const cumulativeSumMap = new Array(MAX_LOOKUP_VALUE).fill(null);

// The cumulative sum up to 0 is always [0, 0].
cumulativeSumMap[0] = [0, 0];

// A temporary variable to hold the current running cumulative sum during iteration.
let currentRunningSum = [0, 0]; // Format: [high_part, low_part]

// Iterate through the sorted primary dataset to populate the cumulative sum map.
primaryDataset.forEach((value) => {
    currentRunningSum[1] += value; // Add current number to the low part.

    // If the low part overflows the defined base (10^9), carry over to the high part.
    if (currentRunningSum[1] >= LARGE_NUMBER_BASE) {
        currentRunningSum[0]++; // Increment high part.
        currentRunningSum[1] -= LARGE_NUMBER_BASE; // Adjust low part.
    }
    // Store a *copy* of the current cumulative sum. Using slice() ensures independence.
    cumulativeSumMap[value] = currentRunningSum.slice();
});

/**
 * Parses a string representing a large number into its high and low parts.
 * The low part is assumed to be the last 9 digits.
 * @param {string} numberString - The string to parse.
 * @returns {number[]} An array [high_part, low_part].
 */
const decomposeLargeNumberString = (numberString) => {
    const lowPartDigits = 9;
    const totalLength = numberString.length;

    if (totalLength <= lowPartDigits) {
        // If the string is short, it's entirely the low part.
        return [0, parseNumericString(numberString)];
    }

    const highPartSubstr = numberString.substring(0, totalLength - lowPartDigits);
    const lowPartSubstr = numberString.substring(totalLength - lowPartDigits);

    return [parseNumericString(highPartSubstr), parseNumericString(lowPartSubstr)];
};

/**
 * Compares two large numbers (represented as [high_part, low_part] arrays).
 * @param {number[]} numX - The first large number.
 * @param {number[]} numY - The second large number.
 * @returns {boolean} True if numX is less than or equal to numY, false otherwise.
 */
const compareBigNumbers = (numX, numY) => {
    if (numX[0] < numY[0]) {
        return true; // High part of X is smaller.
    }
    if (numX[0] === numY[0]) {
        return numX[1] <= numY[1]; // High parts are equal, compare low parts.
    }
    return false; // High part of X is larger.
};

// Iterate through each query value and its corresponding target string.
queryDataset.forEach((currentQueryValue, queryIndex) => {
    let effectiveLookupKey = currentQueryValue;

    // Find the largest key in `cumulativeSumMap` that is less than or equal to `effectiveLookupKey`
    // and has a non-null entry. This handles cases where `currentQueryValue` itself might not be
    // present in the `primaryDataset`.
    while (effectiveLookupKey >= 0 && cumulativeSumMap[effectiveLookupKey] === null) {
        effectiveLookupKey--;
    }

    // Retrieve the cumulative sum. If `effectiveLookupKey` became negative, default to [0, 0].
    // (This scenario should ideally be prevented by the problem constraints or `cumulativeSumMap[0]` initialization).
    const retrievedCumulativeSum = (effectiveLookupKey >= 0)
        ? cumulativeSumMap[effectiveLookupKey]
        : [0, 0]; // Fallback, though 0 should always be initialized.

    // Parse the current target string into its high and low components.
    const targetBigNumber = decomposeLargeNumberString(comparisonTargetStrings[queryIndex]);

    // Determine the result of the comparison.
    const outcomeMessage = compareBigNumbers(targetBigNumber, retrievedCumulativeSum) ? "Yes" : "No";

    // Output the comparison result for the current query.
    console.log(outcomeMessage);
});