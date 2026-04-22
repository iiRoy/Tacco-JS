// This directive enforces strict parsing and error handling in the script.
'use strict';

// Function to calculate a specific sum based on input criteria.
let calculateSumOfNumbers = inputString => {
    // Parse the input string into an array of numeric criteria.
    // Each segment of the input string, separated by space, is converted to a number.
    let numericCriteria = inputString.split(' ').map(numberString => Number(numberString));

    // Initialize a variable to accumulate the final total.
    let cumulativeTotal = 0;

    // Loop through numbers starting from 1 up to the first criterion value.
    for (let currentVal = 1; currentVal <= numericCriteria[0]; currentVal++) {

        // Convert the current number to a string, then split it into individual character digits.
        // Reduce these digit characters to their numerical sum.
        const currentDigitSum = String(currentVal).split('').reduce((digitAccumulator, singleDigitChar) => {
            return digitAccumulator + Number(singleDigitChar);
        }, 0); // Start accumulation from zero.

        // Check if the calculated digit sum falls within the specified range
        // (between the second and third criterion values, inclusive).
        if (currentDigitSum >= numericCriteria[1] && currentDigitSum <= numericCriteria[2]) {
            // If it does, add the current number to the cumulative total.
            cumulativeTotal += currentVal;
        }
    }

    // Return the final accumulated total.
    return cumulativeTotal;
};


// The main entry point function for the application.
function StartApplication(programInput) {
    // Log the result of the calculation to the console.
    console.log(calculateSumOfNumbers(programInput));
}

// Read input from standard input, decode it as UTF-8, and then
// pass it to the main application function.
StartApplication(
    require('fs').readFileSync('/dev/stdin', 'utf8')
);