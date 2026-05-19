process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section handles input processing from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Clean up the input: remove leading/trailing whitespace and convert to an array of numbers.
rawData = rawData.trim().split('\n').map(Number);

// The first element of the processed input is a specific limit value.
let limitVal = rawData[0];
// The rest of the input forms the sequence of numbers to be processed.
let numberSequence = rawData.slice(1);

// Initialize a variable to store the maximum difference found.
let maxDifference = 0;

// Iterate through the number sequence using an outer loop.
for (let outerIndex = 0; outerIndex < numberSequence.length; outerIndex++) {
    // If the current outer index plus one equals the limit value,
    // it means we've reached a specific condition to stop further processing.
    if (outerIndex + 1 === limitVal) {
        break; // Exit the outer loop.
    }

    // Use an inner loop to compare the current number with every other number in the sequence.
    for (let innerIndex = 0; innerIndex < numberSequence.length; innerIndex++) {
        // Skip comparison if the indices are the same (a number compared with itself).
        if (outerIndex === innerIndex) {
            continue; // Move to the next iteration of the inner loop.
        }

        // Calculate the difference between the number at the outer index and the number at the inner index.
        let currentDiff = numberSequence[outerIndex] - numberSequence[innerIndex];

        // Update the maximum difference if the current calculated difference is greater.
        if (maxDifference < currentDiff) {
            maxDifference = currentDiff;
        }
    }
}

// Output the final maximum difference found to the console.
console.log(maxDifference);
