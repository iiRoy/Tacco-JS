// This module handles file system operations for input acquisition.
const fileSystemModule = require('fs');

// Retrieve raw input data from standard input, encoded as UTF-8.
let sourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim leading/trailing whitespace and split into an array by newline characters.
let lineCollection = (sourceData.trim()).split('\n');

// Begin an indefinite processing loop, equivalent to 'while(true)'.
for (;;) {
    // Extract the next numerical target value from the collection.
    // The `.shift()` method removes the first element, and `* 1` converts it to a number.
    let targetValue = lineCollection.shift() * 1;

    // If the target value is zero, terminate the processing loop.
    if (targetValue === 0) {
        break;
    }

    // Initialize a variable to store the smallest sum found so far, setting it to positive infinity.
    let optimalSum = Number.POSITIVE_INFINITY;

    // Iterate through the first dimension (firstComponent) from 0 to 100, inclusive.
    for (let firstDimension = 0; firstDimension <= 100; firstDimension++) {
        // Iterate through the second dimension (secondComponent) from 0 to 1000, inclusive.
        for (let secondDimension = 0; secondDimension <= 1000; secondDimension++) {
            // Calculate the third component (thirdComponent) based on the target value and powers of the dimensions.
            // Formula: thirdComponent = targetValue - (firstDimension^3 + secondDimension^2)
            let thirdComponent = targetValue - (Math.pow(firstDimension, 3) + Math.pow(secondDimension, 2));

            // If the third component becomes negative, it means further increments for secondDimension
            // will also result in negative thirdComponents, so we can break the inner loop.
            if (thirdComponent < 0) {
                break;
            }

            // Update optimalSum if the current sum of the three components is smaller.
            optimalSum = Math.min(optimalSum, firstDimension + secondDimension + thirdComponent);
        } // End of inner loop for secondDimension
    }     // End of outer loop for firstDimension

    // Output the calculated optimal (minimum) sum for the current target value to the console.
    console.info(optimalSum);
} // End of main processing loop