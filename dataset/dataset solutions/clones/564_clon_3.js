function calculateMaxWindowSum(sequenceOfNumbers, windowLength) {
    // Validate primary inputs to ensure robust operation.
    if (!Array.isArray(sequenceOfNumbers) || sequenceOfNumbers.length === 0) {
        console.error("Input validation failed: 'sequenceOfNumbers' must be a non-empty array.");
        return;
    }
    if (typeof windowLength !== 'number' || windowLength <= 0 || windowLength > sequenceOfNumbers.length) {
        console.error("Input validation failed: 'windowLength' must be a positive integer not exceeding the sequence length.");
        return;
    }

    // This array will store all calculated "window" sums.
    const computedWindowTotals = [];

    // Determine the upper bound for the main loop, based on the original algorithm's behavior.
    const maxIterationCount = sequenceOfNumbers.length - windowLength;

    // A flag to differentiate the initial window sum calculation from subsequent sliding calculations.
    let isFirstIterationCompleted = false;

    // Variable to hold the sum of the current "window" as it slides.
    let currentWindowAccumulatedSum = 0;

    // Iterate through the sequence to compute sums for each defined "window".
    for (let currentWindowPosition = 0; currentWindowPosition < maxIterationCount; currentWindowPosition++) {
        // The first "window" sum is calculated directly.
        if (!isFirstIterationCompleted) {
            let initialSegmentSum = 0;
            // The original logic sums elements from index (currentWindowPosition + 1) to (currentWindowPosition + windowLength).
            // For currentWindowPosition = 0, this is elements from index 1 to windowLength.
            for (let offsetIndex = 1; offsetIndex <= windowLength; offsetIndex++) {
                initialSegmentSum += sequenceOfNumbers[currentWindowPosition + offsetIndex];
            }
            currentWindowAccumulatedSum = initialSegmentSum;
            isFirstIterationCompleted = true; // Mark the first calculation as done.
        } else {
            // For subsequent "windows", the sum is derived from the previous sum using a specific recurrence.
            // S_k = S_{k-1} - arr[k-1] + arr[k+len]
            // Where:
            // S_{k-1} is computedWindowTotals[currentWindowPosition - 1]
            // arr[k-1] is sequenceOfNumbers[currentWindowPosition - 1] (element "leaving" the conceptual window)
            // arr[k+len] is sequenceOfNumbers[currentWindowPosition + windowLength] (element "entering" the conceptual window)
            currentWindowAccumulatedSum = computedWindowTotals[currentWindowPosition - 1] -
                                         sequenceOfNumbers[currentWindowPosition - 1] +
                                         sequenceOfNumbers[currentWindowPosition + windowLength];
        }
        // Add the current "window" sum to our collection.
        computedWindowTotals.push(currentWindowAccumulatedSum);
    }

    // If no sums were computed (e.g., due to array length or window size), issue a warning.
    if (computedWindowTotals.length === 0) {
        console.warn("No window sums were successfully computed. Please review the input parameters.");
        return;
    }

    // Sort the collected sums in descending order to easily retrieve the maximum value.
    // Using an arrow function for conciseness (Type II change).
    computedWindowTotals.sort((valueA, valueB) => valueB - valueA);

    // Retrieve the highest sum, which is now the first element after sorting.
    const topCalculatedSum = computedWindowTotals[0];

    // Output the result as per original functionality.
    console.log(topCalculatedSum);
}


// --- Main Program: Input Processing and Function Invocation ---

// Import the 'fs' module to read from the filesystem (standard input).
// Renamed 'input' to 'rawInputContent' for clarity.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines.
// Renamed 'Arr' to 'inputLineRecords'.
const inputLineRecords = rawInputContent.trim().split("\n");

// Variables to hold the current sequence of numbers and the desired window size.
// Renamed 'a' to 'currentNumericSequence' and 'b' to 'desiredWindowSize'.
let currentNumericSequence = [];
let desiredWindowSize = 0;

// Flag to track if any data set has been processed and triggered a calculation.
let hasAnyDataSetBeenProcessed = false;

// Iterate through each line of the input data.
// Renamed 'i' to 'lineParseIndex'.
for (let lineParseIndex = 0; lineParseIndex < inputLineRecords.length; lineParseIndex++) {
    const activeLineText = inputLineRecords[lineParseIndex];

    // Type III addition: Skip lines that are empty or contain only whitespace.
    if (!activeLineText.trim()) {
        continue;
    }

    // Type III addition: Handle the termination signal ("0 0") explicitly and early.
    if (activeLineText === "0 0") {
        // Before breaking, ensure that if there's a pending valid dataset, it gets processed.
        if (hasAnyDataSetBeenProcessed && currentNumericSequence.length > 0 && !isNaN(desiredWindowSize) && desiredWindowSize > 0) {
            calculateMaxWindowSum(currentNumericSequence, desiredWindowSize);
        }
        break; // Exit the input processing loop.
    }

    // Parse the numbers from the current line.
    // Type III change: Use explicit Number() conversion and filter out invalid entries.
    const parsedLineValues = activeLineText.split(" ").map(segment => {
        const numericValue = Number(segment);
        if (isNaN(numericValue)) {
            console.warn(`Warning: Encountered non-numeric data "${segment}" on line ${lineParseIndex + 1}. This value will be ignored.`);
            return null; // Invalid number marker.
        }
        return numericValue;
    }).filter(val => val !== null); // Remove any nulls resulting from invalid numbers.

    // Type III addition: Skip lines that result in no valid numbers after parsing.
    if (parsedLineValues.length === 0) {
        console.warn(`Skipping line ${lineParseIndex + 1} due to no valid numeric content after parsing.`);
        continue;
    }

    // Determine if the current line is a "control line" (defining a new sequence and window size).
    // The original logic considers lines with two numbers OR the very last line as control lines.
    const isControlLineForDataSet = (parsedLineValues.length === 2 || lineParseIndex === inputLineRecords.length - 1);

    if (isControlLineForDataSet) {
        // If it's not the very first control line and there's a valid sequence accumulated,
        // call the main calculation function with the *previous* dataset.
        // The `lineParseIndex !== 0` replicates the original `if(i!=0)` condition.
        if (lineParseIndex !== 0 && currentNumericSequence.length > 0 && !isNaN(desiredWindowSize) && desiredWindowSize > 0) {
            calculateMaxWindowSum(currentNumericSequence, desiredWindowSize);
            hasAnyDataSetBeenProcessed = true; // Mark that a calculation has occurred.
        }

        // Reset for the new dataset.
        currentNumericSequence = [];
        // Replicate original `Line[1]-0` behavior, which can result in NaN if `parsedLineValues[1]` is undefined.
        desiredWindowSize = parsedLineValues[1] - 0;
    } else {
        // This is a data line containing a single number to be added to the current sequence.
        if (parsedLineValues.length === 1) { // Ensure it's truly a single number.
            currentNumericSequence.push(parsedLineValues[0]);
        } else {
            console.warn(`Skipping unexpected line format: "${activeLineText}". Expected a single number or two numbers.`);
        }
    }
}

// Note: No explicit post-loop `calculateMaxWindowSum` call is needed here.
// The original logic handles the processing of the last dataset either when a new control line is encountered
// (including "0 0") or when the loop reaches its end, processing the *previous* dataset before resetting.
// The `0 0` check and the `isControlLineForDataSet` condition within the loop already cover these scenarios.