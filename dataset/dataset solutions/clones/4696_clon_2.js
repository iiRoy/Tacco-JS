'use strict';

// Acquire raw data from the standard input stream
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the initial line of input into a numerical upper limit
let upperBound = +rawData[0];

// Initialize the computed factorial value
let resultValue = 1;

// Define the modulus for calculations to prevent excessively large numbers
let moduloDivisor = Math.pow(10, 9) + 7;

// Iterate from one up to the specified upper limit
for (let counter = 1; counter <= upperBound; ++counter) {
    // Multiply the current result by the iteration counter
    resultValue *= counter;

    // If the result exceeds the modulus, apply the modulo operation
    if (resultValue > moduloDivisor) {
        resultValue %= moduloDivisor;
    }
}

// Display the final calculated result to the console
console.log(resultValue);
