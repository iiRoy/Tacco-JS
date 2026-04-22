const INPUT_FILE_LOCATION = '/dev/stdin'; // Standard input path for many online judges
const MAX_DATA_POINT_VALUE = 100001; // The maximum index relevant for our calculations
const DEFAULT_OCCURRENCE_COUNT = 1; // Initial count for each data point before processing ranges

// --- Module Imports and Setup ---
// Acquire the necessary module for file system operations.
const fileSystemAccess = require('fs');

let rawInputData;

// --- Input Acquisition Phase ---
// Attempt to read the entire content of the specified input file synchronously.
// This approach is common in competitive programming where execution speed and
// simple I/O are prioritized over asynchronous patterns.
try {
    rawInputData = fileSystemAccess.readFileSync(INPUT_FILE_LOCATION, 'utf8');
} catch (ioError) {
    // In a production environment, more sophisticated error logging would be used.
    // For this context, a simple console error and exit suffices.
    console.error("Failed to read input from source:", ioError.message);
    process.exit(1); // Terminate with an error code
}

// --- Data Preparation Phase ---
// Clean the raw input string: remove leading/trailing whitespace and
// split it into an array of individual lines.
const processedInputLines = rawInputData.trim().split("\n");

// Validate that there is at least one line of input to process.
if (processedInputLines.length === 0) {
    console.error("Input stream is empty. No data to process.");
    process.exit(1);
}

// Extract the first line, which denotes the total number of range update operations.
// Use parseInt for explicit conversion and radix specification.
const operationCountString = processedInputLines.shift();
let numberOfRangeOperations = parseInt(operationCountString, 10);

// Basic validation for the number of operations.
if (isNaN(numberOfRangeOperations) || numberOfRangeOperations < 0) {
    console.error("Invalid or non-positive operation count provided:", operationCountString);
    process.exit(1);
}

// --- Data Structure Initialization Phase ---
// Create an array to track the frequency or 'coverage' of each data point.
// The array size is `MAX_DATA_POINT_VALUE + 1` to accommodate indices from 0 up to MAX_DATA_POINT_VALUE.
const coverageTracker = new Array(MAX_DATA_POINT_VALUE + 1);

// Initialize all elements in the tracker array with the default occurrence count.
// This sets a baseline for all potential data points.
for (let currentElementIndex = 0; currentElementIndex <= MAX_DATA_POINT_VALUE; currentElementIndex++) {
    coverageTracker[currentElementIndex] = DEFAULT_OCCURRENCE_COUNT;
}

// --- Range Processing Phase ---
// Iterate through each range operation specified in the input.
for (let currentOperationIndex = 0; currentOperationIndex < numberOfRangeOperations; currentOperationIndex++) {
    // Implement a guard clause to handle cases where input lines might be fewer than expected.
    if (processedInputLines.length === 0) {
        console.warn(`Warning: Input ended prematurely. Expected ${numberOfRangeOperations} operations, but only processed ${currentOperationIndex}.`);
        break; // Exit the loop if no more input lines are available
    }

    const currentRangeDefinition = processedInputLines.shift();
    const boundaryStrings = currentRangeDefinition.split(" ");

    // Validate the format of the current range definition line.
    if (boundaryStrings.length !== 2) {
        console.warn(`Warning: Skipping malformed range definition "${currentRangeDefinition}". Expected two numbers.`);
        continue; // Move to the next operation
    }

    const rangeStart = parseInt(boundaryStrings[0], 10);
    const rangeEnd = parseInt(boundaryStrings[1], 10);

    // Perform comprehensive validation on the parsed range boundaries.
    if (isNaN(rangeStart) || isNaN(rangeEnd) ||
        rangeStart < 0 || rangeEnd > MAX_DATA_POINT_VALUE ||
        rangeStart > rangeEnd) {
        console.warn(`Warning: Skipping invalid or out-of-bounds range [${rangeStart}, ${rangeEnd}] from line "${currentRangeDefinition}".`);
        continue; // Move to the next operation
    }

    // Increment the coverage count for every data point within the specified range.
    for (let pointInScope = rangeStart; pointInScope <= rangeEnd; pointInScope++) {
        coverageTracker[pointInScope]++;
    }
}

// --- Result Calculation Phase ---
// Determine the largest index 'k' such that its coverage count (`coverageTracker[k]`)
// is greater than or equal to 'k' itself.
let largestSatisfyingIndex = DEFAULT_OCCURRENCE_COUNT; // Initialize to 1 as per problem's implied base case

// The problem condition typically starts checking from index 2.
// Indices 0 and 1 are usually not considered for the `arr[i] >= i` condition's active search.
for (let verificationIndex = 2; verificationIndex <= MAX_DATA_POINT_VALUE; verificationIndex++) {
    const currentCoverage = coverageTracker[verificationIndex];

    // If the coverage for this index meets the threshold, update our result.
    if (currentCoverage >= verificationIndex) {
        largestSatisfyingIndex = verificationIndex;
    }
}

// --- Output Phase ---
// The final output requirement is `max - 1`.
// If no index >= 2 satisfied the condition, `largestSatisfyingIndex` remains 1,
// resulting in an output of 0, which aligns with typical problem logic for this scenario.
const finalComputedResult = largestSatisfyingIndex - 1;
console.log(finalComputedResult);