let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The following line processes the raw input string:
// 1. `trim()` removes any leading or trailing whitespace.
// 2. `split("\n")` divides the string into an array of substrings, using the newline character as a delimiter.
// 3. `map(Number)` converts each string element in the resulting array into a numerical value.
const numericValues = (rawData.trim()).split("\n").map(Number);

let totalSum = 0; // Initialize a variable to store the cumulative sum of numbers.

// This loop iterates through the first ten elements of the `numericValues` array.
// The loop counter `idx` starts at 0 and increments by 1 in each iteration,
// continuing as long as `idx` is less than 10.
for (let idx = 0; idx < 10; idx++) {
    totalSum += numericValues[idx]; // Add the current array element's value to the `totalSum`.
}

// Print the final calculated sum to the standard output.
console.log(totalSum);
