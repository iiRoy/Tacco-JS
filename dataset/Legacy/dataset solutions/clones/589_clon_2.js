var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input
// Process the raw input: remove leading/trailing whitespace and split into an array of lines
var dataLines = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Extract the first number from the data lines, converting it to a numeric type
    let totalValue = dataLines.shift() - 0;

    // If the extracted value is zero, terminate the loop
    if (totalValue === 0) {
        break;
    }

    // Initialize a variable to accumulate a sum of subsequent values
    let currentSum = 0;

    // Loop ten times to read and sum the next ten values
    for (let idx = 0; idx < 10; idx++) {
        // Extract the next number from the data lines and add it to the current sum
        currentSum += (dataLines.shift() - 0);
    }

    // Output the difference between the initial total value and the accumulated sum
    console.log(totalValue - currentSum);
}
