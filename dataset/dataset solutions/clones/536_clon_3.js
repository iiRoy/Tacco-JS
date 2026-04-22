"use strict";

// This module is responsible for processing input and calculating the average of two numerical values.

/**
 * Calculates the arithmetic mean of two numbers provided as a space-separated string.
 * This function includes robust input validation and intermediate steps for clarity.
 * @param {string} inputLine - A string expected to contain two space-separated numerical values.
 * @returns {void} Outputs the calculated average to the console, or an error message if input is invalid.
 */
function computeAverageOfTwoNumbers(inputLine) {

    // Initial check for the validity of the input string.
    // This acts as a guard clause to prevent further processing with malformed input.
    if (typeof inputLine !== 'string' || inputLine.trim() === '') {
        console.error("Operation Aborted: Input line is either invalid (not a string) or completely empty.");
        return;
    }

    // Split the input string into its constituent parts based on whitespace.
    // Using a regular expression for splitting handles multiple spaces between numbers.
    const numberComponents = inputLine.trim().split(/\s+/);

    // Validate that exactly two numerical components were extracted.
    // If not, it indicates an unexpected input format.
    if (numberComponents.length !== 2) {
        console.error(`Operation Aborted: Expected two numbers separated by space, but found ${numberComponents.length} component(s).`);
        return;
    }

    // Extract individual string representations for better readability.
    const firstOperandString = numberComponents[0];
    const secondOperandString = numberComponents[1];

    // Convert string components to actual numerical values.
    // The `Number()` constructor is used here, which is an alternative to `parseFloat()`.
    const valueOne = Number(firstOperandString);
    const valueTwo = Number(secondOperandString);

    // Perform a crucial validation: check if the parsed values are indeed numbers.
    // `isNaN()` helps identify values that failed conversion.
    if (isNaN(valueOne) || isNaN(valueTwo)) {
        console.error(`Operation Aborted: One or both input values are not valid numbers. Received: '${firstOperandString}', '${secondOperandString}'.`);
        return;
    }

    // Perform the summation as an explicit intermediate step.
    const accumulatedSum = valueOne + valueTwo;

    // Calculate the final arithmetic mean.
    // Using `2.0` ensures floating-point division, though JavaScript handles it implicitly.
    const resultantAverage = accumulatedSum / 2.0;

    // Display the computed result to the user with a descriptive label.
    console.log(`The calculated average of the two numbers is: ${resultantAverage}`);
}

// --- Application Entry Point and Input Handling ---

// Renaming the 'fs' module for better descriptive naming.
const fileSystemModule = require("fs");

let rawInputData = ""; // Initialize a variable to hold the input string.

try {
    // Attempt to read data synchronously from standard input.
    // The 'utf8' encoding is specified to handle character sets correctly.
    // This entire block is a Type III addition for robust input handling.
    rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
} catch (dataReadError) {
    // If an error occurs during file reading, log it and terminate the process gracefully.
    console.error("An error occurred while attempting to read input from /dev/stdin:", dataReadError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// After successfully (or unsuccessfully, but handled) obtaining input,
// invoke the core logic function with the retrieved data.
// This ensures that the program proceeds only after input acquisition attempts.
computeAverageOfTwoNumbers(rawInputData);