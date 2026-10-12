let totalSum = 0; // Initialize a variable to accumulate the sum of numbers.

// Read the entire content of standard input as a UTF-8 string.
// Then, use a regular expression to find all sequences of one or more digits.
// The 'g' flag ensures all matches are found, not just the first.
require("fs").readFileSync("/dev/stdin", "utf8").match(/\d+/g).forEach(function(currentNumberString) {
    // For each string that matches a number, convert it to an integer (base 10).
    // Add this integer value to our running total.
    totalSum += parseInt(currentNumberString, 10);
});

// After processing all numbers, print the final accumulated sum to the console.
console.log(totalSum);
