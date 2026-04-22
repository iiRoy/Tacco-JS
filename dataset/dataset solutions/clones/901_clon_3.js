const filesystemModule = require('node:fs');

// Define the path for standard input, promoting it to a constant.
const standardInputPath = '/dev/stdin';

// Read the entire raw data from the standard input stream as a UTF-8 string.
const rawInputBuffer = filesystemModule.readFileSync(standardInputPath, 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
let inputLinesContainer = rawInputBuffer.trim().split('\n');

// A robust check to ensure the input contains the expected number of lines for processing.
if (inputLinesContainer.length < 5) {
    console.error("Input data error: Expected at least 5 lines of input but received fewer.");
    process.exit(1); // Exit with an error code if input is malformed.
}

// Discard the first line, which often contains metadata like array sizes (not used here).
inputLinesContainer.shift();

// Parse the first set of numbers from the next line.
// Each string segment is converted to an integer, and the resulting array is sorted numerically.
const parsedNumbersA = inputLinesContainer.shift().split(' ').map(val => parseInt(val, 10));
parsedNumbersA.sort((num1, num2) => num1 - num2);

// Discard another line, acting as a separator or placeholder.
inputLinesContainer.shift();

// Parse the second set of numbers, which will be used as query values.
const queryValuesB = inputLinesContainer.shift().split(' ').map(val => Number(val));

// Parse the third set of numbers, representing comparison thresholds.
const comparisonThresholdsC = inputLinesContainer.shift().split(' ').map(val => parseFloat(val));

// Define the maximum expected value to size our lookup table.
// Using a constant makes this configurable and improves readability.
const MAX_POSSIBLE_VALUE = 1_000_000;

// Initialize a cache (lookup table) for prefix sums.
// All entries are initially set to `null` to signify that a sum for that index has not yet been computed.
const prefixSumCache = new Array(MAX_POSSIBLE_VALUE).fill(null);

// Explicitly set the prefix sum for the value 0 to be 0. This is a base case for cumulative sums.
prefixSumCache[0] = 0;

// Accumulator for calculating running totals.
let runningTotal = 0;

// Populate the prefix sum cache using the sorted `parsedNumbersA`.
// For each number in the sorted list, calculate the cumulative sum up to that number
// and store it at the corresponding index in the cache.
parsedNumbersA.forEach(currentNumber => {
    runningTotal += currentNumber;
    // Only store the sum if the current number is within the bounds of our cache.
    if (currentNumber >= 0 && currentNumber < MAX_POSSIBLE_VALUE) {
        prefixSumCache[currentNumber] = runningTotal;
    }
    // Numbers exceeding MAX_POSSIBLE_VALUE are implicitly not cached,
    // which aligns with the original code's fixed array size behavior.
});

// An array to collect the "Yes" or "No" results for each query.
const finalResults = [];

// Process each query value from `queryValuesB` against the `comparisonThresholdsC`.
queryValuesB.forEach((currentQueryVal, queryIndex) => {
    let effectiveQueryVal = currentQueryVal;

    // Search downwards from `currentQueryVal` until a cached prefix sum is found.
    // This loop continues as long as `effectiveQueryVal` is non-negative and its sum is `null` (not found).
    while (effectiveQueryVal >= 0 && prefixSumCache[effectiveQueryVal] === null) {
        effectiveQueryVal--;
    }

    // Determine the cumulative sum to use for the comparison.
    // If `effectiveQueryVal` became negative, it means no valid sum was found, so default to 0.
    const retrievedCumulativeSum = (effectiveQueryVal >= 0) ? prefixSumCache[effectiveQueryVal] : 0;

    // Retrieve the corresponding threshold for the current query.
    const currentThreshold = comparisonThresholdsC[queryIndex];

    // Compare the threshold with the retrieved cumulative sum and record the outcome.
    if (currentThreshold <= retrievedCumulativeSum) {
        finalResults.push("Yes");
    } else {
        finalResults.push("No");
    }
});

// Output all collected results, each on a new line.
console.log(finalResults.join('\n'));