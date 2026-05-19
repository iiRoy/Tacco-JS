'use strict'; // Enforce strict mode for cleaner code execution

// This section handles reading input from standard input.
// It reads the entire content, decodes it as UTF-8, removes leading/trailing whitespace,
// and then splits it into an array of strings based on newline characters.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line of the input is parsed as an integer, representing the upper limit for the calculation.
const limitVal = parseInt(rawData[0]);

// Initialize a variable to accumulate the product.
// This variable will store the factorial value modulo a large prime number.
let productAccumulator = 1;

// Loop from 1 up to and including the 'limitVal'.
// In each iteration, multiply the current product by the loop counter
// and then take the result modulo (10^9 + 7) to prevent integer overflow.
for (let counter = 1; counter <= limitVal; counter++) {
    productAccumulator = (productAccumulator * counter) % (1e9 + 7);
}

// Output the final calculated product to the console.
console.log(productAccumulator);
