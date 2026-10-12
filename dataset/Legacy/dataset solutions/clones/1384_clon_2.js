var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input
var dataRows = rawData.split('\n'); // Divide the raw input into an array of strings, one per line

// The first line is typically a count of subsequent items, but it's not used in this algorithm.
dataRows.shift();

// Initialize the variable that will hold the minimum value found.
// The second line of input (after the first shift) is used as the initial minimum.
var smallestValue = dataRows.shift();

// Declare a variable to temporarily store each entry from the input.
var currentEntry;

// Iterate through the remaining data rows.
// The loop continues as long as 'shift()' returns a non-empty string (truthy).
while (currentEntry = dataRows.shift()) {
    // Compare the current entry with the smallest value found so far.
    // String comparison is lexicographical.
    if (currentEntry < smallestValue) {
        // If the current entry is lexicographically smaller, update the smallestValue.
        smallestValue = currentEntry;
    }
}

// Output the final smallest value found to the console.
console.log(smallestValue);
