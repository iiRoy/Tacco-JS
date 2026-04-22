"use strict";

// This module is designed to identify the highest possible product
// derived from specific numerical components provided in a single input line.
function processNumericalData(rawData) {
    // Initial processing of the raw input string.
    // It's expected to contain multiple lines, but only the first line is relevant.
    const parsedInputLines = rawData.trim().split('\n');

    // Implement a basic check for valid input availability.
    // If no relevant data line exists, we cannot proceed with calculations.
    if (parsedInputLines.length === 0 || !parsedInputLines[0]) {
        console.log(0); // A default or error value if no primary data is found.
        return;
    }

    // Extract the primary data line and segment it into individual string values.
    // We anticipate exactly four space-separated tokens.
    const componentStrings = parsedInputLines[0].split(' ', 4);

    // Another validation step: ensure the correct number of components was provided.
    // Malformed input (too few or too many components) is handled by exiting.
    if (componentStrings.length !== 4) {
        console.log(0); // Default output for incorrectly formatted input.
        return;
    }

    // Convert the extracted string components into numerical types.
    // Explicit conversion ensures arithmetic operations behave as expected.
    const firstOperand = Number(componentStrings[0]);
    const secondOperand = Number(componentStrings[1]);
    const thirdOperand = Number(componentStrings[2]);
    const fourthOperand = Number(componentStrings[3]);

    // Initialize a variable to track the highest product encountered.
    // Starting with negative infinity guarantees any valid product will be greater.
    let currentHighestProduct = -Infinity;

    // Calculate the first pair-wise product and update the running maximum.
    const productOneThree = firstOperand * thirdOperand;
    currentHighestProduct = Math.max(currentHighestProduct, productOneThree);

    // Calculate the second pair-wise product and update the running maximum.
    const productOneFour = firstOperand * fourthOperand;
    currentHighestProduct = Math.max(currentHighestProduct, productOneFour);

    // Calculate the third pair-wise product and update the running maximum.
    const productTwoThree = secondOperand * thirdOperand;
    currentHighestProduct = Math.max(currentHighestProduct, productTwoThree);

    // Calculate the fourth pair-wise product and update the running maximum.
    const productTwoFour = secondOperand * fourthOperand;
    currentHighestProduct = Math.max(currentHighestProduct, productTwoFour);

    // Output the final determined maximum product to the console.
    console.log(currentHighestProduct);
}

// This section is responsible for the execution environment setup.
// It reads all data from the standard input stream and then passes it
// to our primary data processing function for computation.
// In competitive programming, this part typically remains boilerplate.
processNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));