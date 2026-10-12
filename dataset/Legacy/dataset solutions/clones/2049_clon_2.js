"use strict";

// This script processes numerical data from standard input to calculate specific values.

// Obtain raw input data from standard input, decode it as UTF-8, and remove any leading or trailing whitespace.
let inputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();

// The first line of the input data specifies the maximum possible value or the count of numbers to process.
let maximumValue = Number(inputData.split('\n')[0]);

// The second line of the input data contains a sequence of space-separated numbers.
// These are parsed into an array of numerical values.
let numberSequence = inputData.split('\n')[1].split(' ').map(Number);

// Initialize an array to store the frequency counts of each number.
// The size of this array is determined by 'maximumValue', and all elements are initially set to zero.
let frequencyCounts = (new Array(maximumValue)).fill(0);

// Iterate through the 'numberSequence' to populate the 'frequencyCounts' array.
// Numbers in the input are assumed to be 1-indexed, so we adjust to 0-indexed array positions.
for (let idx = 0; idx < maximumValue; idx++) {
    frequencyCounts[numberSequence[idx] - 1]++;
}

// Calculate the initial total number of pairs that can be formed from identical numbers.
// If a number appears 'n' times, it contributes n * (n - 1) / 2 pairs.
let totalPairs = 0;
frequencyCounts.forEach(count => {
    // Only consider numbers that appear at least twice to form a pair.
    if (count >= 2) {
        totalPairs += count * (count - 1) / 2;
    }
});

// For each number in the original 'numberSequence', calculate and output a modified total.
// This modification simulates removing one instance of the current number and recalculating the total pairs.
numberSequence.forEach(currentNum => {
    // The formula `totalPairs - frequencyCounts[currentNum - 1] + 1` effectively
    // subtracts the pairs formed by the current number's original frequency
    // and adds back the pairs formed by its frequency minus one.
    console.log(totalPairs - frequencyCounts[currentNum - 1] + 1);
});
