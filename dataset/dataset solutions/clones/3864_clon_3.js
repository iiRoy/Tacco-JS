"use strict";

// This script is designed to process a sequence of numbers
// and determine the count of specific sub-array sum patterns.
const processInputData = (rawInput) => {
    // Begin by standardizing the input string:
    // remove leading/trailing whitespace and split into lines.
    const inputLines = rawInput.trim().split("\n");

    // The first line provides the total number of elements in the sequence.
    const elementCount = parseInt(inputLines[0], 10);

    // The second line contains the space-separated numeric sequence.
    // Convert each string element to a numerical value.
    const numericSequence = inputLines[1].split(" ").map(Number);

    // A Map is used to efficiently store and retrieve the frequencies
    // of various cumulative sums encountered.
    const cumulativeSumFrequencies = new Map();

    // Initialize the current running sum to zero.
    // The sum before processing any elements is 0, and this
    // initial state needs to be accounted for in our frequencies.
    let currentCumulativeSum = 0;
    cumulativeSumFrequencies.set(0, 1); // Mark the initial sum of 0 as occurring once.

    // Iterate through each number in the sequence to build up
    // cumulative sums and update their frequencies.
    for (let idx = 0; idx < elementCount; idx++) {
        currentCumulativeSum += numericSequence[idx];
        // Increment the count for the current cumulative sum.
        // If it's a new sum, initialize its count to 1; otherwise, add one to its existing count.
        cumulativeSumFrequencies.set(
            currentCumulativeSum,
            (cumulativeSumFrequencies.get(currentCumulativeSum) || 0) + 1
        );
    }

    // Initialize a variable to accumulate the final count of valid pairs.
    let totalValidPairs = 0;

    // Now, iterate over the frequency counts of all cumulative sums.
    // For any sum that appeared 'C' times, it means there are C points
    // in the prefix sum array with that same value. The number of pairs
    // (i, j) where i < j and sum[i] == sum[j] is C * (C - 1) / 2.
    for (const frequency of cumulativeSumFrequencies.values()) {
        // Only frequencies greater than 1 contribute to pairs.
        if (frequency > 1) {
            totalValidPairs += (frequency * (frequency - 1)) / 2;
        }
    }

    // Output the final calculated number of pairs to the console.
    console.log(totalValidPairs);
};

// This block handles reading input from standard input, typically used
// in competitive programming environments.
// It reads the entire file content as a UTF-8 string and passes it
// to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));