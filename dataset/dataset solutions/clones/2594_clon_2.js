"use strict";

/**
 * The primary function responsible for processing the input data.
 * It reads two space-separated integers, performs a calculation, and prints the result.
 * @param {string} rawInputData - The raw string input, typically from standard input.
 */
const ProcessInputData = (rawInputData) => {
    // Trim any leading/trailing whitespace, then split the string by spaces
    // to get an array of string numbers. Map each string to an integer.
    let numericValues = rawInputData.trim().split(' ').map(val => parseInt(val, 10));

    // Assign the first and second parsed numbers to distinct variables for clarity.
    let firstOperand = numericValues[0];
    let secondOperand = numericValues[1];

    // Initialize a counter variable which will hold the final computed result.
    let finalCount = 0;

    // Check if the first operand is greater than or equal to the second operand.
    if (firstOperand >= secondOperand) {
        // If true, the result is simply 1.
        finalCount = 1;
    } else {
        // If the first operand is less than the second,
        // we enter a loop to calculate the number of operations.
        // The loop continues as long as the expression (firstOperand - 1) * loopIndex + 1
        // remains less than the secondOperand.
        for (let loopIndex = 0; (firstOperand - 1) * loopIndex + 1 < secondOperand; loopIndex++) {
            // Increment the counter for each iteration of the loop.
            finalCount += 1;
        }
    }

    // Output the calculated final count to the console.
    console.log(finalCount);
};

// This line reads the entire content of standard input synchronously
// using Node.js's 'fs' module and passes it to the main processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
