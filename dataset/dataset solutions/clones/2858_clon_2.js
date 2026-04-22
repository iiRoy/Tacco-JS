"use strict"; // Enforce strict parsing rules for better code quality and error detection.

// This function serves as the primary entry point for processing the input data.
const ProcessInput = (sourceText) => {

    // First, preprocess the raw input string: remove leading/trailing whitespace
    // and then split it into an array of individual lines.
    let textRows = sourceText.trim().split('\n');

    // The second line of input is expected to contain a space-separated list of numbers.
    // These are parsed into an array of integers, ensuring a base-10 conversion.
    let numericValues = textRows[1].split(' ').map(elementStr => parseInt(elementStr, 10));

    // Initialize a variable to store the cumulative sum of all numbers.
    let aggregateValue = 0;

    // The first line of input (textRows[0]) is assumed to contain the count
    // of numbers to process from the 'numericValues' array.
    for (let loopIndex = 0; loopIndex < textRows[0]; loopIndex++) {
        // Add each number from the array to the running total.
        aggregateValue += numericValues[loopIndex];
    }

    // Calculate a threshold value, which is half of the total aggregated sum.
    let targetThreshold = aggregateValue / 2;

    // Initialize two separate sum accumulators. These will be used to partition
    // the numbers based on the calculated threshold.
    let firstSegmentSum = 0;
    let secondSegmentSum = 0;

    // Iterate through the numeric values again, applying the partitioning logic.
    for (let iterPos = 0; iterPos < textRows[0]; iterPos++) {
        // If the first sum is currently less than the threshold, add the
        // current number to it.
        if (firstSegmentSum < targetThreshold) {
            firstSegmentSum = numericValues[iterPos] + firstSegmentSum;
        }
        // If the first sum has already surpassed the threshold, then
        // add the current number to the second sum.
        else if (firstSegmentSum > targetThreshold) {
            secondSegmentSum = numericValues[iterPos] + secondSegmentSum;
        }
        // Note: If firstSegmentSum exactly equals targetThreshold, the current
        // number is not added to either sum in this specific iteration.
    }

    // Finally, compute and display the difference between the two partitioned sums.
    console.log(firstSegmentSum - secondSegmentSum);
};

// Invoke the main processing function. The input is read synchronously
// from standard input, encoded in UTF-8.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));