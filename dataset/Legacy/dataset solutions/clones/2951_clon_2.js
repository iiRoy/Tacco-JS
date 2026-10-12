"use strict";

/**
 * This function processes the given input string to calculate a specific probability.
 * It reads two integer values, N and K, from the input.
 * The calculation involves iterating from 1 to N and applying a conditional probability logic.
 *
 * @param {string} inputData - The raw input string, expected to contain N and K on the first line, space-separated.
 */
const processInput = (inputData) => {
    // First, clean up the input string by removing leading/trailing whitespace
    // and then splitting it into an array of lines.
    inputData = inputData.trim().split("\n");

    // Extract the first line which contains the two required numbers.
    // Split this line by space to get the individual string representations.
    const [nString, kString] = inputData[0].split(" ");

    // Convert the string representations to integers.
    // 'upperBound' corresponds to N in the original problem.
    const upperBound = parseInt(nString, 10);
    // 'thresholdValue' corresponds to K in the original problem.
    const thresholdValue = parseInt(kString, 10);

    // Initialize a variable to accumulate the total probability.
    // Using a floating-point literal for initial value.
    let finalProbability = 0.0;

    // Begin the main iteration loop, from 1 up to and including 'upperBound'.
    for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        // Declare a variable to hold an exponent value, which will be determined conditionally.
        let exponentValue;

        // Check if the 'currentNumber' has already reached or exceeded the 'thresholdValue'.
        if (currentNumber >= thresholdValue) {
            // If the condition is met, add a base probability (1.0 / N) to the total.
            finalProbability += (1.0 / upperBound);
        } else {
            // If 'currentNumber' is less than 'thresholdValue',
            // an inner loop is needed to find a specific power.
            // This loop searches for the smallest 'powerCounter' such that
            // 'currentNumber' multiplied by 2 to the power of 'powerCounter' exceeds 'thresholdValue'.
            for (let powerCounter = 1; powerCounter < 100000; powerCounter++) {
                // Calculate the product of 'currentNumber' and 2 raised to 'powerCounter'.
                if (currentNumber * Math.pow(2, powerCounter) > thresholdValue) {
                    // Once the condition is satisfied, store 'powerCounter' as the 'exponentValue'.
                    exponentValue = powerCounter;
                    // Exit the inner loop as the required exponent has been found.
                    break;
                }
            }

            // Add the calculated probability for this 'currentNumber' to the total.
            // This probability is (1.0 / N) multiplied by (0.5 raised to the 'exponentValue').
            finalProbability += (1.0 / upperBound) * Math.pow(0.5, exponentValue);
        }
    }

    // Output the final computed probability to the standard console.
    console.log(finalProbability);
};

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this string to the 'processInput' function for calculation.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
