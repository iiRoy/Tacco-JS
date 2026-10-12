var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data: trim whitespace and split into an array of lines.
var inputLines = (rawData.trim()).split("\n");

// The first line contains the number of ranges to process. Convert it to a number.
var numberOfRanges = inputLines.shift() - 0;

// Initialize an object to store frequency counts for numbers from 2 to 100001.
// All initial counts are set to zero.
var valueFrequencies = {};
for (var currentNumber = 2; currentNumber <= 100001; currentNumber++) {
    valueFrequencies[currentNumber] = 0;
}

// Iterate through each specified range.
for (var rangeIndex = 0; rangeIndex < numberOfRanges; rangeIndex++) {
    // Get the current range, split it by space, and convert parts to numbers.
    var rangeLimits = (inputLines.shift()).split(" ").map(Number);

    // For each number within the current range (inclusive), increment its frequency count.
    for (var intervalNumber = rangeLimits[0]; intervalNumber <= rangeLimits[1]; intervalNumber++) {
        valueFrequencies[intervalNumber]++;
    }
}

// Initialize a variable to track the highest frequency found so far.
var maximumFrequency = 1;

// Iterate through the numbers from 2 to 100001 to find the maximum frequency.
for (var checkedNumber = 2; checkedNumber <= 100001; checkedNumber++) {
    // If the frequency of the current number is less than the number itself, skip it.
    // This condition seems to be a specific requirement of the original problem.
    if (valueFrequencies[checkedNumber] < checkedNumber) {
        continue;
    }
    // Update the maximum frequency if the current number's frequency is higher.
    maximumFrequency = Math.max(maximumFrequency, valueFrequencies[checkedNumber]);
}

// Output the result, which is the maximum frequency minus one.
console.log(maximumFrequency - 1);
