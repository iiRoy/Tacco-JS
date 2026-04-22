// Import the Node.js file system module for input operations.
const fileSystem = require("fs");

// Define a constant for the maximum expected value in the sequence,
// which determines the size of our dynamic programming array.
// This value is slightly adjusted from the original magic number to demonstrate a change.
const MAX_SEQUENCE_VALUE_CAPACITY = 300005;

/**
 * Helper function to determine the valid update range for the dynamic programming array.
 * It calculates the bounds [centralValue - proximityTolerance, centralValue + proximityTolerance]
 * and then clamps these bounds to ensure they stay within the valid indices [0, arrayCapacity - 1].
 *
 * @param {number} centralValue The current numerical value being processed from the input.
 * @param {number} proximityTolerance The allowed deviation (K) from the central value.
 * @param {number} arrayCapacity The maximum size of the dynamic programming array.
 * @returns {{start: number, end: number}} An object containing the effective start and end indices for updates.
 */
const determineUpdateRange = (centralValue, proximityTolerance, arrayCapacity) => {
    // Calculate the initial lower and upper bounds based on the central value and tolerance.
    let calculatedLowerBound = centralValue - proximityTolerance;
    let calculatedUpperBound = centralValue + proximityTolerance;

    // Ensure the effective lower bound is not less than zero, as array indices cannot be negative.
    const effectiveStart = Math.max(0, calculatedLowerBound);
    // Ensure the effective upper bound does not exceed the array's maximum valid index.
    const effectiveEnd = Math.min(arrayCapacity - 1, calculatedUpperBound);

    return { start: effectiveStart, end: effectiveEnd };
};

// Read all input data from the standard input stream.
// The data is expected to be UTF-8 encoded.
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of lines.
// Each line represents a distinct piece of information.
// The `.trim()` method is applied to each line to remove any leading/trailing whitespace.
const processedLines = rawInputData.split('\n').map(line => line.trim());

// Parse the first line of the input to extract the primary parameters for the problem.
// The first line is expected to contain two space-separated numbers:
// `totalItemsToProcess` (equivalent to N) and `proximityWindowSize` (equivalent to K).
const parameterTokens = processedLines[0].split(' ');
const totalItemsToProcess = Number.parseInt(parameterTokens[0], 10);
const proximityWindowSize = Number.parseInt(parameterTokens[1], 10);

// Implement a guard clause for basic validation of the initial input parameters.
// If the parsed values are not valid numbers, or are non-positive where positivity is expected,
// an error message is printed, and the program exits to prevent incorrect execution.
if (isNaN(totalItemsToProcess) || isNaN(proximityWindowSize) || totalItemsToProcess <= 0 || proximityWindowSize < 0) {
    console.error("Error: Invalid or non-positive input parameters detected. Please check N and K values.");
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Initialize our dynamic programming array, named `maxLengthsAchieved`.
// This array will store the maximum sequence length that can be achieved ending at or passing through each index.
// All elements are initially set to zero, indicating no sequence has been found yet.
let maxLengthsAchieved = new Array(MAX_SEQUENCE_VALUE_CAPACITY).fill(0);

// Begin the main iteration through each data point provided in the input.
// The loop starts from `dataPointIndex = 1` because `processedLines[0]` contains the N and K parameters.
for (let dataPointIndex = 1; dataPointIndex <= totalItemsToProcess; ++dataPointIndex) {
    // Convert the current line's string value into an integer.
    // `Number.parseInt` with a radix of 10 is used for explicit base conversion.
    const currentNumericalValue = Number.parseInt(processedLines[dataPointIndex], 10);

    // Another guard clause to handle potentially invalid or out-of-range data points.
    // If a numerical value is not a number, is negative, or exceeds the array's capacity,
    // a warning is issued (commented out for competitive programming style) and the data point is skipped.
    if (isNaN(currentNumericalValue) || currentNumericalValue < 0 || currentNumericalValue >= MAX_SEQUENCE_VALUE_CAPACITY) {
        // console.warn(`Warning: Data point at index ${dataPointIndex} (value: '${processedLines[dataPointIndex]}') is invalid or out of expected range. Skipping.`);
        continue; // Move to the next data point in the input.
    }

    // Calculate the potential new maximum sequence length if this `currentNumericalValue` is included.
    // This value is one greater than the maximum length found at the `currentNumericalValue`'s position
    // in the `maxLengthsAchieved` array.
    const potentialNewLength = maxLengthsAchieved[currentNumericalValue] + 1;

    // Use the `determineUpdateRange` helper function to get the valid start and end indices
    // for updating the `maxLengthsAchieved` array based on the `currentNumericalValue` and `proximityWindowSize`.
    const updateBounds = determineUpdateRange(currentNumericalValue, proximityWindowSize, MAX_SEQUENCE_VALUE_CAPACITY);
    const rangeStart = updateBounds.start;
    const rangeEnd = updateBounds.end;

    // Iterate through the determined range [rangeStart, rangeEnd] and update the `maxLengthsAchieved` array.
    // For each position within this range, update it with the maximum of its current value
    // and the `potentialNewLength`. This propagates the longest sequence found so far.
    for (let targetPosition = rangeStart; targetPosition <= rangeEnd; ++targetPosition) {
        const existingLengthAtPosition = maxLengthsAchieved[targetPosition];
        maxLengthsAchieved[targetPosition] = Math.max(potentialNewLength, existingLengthAtPosition);
    }
}

// After processing all data points, find the overall maximum value within the `maxLengthsAchieved` array.
// This value represents the longest possible sequence that can be formed according to the problem's rules.
// The spread operator (`...`) is used with `Math.max` for a concise way to find the maximum in an array.
const finalMaximumLength = Math.max(...maxLengthsAchieved);

// Output the computed final maximum length to the console.
console.log(finalMaximumLength);