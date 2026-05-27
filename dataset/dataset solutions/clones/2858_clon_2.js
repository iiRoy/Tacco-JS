"use strict";

// This function serves as the primary entry point for processing input data.
const ProcessInput = (rawData) => {
    // First, the raw input string is cleaned up by removing leading/trailing whitespace,
    // and then split into an array of individual lines based on newline characters.
    let lines = rawData.trim().split('\n');

    // The second line of the input (index 1) is expected to contain a space-separated
    // list of numbers. This line is split into individual string numbers, and then
    // each string is converted into an integer using `parseInt` with a radix of 10.
    let numbersArray = lines[1].split(' ').map(val => parseInt(val, 10));

    // A variable is initialized to accumulate the sum of all numbers.
    let totalSum = 0;

    // The first line of input (index 0) is expected to be the count of numbers.
    // This loop iterates through the `numbersArray` to calculate the grand total.
    // `parseInt` is used here to explicitly convert the string count to an integer.
    for (let idx = 0; idx < parseInt(lines[0], 10); idx++) {
        totalSum += numbersArray[idx];
    }

    // Calculate a target value, which is half of the total sum.
    // This value will be used to guide the partitioning logic.
    let halfSum = totalSum / 2;

    // Initialize two accumulator variables for the two partitions.
    // These will store the sums of numbers assigned to each partition.
    let partitionOneSum = 0;
    let partitionTwoSum = 0;

    // This loop iterates through the `numbersArray` again to distribute its elements
    // into two conceptual partitions based on the `halfSum` target.
    for (let loopIndex = 0; loopIndex < parseInt(lines[0], 10); loopIndex++) {
        // If the current sum of the first partition is less than the target `halfSum`,
        // the current number from `numbersArray` is added to `partitionOneSum`.
        if (partitionOneSum < halfSum) {
            partitionOneSum = numbersArray[loopIndex] + partitionOneSum;
        }
        // Otherwise, if the current sum of the first partition is strictly greater than `halfSum`,
        // the current number is added to `partitionTwoSum`.
        // Note: If `partitionOneSum` is exactly equal to `halfSum`, the current number
        // `numbersArray[loopIndex]` is not added to either partition, effectively being skipped.
        else if (partitionOneSum > halfSum) {
            partitionTwoSum = numbersArray[loopIndex] + partitionTwoSum;
        }
    }

    // Finally, the difference between the two partition sums is calculated and printed to the console.
    console.log(partitionOneSum - partitionTwoSum);
};

// The program reads its input from standard input, assuming UTF-8 encoding,
// and then passes this raw string data to the `ProcessInput` function for execution.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
