let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Obtain raw input from standard input and remove any leading/trailing whitespace.
const dataRows = rawData.split('\n'); // Divide the raw input string into an array of individual lines.

let totalValue = 0; // Initialize a variable to store the cumulative sum of numbers found.
let currentRow; // Declare a variable to temporarily hold each line during processing.

// Iterate through each line in the dataRows array, removing lines from the front.
while (currentRow = dataRows.shift()) {
    // Split the current line by any non-digit characters to extract potential number strings.
    const numStrings = currentRow.split(/\D+/);
    
    // Use the reduce method to sum up the numbers within the current line.
    // The unary plus operator (+currentNumStr) converts each string to a number.
    totalValue += numStrings.reduce(function(accumulator, currentNumStr) {
        return accumulator + +currentNumStr;
    }, 0); // Start the reduction with an initial sum of 0.
}

console.log(totalValue); // Display the final calculated total sum to the console.
