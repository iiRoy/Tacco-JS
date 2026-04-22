const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

// Retrieve all raw input data from the designated file path
let rawInputDataContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and segment into individual lines
let inputLineBuffer = rawInputDataContent.trim().split("\n");

// A control flag to manage the primary data processing loop's execution
let continueProcessing = true;

// Commence the main loop for processing data sets
while (continueProcessing) {
    // Extract the next line from the buffer, which is expected to contain the "count" or termination signal
    let lineForCountCheck = inputLineBuffer.shift();

    // Guard clause: If no more lines are available, terminate processing gracefully
    if (lineForCountCheck === undefined) {
        continueProcessing = false;
        continue;
    }

    // Attempt to parse the first numeric value from the "count" line
    let countValue = parseInt(lineForCountCheck.trim(), 10);

    // Guard clause: If the parsed "count" value is not a valid number, skip this malformed input block
    if (isNaN(countValue)) {
        continue; // Proceed to the next iteration, effectively skipping this bad line
    }

    // Check for the termination condition: a "count" of zero signals the end of input
    if (countValue === 0) {
        continueProcessing = false; // Set flag to exit the loop
        continue; // Immediately proceed to check the loop condition
    }

    // Retrieve the subsequent line, which is expected to contain the actual sequence of numbers
    let numericSequenceLine = inputLineBuffer.shift();

    // Guard clause: If the numeric sequence line is unexpectedly missing, terminate processing
    if (numericSequenceLine === undefined) {
        continueProcessing = false;
        continue;
    }

    // Transform the string of space-separated numbers into an array of actual numeric values.
    // Filters out any empty strings that might result from multiple spaces before mapping to Number.
    let currentNumericData = numericSequenceLine
                                .trim()
                                .split(" ")
                                .filter(segment => segment !== '')
                                .map(Number);

    // Guard clause: If there are fewer than two numbers, a minimum difference cannot be calculated.
    // Output 0 as a default for such cases and move to the next data set.
    if (currentNumericData.length < 2) {
        console.log(0);
        continue;
    }

    // Arrange the numbers in ascending order to facilitate finding the smallest adjacent difference
    currentNumericData.sort((firstVal, secondVal) => {
        if (firstVal < secondVal) return -1;
        if (firstVal > secondVal) return 1;
        return 0; // Values are equal
    });

    // Initialize the minimum difference with the absolute difference of the first two sorted elements
    let minimumObservedGap = Math.abs(currentNumericData[0] - currentNumericData[1]);

    // Iterate through the sorted array, starting from the second element, to find the minimum absolute difference
    // between each adjacent pair. This replaces the reduce method for more explicit control.
    for (let i = 1; i < currentNumericData.length - 1; i++) {
        let currentElement = currentNumericData[i];
        let nextElement = currentNumericData[i + 1];

        // Compute the absolute difference between the current element and its successor
        let adjacentDifference = Math.abs(currentElement - nextElement);

        // Update the overall minimum gap if the newly calculated difference is smaller
        minimumObservedGap = Math.min(minimumObservedGap, adjacentDifference);

        // Optimization: If a zero difference is found, it's the absolute minimum possible, so no need to continue
        if (minimumObservedGap === 0) {
            break;
        }
    }

    // Display the smallest difference identified for the current set of numbers
    console.log(minimumObservedGap);
}
// End of script execution.