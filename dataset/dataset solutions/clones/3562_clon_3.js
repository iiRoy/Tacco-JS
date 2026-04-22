// This JavaScript program reads a single numeric input from standard input,
// performs a specific calculation based on its parity (even or odd),
// and then prints the computed result to the console.

// --- Initialization and Setup ---

// Acquire the Node.js 'fs' (file system) module.
// This module provides an API for interacting with the file system.
const fileSystemInterface = require('fs');

// Define the standard path for reading input in many competitive programming environments.
// This ensures the script correctly reads from the expected source.
const standardInputFile = '/dev/stdin';

// --- Main Execution Block ---

// An immediately invoked function expression (IIFE) or a named function can be used
// to encapsulate the primary logic, improving readability and scope management.
(function performCalculationAndOutput() {
    // Attempt to read the entire content of the standard input file.
    // The content is expected to be UTF-8 encoded.
    // Then, split the content into an array of strings, using the newline character as a delimiter.
    const allInputLines = fileSystemInterface.readFileSync(standardInputFile, 'utf8').split('\n');

    // From the array of lines, extract the very first line.
    // This line is expected to contain the numeric value we need to process.
    // The 'shift()' method removes the first element from the array and returns it.
    const rawNumericString = allInputLines.shift();

    // --- Input Validation and Parsing ---

    // Perform initial validation on the extracted string.
    // Check if the string is empty or consists only of whitespace.
    if (!rawNumericString || rawNumericString.trim() === '') {
        console.error("Error: The provided input is either empty or consists solely of whitespace. Cannot proceed with calculation.");
        // In a production scenario, one might throw an error or exit.
        // For this exercise, we'll simply log an error and stop execution.
        return;
    }

    // Parse the string into an integer.
    // 'parseInt' is used with a radix of 10 to ensure base-10 conversion.
    const principalInputNumber = parseInt(rawNumericString.trim(), 10);

    // Further validate if the parsed result is indeed a number.
    // 'isNaN' (Is Not a Number) checks if the result of parseInt was successful.
    if (isNaN(principalInputNumber)) {
        console.error(`Error: The input value "${rawNumericString}" could not be parsed into a valid integer.`);
        return;
    }

    // Add a guard clause for non-positive numbers.
    // While the original problem context might imply positive integers,
    // explicitly handling edge cases like zero or negative numbers can be a Type III enhancement.
    if (principalInputNumber <= 0) {
        console.warn(`Warning: Input number ${principalInputNumber} is non-positive. The calculation will proceed, but results might be unexpected depending on problem constraints.`);
        // For certain problems, a specific error or alternative logic might be applied here.
    }

    // --- Core Logic for Calculation ---

    // Determine the parity of the principal input number.
    // The modulo operator (%) returns the remainder of a division.
    // If the remainder when divided by 2 is 0, the number is even.
    const isNumberAnEvenValue = (principalInputNumber % 2 === 0);

    // A variable to hold the final computed product.
    let finalComputedProduct;

    // Branch the calculation based on whether the input number is even or odd.
    if (isNumberAnEvenValue) {
        // Case 1: The input number is even.
        // The calculation requires squaring half of the number.
        const halfValue = principalInputNumber / 2;
        // Instead of Math.pow(), perform direct multiplication for equivalence.
        finalComputedProduct = halfValue * halfValue;
    } else {
        // Case 2: The input number is odd.
        // The calculation requires multiplying the floor and ceiling of half the number.
        const floorOfHalf = Math.floor(principalInputNumber / 2);
        const ceilOfHalf = Math.ceil(principalInputNumber / 2);
        finalComputedProduct = floorOfHalf * ceilOfHalf;
    }

    // --- Output Result ---

    // Print the final calculated product to the standard output.
    console.log(finalComputedProduct);

})(); // End of the IIFE.