var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataLines = (rawData.trim()).split("\n"); // Split the input into an array of lines

// Process data until a zero sum is encountered
while (true) {
    // Extract the main sum for the current block
    let totalValue = dataLines.shift() - 0;

    // If the main sum is zero, terminate the processing loop
    if (totalValue === 0) {
        break;
    }

    // Initialize a variable to accumulate sub-values
    let currentSum = 0;

    // Loop nine times to sum up subsequent values
    for (let idx = 0; idx < 9; idx++) {
        currentSum += (dataLines.shift() - 0); // Add the next value from the array
    }

    // Output the difference between the main sum and the accumulated sub-sum
    console.log(totalValue - currentSum);
}
