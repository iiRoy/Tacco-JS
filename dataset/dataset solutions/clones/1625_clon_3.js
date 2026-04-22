'use strict';

function processNumericalData(inputStringPayload) {

    // Defensive check: Ensure input is not empty or just whitespace.
    if (!inputStringPayload || inputStringPayload.trim().length === 0) {
        console.error("Error: The provided input payload is empty or contains only whitespace.");
        return -1; // Indicate an input parsing error
    }

    const trimmedFirstLine = inputStringPayload.trim().split('\n')[0];
    const mainNumericValue = parseInt(trimmedFirstLine, 10); // Use parseInt with radix for robust conversion

    // Validate the parsed number.
    if (isNaN(mainNumericValue)) {
        console.error("Error: Could not successfully parse a valid numeric value from input.");
        return -2; // Indicate a number parsing error
    }

    // Log the primary numeric value after successful parsing.
    console.log(`Successfully parsed primary number: ${mainNumericValue}`);

    // Define a collection of unit digits that are considered problematic.
    const prohibitedUnitsCollection = [0, 2, 4, 5, 6, 8]; 

    // Extract the last digit of the main numeric value for checking.
    const lastDigitOfMainValue = mainNumericValue % 10;

    // Check if the last digit falls into the prohibited category.
    // This is a more idiomatic JavaScript way to check for inclusion in an array.
    if (prohibitedUnitsCollection.includes(lastDigitOfMainValue)) {
        console.log('-1'); // Output the specific error code as per original specification
        // Provide additional context for the error in a warning log.
        console.warn(`Warning: The primary number (${mainNumericValue}) ends with a prohibited unit digit (${lastDigitOfMainValue}).`);
        return; // Terminate execution as the condition is met.
    }

    // If execution reaches this point, the unit digit was acceptable.
    // Acknowledge successful initial validation.
    console.log("The unit digit of the input number is acceptable. Further complex computations would proceed here.");
    return 0; // Return a success code, indicating initial processing was fine.
}

// Wrapper for reading input from stdin and calling the main processing function.
try {
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalOperationResult = processNumericalData(fileContents);
    // Optionally, you could log the final result code here if needed for external scripts.
    // console.log(`Operation concluded with code: ${finalOperationResult}`);
} catch (err) {
    // Catch and report any errors during file reading or initial function execution.
    console.error(`An unexpected error occurred while processing input: ${err.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate failure.
}