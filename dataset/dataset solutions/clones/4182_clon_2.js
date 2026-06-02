// Read input from standard input, decode as UTF-8, and split by newline characters.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Extract the first line, split it by space to get N and K.
const firstLineParts = inputLines.shift().split(' ');

// Assign the first part to totalElements (N) and the second to targetUniqueCount (K).
const totalElements = firstLineParts[0];
const targetUniqueCount = firstLineParts[1];

// Extract the second line, split it by space to get the array of element values.
const elementValues = inputLines.shift().split(' ');

// Initialize an object to track unique elements encountered.
const uniqueTracker = {};

// Initialize a sparse array to store the frequency of each element.
const frequencyMap = [];

// Iterate through the elementValues array to populate frequencyMap and uniqueTracker.
for (let idx = 0; idx < totalElements; idx++) {
    // Increment the count for the current element in frequencyMap.
    // If the element hasn't been seen before, its count starts at 0.
    frequencyMap[elementValues[idx]] = (frequencyMap[elementValues[idx]] || 0) + 1;
    // Mark the current element as seen in uniqueTracker.
    uniqueTracker[elementValues[idx]] = 1;
}

// Get an array of distinct keys (elements) from the uniqueTracker object.
const distinctKeys = Object.keys(uniqueTracker);

// Calculate the number of unique elements that need to be removed.
// This is the difference between the current number of unique elements and the target.
let excessUniqueCount = distinctKeys.length - targetUniqueCount;

// Check if there are more unique elements than allowed.
if (excessUniqueCount > 0) {
    // If so, sort the frequencyMap. This will sort the non-empty frequency values in ascending order.
    // Empty slots will be treated as undefined and moved to the end.
    frequencyMap.sort((valA, valB) => {
        // Handle undefined values which come from sparse array slots.
        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return 1; // Undefined goes to the end
        if (valB === undefined) return -1; // Undefined goes to the end
        return valA - valB; // Sort numbers ascending
    });

    // Initialize a variable to accumulate the sum of frequencies of elements to be removed.
    let sumOfFrequencies = 0;

    // Iterate through the sorted frequencies.
    // We want to remove elements with the lowest frequencies first.
    for (const currentFrequency of frequencyMap) {
        // Skip undefined values which are empty slots from the sparse array.
        if (currentFrequency === undefined) {
            continue;
        }
        // Add the current frequency to the sum.
        sumOfFrequencies += currentFrequency;
        // Decrement the count of unique elements we still need to remove.
        excessUniqueCount--;
        // If we have removed enough unique elements, break the loop.
        if (excessUniqueCount === 0) {
            break;
        }
    }
    // Output the total count of elements that need to be removed.
    console.log(sumOfFrequencies);
} else {
    // If the number of unique elements is already K or less, no elements need to be removed.
    console.log(0);
}
