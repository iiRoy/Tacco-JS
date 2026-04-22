// This module provides a routine to process a text string
// containing two space-separated numerical values and
// determine their relative order.
function processNumericalInput(rawInputString) {
    // Ensure the input string is not null, undefined, or merely whitespace
    if (!rawInputString || rawInputString.trim() === "") {
        console.error("Error: Input string is empty or invalid.");
        return; // Terminate execution early for invalid input
    }

    // Split the input string by one or more whitespace characters
    const segmentArray = rawInputString.trim().split(/\s+/);

    // Validate that we have exactly two segments after splitting
    if (segmentArray.length !== 2) {
        console.error("Error: Expected exactly two numerical values, but received " + segmentArray.length + " segments.");
        return; // Terminate execution early
    }

    // Parse the individual segments into integer numbers using radix 10
    const firstOperand = parseInt(segmentArray[0], 10);
    const secondOperand = parseInt(segmentArray[1], 10);

    // Validate that parsing resulted in actual finite numbers
    if (isNaN(firstOperand) || isNaN(secondOperand)) {
        console.error("Error: One or both input values could not be converted to valid numbers.");
        return; // Terminate execution early
    }

    let comparisonOutcomeMessage; // Declare a variable to hold the textual result of the comparison

    // Perform the comparison logic using a standard if-else if-else block
    if (firstOperand < secondOperand) {
        comparisonOutcomeMessage = "The first number is strictly less than the second.";
    } else if (firstOperand === secondOperand) {
        comparisonOutcomeMessage = "Both numbers are equivalent.";
    } else { // This implies firstOperand > secondOperand
        comparisonOutcomeMessage = "The first number is strictly greater than the second.";
    }

    // Output the determined comparison result to the console
    console.log(comparisonOutcomeMessage);
}

// --- Main execution block ---
// This section is responsible for acquiring input data from the standard
// input stream and then initiating the processing routine.
try {
    // Attempt to read the entire content of the standard input as a UTF-8 string
    const systemInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    
    // Invoke the primary function to process the acquired input data
    processNumericalInput(systemInputData);
} catch (ioError) {
    // Catch and report any errors that may occur during the file reading process
    console.error("An error occurred while attempting to read input from /dev/stdin:", ioError.message);
}