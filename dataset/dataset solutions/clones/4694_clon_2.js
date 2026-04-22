'use strict'; /* Apply strict parsing rules */

// Read all input from standard input, process it, and split into individual lines
const dataLines = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

// Parse the first line of input to get the upper bound for our calculation
const calculationLimit = parseInt(dataLines[0]);

// Initialize a variable to store the cumulative product
let productAccumulator = 1;

/*
 * Iterate from 1 up to the specified limit (inclusive)
 * and calculate the factorial product, taking the modulus
 * at each step to prevent overflow.
 */
for (
    let currentFactor = 1; // Start with the first factor
    currentFactor <= calculationLimit; // Loop until the limit is reached
    currentFactor++ // Increment to the next factor
) {
    // Multiply the current product by the factor and apply the modulus
    productAccumulator = (productAccumulator * currentFactor) % (1e9 + 7);
}

// Output the final computed product to the console
console.log(productAccumulator);