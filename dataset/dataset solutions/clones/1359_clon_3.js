"use strict"; // Enforce strict parsing and error handling in the script.

// Acquire the core 'fs' (file system) module for input/output operations.
const fileSystemHandler = require('fs');

// Define the constant path for standard input, typically where program inputs are directed.
const standardInputEndpoint = '/dev/stdin';

// Read the complete content from the standard input file synchronously.
// The data is expected to be in UTF-8 encoding.
// This operation retrieves all available input as a single string.
const rawDataString = fileSystemHandler.readFileSync(standardInputEndpoint, 'utf8');

// Pre-process the raw input string:
// 1. Remove any leading or trailing whitespace using .trim().
// 2. Split the cleaned string into an array of substrings based on one or more whitespace characters.
//    This effectively separates individual input values.
const parsedInputValues = rawDataString.trim().split(/\s+/);

// --- Input Validation Section ---
// Ensure that the necessary number of input values (at least two) has been provided.
if (parsedInputValues.length < 2) {
    console.error("Error: Not enough numerical inputs detected. Please provide at least two values.");
    process.exit(1); // Terminate the process with an error code.
}

// Convert the first two extracted string values into actual numerical types.
// This is crucial for performing mathematical comparisons rather than lexicographical string comparisons.
const firstNumericValue = Number(parsedInputValues[0]);
const secondNumericValue = Number(parsedInputValues[1]);

// Validate that the conversion to numbers was successful for both inputs.
// If either conversion results in NaN (Not-a-Number), it indicates invalid input.
if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    console.error("Error: One or both of the provided inputs could not be converted to valid numbers.");
    process.exit(1); // Terminate with an error.
}
// --- End of Input Validation ---

let comparisonMessage; // Declare a variable to hold the descriptive outcome message.

// Execute the comparison logic to determine the relationship between the two numerical values.
// The order of comparison checks is organized for clarity and efficiency.
if (firstNumericValue < secondNumericValue) {
    comparisonMessage = `The first value (${firstNumericValue}) is strictly less than the second value (${secondNumericValue}).`;
} else if (firstNumericValue > secondNumericValue) {
    comparisonMessage = `The first value (${firstNumericValue}) is strictly greater than the second value (${secondNumericValue}).`;
} else {
    // If the first value is neither less than nor greater than the second, they must be equal.
    comparisonMessage = `Both values (${firstNumericValue} and ${secondNumericValue}) are precisely equal.`;
}

// Output the final, descriptive comparison result to the standard output.
console.log(comparisonMessage);

// Script execution successfully completed after comparison.