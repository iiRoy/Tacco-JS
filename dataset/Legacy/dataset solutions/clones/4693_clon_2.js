'use strict';

// This function processes the input to calculate a factorial-like product modulo a large prime.
const processInput = (dataString) => {
    // Convert the input string into an integer, representing the upper limit for calculation.
    const limitValue = parseInt(dataString);

    // Initialize a variable to store the accumulating product.
    let currentProduct = 1;

    // Iterate from 1 up to and including the limitValue.
    for (let loopIndex = 1; loopIndex <= limitValue; loopIndex++) {
        // Multiply the current product by the current loop index.
        currentProduct *= loopIndex;
        // Apply the modulo operation to keep the result within a manageable range.
        // The modulo constant is 10^9 + 7, a common large prime in competitive programming.
        currentProduct %= (Math.pow(10, 9) + 7);
    }

    // Print the final calculated product to the console.
    console.log(currentProduct);
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
