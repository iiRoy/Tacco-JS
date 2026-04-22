"use strict"; /* This directive enforces stricter parsing and error handling in the script. */

/**
 * Computes a specific probability based on input parameters.
 * The core logic involves iterating through a range and applying conditional calculations.
 * @param {string} inputString - The raw string input containing two space-separated numbers.
 */
const calculateProbability = (inputString) => {
    // Process the raw input string: remove leading/trailing whitespace and split into lines.
    inputString = inputString.trim().split("\n");
    // Parse the first number from the first line of input.
    const totalItems = parseInt(inputString[0].split(" ")[0]);
    // Parse the second number from the first line of input.
    const thresholdValue = parseInt(inputString[0].split(" ")[1]);

    // Initialize a variable to accumulate the computed probability.
    let cumulativeProbability = 0;

    // Loop through each item from 1 up to the total number of items.
    for (
        let currentItem = 1;
        currentItem <= totalItems;
        currentItem++
    ) {
        let exponentValue; // Declare a variable to hold the exponent for probability calculation.

        // Check if the current item has already reached or exceeded the threshold.
        if (currentItem >= thresholdValue) {
            // If it has, add a base probability contribution (1/totalItems).
            cumulativeProbability += (1 / totalItems);
        } else {
            // If the current item is below the threshold, calculate a further probability.
            // This inner loop determines how many times 'currentItem' needs to be doubled to exceed 'thresholdValue'.
            for (let powerIndex = 1; powerIndex < 100000; powerIndex++) {
                // Calculate the doubled value of the current item.
                if (currentItem * Math.pow(2, powerIndex) > thresholdValue) {
                    exponentValue = powerIndex; // Store the exponent once the threshold is crossed.
                    break;                     // Exit the inner loop as the exponent is found.
                }
            }

            // Add the calculated probability for this item to the total.
            // This involves the base probability multiplied by (1/2) raised to the determined exponent.
            cumulativeProbability += (1 / totalItems) * Math.pow((1 / 2), exponentValue);
        }
    }

    // Output the final computed cumulative probability to the console.
    console.log(cumulativeProbability);
};

// Invoke the main calculation function by reading input from standard input.
calculateProbability(require('fs').readFileSync('/dev/stdin', 'utf8'));