'use strict';

/*
 * This function processes raw input to calculate a specific count.
 * It demonstrates nested loops and conditional logic.
 */
function ProcessInput(rawData) {
    // Parse the raw input string into an integer after trimming whitespace.
    let numericValue = parseInt(rawData.trim());

    // This variable is declared but not used meaningfully due to shadowing in the inner loop.
    let unusedVar = 1;

    // Initialize a counter for the results.
    let resultCounter = 0;

    // Outer loop: iterate with 'firstFactor' from 1 up to (but not including) numericValue.
    for (let firstFactor = 1; firstFactor < numericValue; firstFactor++) {
        // Inner loop: iterate with 'secondFactor' from 1 up to (but not including) numericValue.
        for (let secondFactor = 1; secondFactor < numericValue; secondFactor++) {
            // If the product of the two factors exceeds the numericValue,
            // there's no need to continue with larger secondFactors for the current firstFactor.
            if (firstFactor * secondFactor > numericValue) {
                break; // Exit the inner loop.
            }

            // If the difference between numericValue and the product of factors is not zero,
            // increment the result counter. This effectively counts pairs (a,b) such that a*b < numericValue.
            if (numericValue - firstFactor * secondFactor !== 0) {
                resultCounter++;
            }
        }
    }

    // Output the final calculated count to the console.
    console.log(resultCounter);
}

// The following line handles standard input/output and invokes the main processing function.
// It should not be modified to ensure proper execution in the given environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
