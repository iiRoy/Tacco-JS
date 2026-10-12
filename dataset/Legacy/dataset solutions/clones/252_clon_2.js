var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Obtain raw input from standard input, decode as UTF-8, and remove leading/trailing whitespace.

var dataRows = rawData.split('\n'); // Divide the complete input string into an array of individual lines, using newline as a delimiter.

var totalValue = 0; // Initialize an accumulator variable to store the sum of all numbers.
var currentSegment; // Declare a variable to hold each line as it's processed.

// Loop through each line in the 'dataRows' array until it's empty.
while (currentSegment = dataRows.shift()) {
    // For the current line, split it into an array of strings, using any non-digit character as a separator.
    var numericParts = currentSegment.split(/\D+/);

    // Use the 'reduce' method to sum all numeric values within the 'numericParts' array.
    // The result of this sum is then added to 'totalValue'.
    totalValue += numericParts.reduce(function(previousSum, currentNumberString) {
        // Convert the current string segment to a number before adding it to the running sum.
        return previousSum + (+currentNumberString);
    }, 0); // The reduction starts with an initial sum of zero.
}

// Display the final calculated total sum to the console.
console.log(totalValue);
