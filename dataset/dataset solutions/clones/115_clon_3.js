const fileSystemModule = require('fs');

// Define the standard input file path as a constant.
const standardInputPath = '/dev/stdin';

// Read the raw input data from the specified path, decoding it as UTF-8.
const rawDataString = fileSystemModule.readFileSync(standardInputPath, 'utf8');

// Process the input string:
// 1. Trim any leading or trailing whitespace.
// 2. Split the string by one or more whitespace characters into an array of strings.
// 3. Convert each string element to a number.
// 4. Sort the resulting array of numbers in ascending order.
const numericValuesSorted = rawDataString.trim().split(/\s+/).map(Number).sort((valA, valB) => valA - valB);

// This array will store the frequency count for each number in `numericValuesSorted`.
// `elementFrequencies[i]` will hold the total occurrences of `numericValuesSorted[i]` in the original input.
let elementFrequencies = [];

// Initialize a Map to efficiently count the occurrences of each unique number.
const valueOccurrenceMap = new Map();

// Populate the `valueOccurrenceMap`: iterate through the sorted numbers
// and increment their respective counts.
for (const itemValue of numericValuesSorted) {
    valueOccurrenceMap.set(itemValue, (valueOccurrenceMap.get(itemValue) || 0) + 1);
}

// Reconstruct the `elementFrequencies` array.
// This array's structure is crucial: `elementFrequencies[idx]` corresponds to the frequency
// of `numericValuesSorted[idx]`. This matches the behavior of the original code's `mode` array.
for (const itemValue of numericValuesSorted) {
    elementFrequencies.push(valueOccurrenceMap.get(itemValue));
}

// Determine the highest frequency observed across all numbers at the beginning.
// Handle the case of an empty array to prevent `Math.max()` errors.
const globalMaxFrequency = elementFrequencies.length > 0 ? Math.max(...elementFrequencies) : -1;

// Initialize an offset variable that will be used to select elements for output.
// This offset increments with each value printed.
let currentOutputOffset = 1;

// Begin a loop to identify and print numbers based on the highest frequency logic.
// The loop continues as long as the initial `globalMaxFrequency` is still present
// as the highest frequency in the `elementFrequencies` array (which is dynamically modified).
while (true) {
    // Calculate the current highest frequency among the remaining elements in `elementFrequencies`.
    // If the array becomes empty, set to -1 to ensure loop termination.
    const currentHighestInRemaining = elementFrequencies.length > 0 ? Math.max(...elementFrequencies) : -1;

    // Check for termination conditions:
    // 1. If the initial `globalMaxFrequency` is no longer the highest in the modified array.
    // 2. If there are no more frequency counts left to process.
    if (globalMaxFrequency !== currentHighestInRemaining || elementFrequencies.length === 0) {
        break; // Exit the loop.
    }

    // Find the first index where the `currentHighestInRemaining` frequency appears
    // within the `elementFrequencies` array.
    const firstIndexOfHighestFreq = elementFrequencies.indexOf(currentHighestInRemaining);

    // Output the number from `numericValuesSorted` at a specific calculated index.
    // The index is determined by `firstIndexOfHighestFreq` (from the frequency array)
    // combined with the continuously incrementing `currentOutputOffset`.
    console.log(numericValuesSorted[firstIndexOfHighestFreq + currentOutputOffset++]);

    // Remove the found highest frequency entry from the `elementFrequencies` array.
    // This ensures that in the next iteration, a new highest frequency (or the next occurrence
    // of the same highest frequency) can be identified.
    elementFrequencies.splice(firstIndexOfHighestFreq, 1);
}

// The script finishes after the loop terminates.