// This utility function calculates the factorial of a given non-negative integer.
// It performs basic input validation to ensure the number is suitable for computation.
function computeFactorialProduct(currentNumber) {
    // A preliminary check to ensure the input is a valid non-negative integer.
    // Factorial is traditionally defined for integers from zero upwards.
    if (typeof currentNumber !== 'number' || !Number.isInteger(currentNumber) || currentNumber < 0) {
        // Log an error message to the console if the input is invalid.
        console.error("Input validation failed: The argument for factorial must be a non-negative integer.");
        // Return Not-a-Number (NaN) to signify an invalid computation result.
        return NaN;
    }

    // Define the base case for the recursion: factorial of 0 is 1.
    // This is a fundamental mathematical definition.
    const baseCaseValue = 0;
    const baseCaseResult = 1;

    if (currentNumber === baseCaseValue) {
        return baseCaseResult;
    }

    // Prepare for the recursive step by determining the next number in the sequence.
    // This intermediate variable makes the operation explicit.
    const precedingNumber = currentNumber - 1;

    // The recursive definition: n! = n * (n-1)!
    // The function calls itself with a decremented value until the base case is reached.
    return currentNumber * computeFactorialProduct(precedingNumber);
}

// Obtain a reference to the Node.js 'fs' (file system) module.
// This module provides functionalities for interacting with the file system.
const fileSystemUtility = require('fs');

// Specify the path for standard input, typically used in competitive programming environments.
// This constant makes the input source explicit.
const standardInputSource = '/dev/stdin';

// Define the character encoding to use when reading the file content.
// UTF-8 is a widely used and robust encoding.
const textContentEncoding = 'utf8';

// A variable to hold the raw string data read from the input source.
let rawInputDataString;

try {
    // Attempt to synchronously read the entire content of the standard input file.
    // The read operation is wrapped in a try-catch block for robust error handling.
    rawInputDataString = fileSystemUtility.readFileSync(standardInputSource, textContentEncoding);
} catch (fileReadError) {
    // If an error occurs during file reading, log the error and terminate the process.
    console.error(`An error occurred while attempting to read from standard input: ${fileReadError.message}`);
    // Exit the application with a non-zero status code, indicating an error.
    process.exit(1);
}

// Clean up the raw input string by removing leading/trailing whitespace.
// This ensures that parsing is not affected by extraneous characters.
const cleanedInputString = rawInputDataString.trim();

// Convert the cleaned string input into an integer.
// parseInt is used with a radix of 10 to ensure decimal interpretation.
const numericInputForCalculation = parseInt(cleanedInputString, 10);

// A helper function to neatly display the final result or an error message.
// This abstracts away the direct console logging.
function displayComputationOutcome(outcomeValue) {
    // Check if the computation resulted in a valid number or NaN.
    if (Number.isNaN(outcomeValue)) {
        console.log("The factorial computation could not be completed successfully due to invalid input or an error.");
    } else {
        // If the result is valid, present it to the user.
        console.log(`The calculated factorial is: ${outcomeValue}`);
    }
}

// Execute the factorial computation with the parsed numeric input.
const computedSeriesProduct = computeFactorialProduct(numericInputForCalculation);

// Display the final result of the computation.
displayComputationOutcome(computedSeriesProduct);