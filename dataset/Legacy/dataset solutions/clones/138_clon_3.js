const fileSystem = require("fs");

const processInputSegment = (inputLineSegment) => {
    const stringValues = inputLineSegment.split(',');

    // Explicitly convert all string values to numbers.
    // The original code relied on implicit type coercion.
    const numericValues = stringValues.map(Number);

    let currentResultIndex = 0;
    let iterationCounter = 0;
    let runningCumulativeSum = 0;

    // Define a constant for the loop limit to improve readability.
    const initialLoopLimit = 10;

    // First processing loop: Calculate negative cumulative sums
    // and store them back into the array.
    for (iterationCounter = 0; iterationCounter < initialLoopLimit; iterationCounter++) {
        runningCumulativeSum = runningCumulativeSum - numericValues[iterationCounter];
        numericValues[iterationCounter] = runningCumulativeSum;
    }

    // Extract the divisor and scaling factor calculation into temporary variables.
    const denominator = -numericValues[10] - numericValues[11];
    const scalingMultiplier = numericValues[10] / denominator;

    // Apply the scaling factor to the accumulated sum.
    runningCumulativeSum = runningCumulativeSum * scalingMultiplier;

    // Second processing loop: Find the first index where the condition is met.
    // Rewritten from a for loop to a while loop for structural variation.
    while (numericValues[currentResultIndex] > -runningCumulativeSum) {
        currentResultIndex++;
    }

    // The original code increments 'n' before logging.
    // We do the same here for 'currentResultIndex'.
    return ++currentResultIndex;
};

// Read the entire standard input, trim whitespace, and split by any whitespace.
const rawInputContent = fileSystem.readFileSync("/dev/stdin", 'utf8');
const cleanedInput = rawInputContent.trim();
const inputSegmentsArray = cleanedInput.split(/\s/);

// Process each segment and print the result.
// Using map to transform segments and then forEach to log,
// which is functionally equivalent to the original's direct console.log in map.
inputSegmentsArray.map(processInputSegment).forEach(outputValue => console.log(outputValue));
