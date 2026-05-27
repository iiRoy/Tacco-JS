let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream

const dataRows = rawData.trim().split('\n'); // Process the raw input: remove leading/trailing whitespace and split into an array of lines

const numberPairs = dataRows.map(function(currentRow) { // Iterate over each line to parse numerical data
    // For each line, split by comma and convert each resulting string segment into a number
    return currentRow.split(',').map(function(numStr) { return +numStr; });
});

let totalProductSum = numberPairs.reduce(function(accumulator, currentPair) { // Compute the sum of products for each pair
    // The accumulator stores the running total, and for each pair, we add the product of its first and second elements
    return accumulator + currentPair[0] * currentPair[1];
}, 0); // Initialize the accumulator with zero

let totalSecondElementSum = numberPairs.reduce(function(runningTotal, pairItem) { // Calculate the sum of all second elements
    // The runningTotal accumulates the value of the second element from each pair
    return runningTotal + pairItem[1];
}, 0); // Start the running total from zero

console.log(totalProductSum); // Display the final calculated sum of products
console.log(Math.round(totalSecondElementSum / numberPairs.length)); // Output the rounded average of the second elements
