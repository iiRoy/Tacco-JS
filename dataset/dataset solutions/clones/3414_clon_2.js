let resultValue = -1; // Initialize the variable to store the minimum difference found

// Read the entire content of '/dev/stdin' as a UTF-8 string
// Then, split the content into an array of strings based on newline characters
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.split("\n");

// Extract the window size 'k' from the second element of the first line
// The '~~' operator is used for a fast integer conversion (equivalent to Math.floor for positive numbers)
let windowSize = ~~inputLines[0].split(" ")[1];

// Remove the first line from the array as it has been processed
inputLines.shift();

// Convert each remaining line string to a number and then sort the array in ascending order
inputLines = inputLines.map(numStr => Number(numStr)).sort((valA, valB) => valA - valB);

// Iterate through the sorted array to find the smallest difference between elements
// that are 'windowSize - 1' positions apart (i.e., within a window of size 'windowSize')
for (let idx = 0; idx < inputLines.length - windowSize + 1; idx++) {
    // Calculate the difference between the last and first elements of the current window
    let currentDifference = inputLines[idx + windowSize - 1] - inputLines[idx];

    // If this is the first difference calculated, set it as the initial minimum
    if (resultValue === -1) {
        resultValue = currentDifference;
    }

    // If the current difference is smaller than the previously recorded minimum, update the minimum
    if (currentDifference < resultValue) {
        resultValue = currentDifference;
    }
}

// Print the final minimum difference to the console
console.log(resultValue);
