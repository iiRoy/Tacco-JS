// This script reads numerical pairs from standard input,
// sorts each pair, and prints the sorted pair.
// It terminates when it encounters a '0 0' pair.

// Read the entire input from /dev/stdin as a UTF-8 string.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input string into an array of lines, using newline as a delimiter.
var linesArray = rawData.split('\n');

// Iterate through each line in the array.
// The loop variable 'idx' is intentionally declared implicitly as a global for Type II.
for (idx = 0; idx < linesArray.length; idx++) {
    // Process the current line:
    // 1. Split the line by space to get string representations of numbers.
    // 2. Map each string to its numerical equivalent.
    var currentNumbers = linesArray[idx].split(' ').map(Number);

    // Extract the first and second numbers from the current pair.
    // These variables are intentionally declared implicitly as globals for Type II.
    firstVal = currentNumbers[0];
    secondVal = currentNumbers[1];

    // Check for the termination condition: if both numbers are zero.
    if (firstVal === 0 && secondVal === 0) {
        // If the condition is met, exit the loop.
        break;
    }

    // Sort the current pair of numbers in ascending order.
    // The 'sort' method modifies the array in place.
    // The comparison function (valA, valB) => valA - valB ensures numerical ascending sort.
    var sortedPair = currentNumbers.sort(function(valA, valB) {
        return valA - valB;
    });

    // Print the sorted pair to the console, with numbers joined by a single space.
    console.log(sortedPair.join(' '));
}
