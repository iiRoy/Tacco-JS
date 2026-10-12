let inputValues = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/).sort(function(valA, valB) {
    // Custom comparison function to sort numeric strings as numbers
    return valA - valB;
});

// This block calculates a specific type of frequency count for each element.
// For each element at 'outerIndex', it counts how many times that element
// appears from 'outerIndex' to the end of the sorted 'inputValues' array.
let frequencyCounts = []; // Array to store these calculated counts.
let unusedCounter = 0;    // This variable is declared but not utilized in the original logic.
                          // It is kept for strict Type II structural preservation.

// Iterate through each element of the sorted input array.
for (let outerIndex = 0; outerIndex < inputValues.length; outerIndex++) {
    let currentCount = 1; // Initialize count for the current element (it counts itself).

    // Compare the current element with all subsequent elements in the array.
    for (let innerIndex = outerIndex + 1; innerIndex < inputValues.length; innerIndex++) {
        // If a duplicate is found, increment the count.
        if (inputValues[outerIndex] == inputValues[innerIndex]) {
            currentCount++;
        }
    }
    // Add the final count for inputValues[outerIndex] to our frequencyCounts array.
    frequencyCounts.push(currentCount);
}

// Determine the highest frequency value found in the 'frequencyCounts' array.
let peakFrequency = Math.max.apply(null, frequencyCounts);

// Initialize an offset factor. This factor will be used to adjust the index
// when retrieving values from 'inputValues' and will increment with each iteration.
let offsetFactor = 1;

// Continue looping as long as the current maximum value in 'frequencyCounts'
// is equal to the 'peakFrequency' initially determined.
// This loop effectively processes elements that had the highest frequency.
while (peakFrequency == Math.max.apply(null, frequencyCounts)) {
    // Find the index of the first occurrence of the current maximum frequency
    // within the 'frequencyCounts' array.
    let maxFreqIndex = frequencyCounts.indexOf(Math.max.apply(null, frequencyCounts));

    // Print the corresponding element from 'inputValues'.
    // The index is calculated by adding 'maxFreqIndex' and 'offsetFactor'.
    // 'offsetFactor' is incremented *after* its value is used in this expression.
    console.log(inputValues[maxFreqIndex + offsetFactor++]);

    // Remove the maximum frequency entry that was just processed from 'frequencyCounts'.
    // This ensures that in the next iteration, a new maximum (or the next instance
    // of the same maximum) can be found.
    frequencyCounts.splice(maxFreqIndex, 1);
}
