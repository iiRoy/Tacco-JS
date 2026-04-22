'use strict';

/**
 * Core function to process the input and determine the number of valid combinations.
 * This function calculates how many sets of three non-negative integers (a, b, c)
 * exist such that their sum equals a specific 'targetSum' and each integer
 * is less than or equal to a defined 'limitValue'.
 *
 * @param {string} inputDataString - The raw string input, expected to contain
 *                                   two space-separated integers: K (limit) and S (target sum).
 */
const processNumericalInput = (inputDataString) => {
    // Trim whitespace and split the input string by one or more spaces to get the components.
    const inputComponents = inputDataString.trim().split(/\s+/);

    // Perform basic validation to ensure we received exactly two parts.
    if (inputComponents.length !== 2) {
        // Log an error and terminate if the input format is incorrect.
        console.error("Error: Expected exactly two numerical parameters (K and S) in the input string.");
        // In a real application, this might throw an exception or return an error code.
        return;
    }

    // Parse the first component as the upper limit for each digit.
    const limitValueForDigits = Number(inputComponents[0]);
    // Parse the second component as the desired total sum.
    const targetSumValue = Number(inputComponents[1]);

    // Validate that the parsed values are indeed numbers and are non-negative.
    if (isNaN(limitValueForDigits) || isNaN(targetSumValue) || limitValueForDigits < 0 || targetSumValue < 0) {
        console.error("Error: Provided input values are not valid non-negative numbers.");
        return;
    }

    // Initialize a counter to keep track of the valid triplets found.
    let validTripletCount = 0;

    // Iterate through all possible values for the first number (digitOne), from 0 up to K.
    for (let digitOne = 0; digitOne <= limitValueForDigits; digitOne = digitOne + 1) {
        // Iterate through all possible values for the second number (digitTwo), from 0 up to K.
        for (let digitTwo = 0; digitTwo <= limitValueForDigits; digitTwo = digitTwo + 1) {
            // Calculate the sum of the first two digits.
            const currentPairSum = digitOne + digitTwo;

            // Determine the value that the third digit (digitThree) must have
            // to reach the target sum.
            const requiredThirdDigit = targetSumValue - currentPairSum;

            // Check two conditions for the requiredThirdDigit:
            // 1. It must be non-negative (as per problem constraints).
            // 2. It must not exceed the maximum allowed value (K).
            const isThirdDigitValid = (requiredThirdDigit >= 0) && (requiredThirdDigit <= limitValueForDigits);

            // If the calculated third digit satisfies both conditions,
            // then we have found a valid combination (digitOne, digitTwo, requiredThirdDigit).
            if (isThirdDigitValid) {
                // Increment the counter for valid solutions.
                validTripletCount = validTripletCount + 1;
            }
        }
    }

    // Output the final count of valid combinations to the console.
    console.log(validTripletCount);
};

// This block ensures the script reads input from standard input
// and passes it to the main processing function when executed.
// It uses Node.js's 'fs' module to read the file synchronously.
processNumericalInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));