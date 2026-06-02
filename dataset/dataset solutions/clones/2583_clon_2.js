const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input

// Split the raw input into individual lines
const dataRows = rawData.split('\n');

// Extract the first line, split by space, to get N and K
const firstRowParts = dataRows.shift().split(' ');

// Convert N and K to numbers
const sequenceLength = firstRowParts[0] * 1; // N: length of the sequence
const maxChanges = firstRowParts[1] * 1;   // K: maximum allowed changes

// Get the character sequence from the next line
const charSequence = dataRows.shift();

// Initialize a counter for character differences
let diffCount = 0;

// Store the first character to compare against
let previousChar = charSequence[0];

// Iterate through the sequence starting from the second character
for (let idx = 1; idx < sequenceLength; idx++) {
    // If the current character is different from the previous one
    if (previousChar !== charSequence[idx]) {
        diffCount++; // Increment the difference counter
        previousChar = charSequence[idx]; // Update the previous character
    }
}

// Calculate the reduction value based on differences and max changes
let reductionValue = diffCount - (2 * maxChanges);

// Ensure the reduction value is not negative
if (reductionValue < 1) {
    reductionValue = 0;
}

// Output the final calculated result
console.log(sequenceLength - 1 - reductionValue);
