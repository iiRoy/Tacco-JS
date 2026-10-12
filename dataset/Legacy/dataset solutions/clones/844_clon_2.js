let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream.

let lineSegments = (rawData.trim()).split("\n"); // Process the raw input into an array of lines.

let numOperations = parseInt(lineSegments.shift(), 10); // Extract the first line as the count of subsequent operations.

let frequencyCounts = []; // Initialize an array to track frequencies.
for (let idx = 0; idx <= 100001; idx++) {
    frequencyCounts[idx] = 1; // Set initial frequency for each number to one.
}

// Iterate through the specified number of operations.
for (let idx = 0; idx < numOperations; idx++) {
    let rangeBounds = (lineSegments.shift()).split(" ").map(Number); // Parse the current line for range boundaries.
    let startVal = rangeBounds[0]; // Extract the starting value of the range.
    let endVal = rangeBounds[1]; // Extract the ending value of the range.

    // Increment the frequency for each number within the current range.
    for (let currentNum = startVal; currentNum <= endVal; currentNum++) {
        frequencyCounts[currentNum]++;
    }
}

let largestCandidate = 1; // Initialize a variable to store the largest qualifying number.

// Iterate from 2 up to the maximum possible number to find the largest candidate.
for (let idx = 2; idx <= 100001; idx++) {
    // If a number's frequency count is greater than or equal to the number itself,
    // it becomes the new largest candidate.
    if (frequencyCounts[idx] >= idx) {
        largestCandidate = idx;
    }
}

// Output the final result, which is one less than the largest candidate found.
console.log(largestCandidate - 1);
