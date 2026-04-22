function handleNumericOperations(inputLines) {
    // This function processes a given array of string lines, expecting numeric data.
    // It extracts two numbers from the first line and performs an arithmetic operation.

    // Early exit if no input data is provided, ensuring robustness.
    if (!inputLines || inputLines.length === 0) {
        console.error("Error: Input data array is empty or undefined. Cannot proceed.");
        return;
    }

    // Retrieve the initial data string from the first element of the input array.
    // This assumes the first line contains the relevant numbers.
    const initialNumericString = inputLines[0];

    // Split the single string into an array of string parts using space as a delimiter.
    // This creates an intermediate array for parsing.
    const numericStringComponents = initialNumericString.split(" ");

    // Validate that we have at least two components to parse into numbers.
    // If not, it indicates malformed input.
    if (numericStringComponents.length < 2) {
        console.error("Error: The input line does not contain enough space-separated numeric components.");
        return;
    }

    // Parse the first string component into an integer. Using Number() for explicit conversion.
    const firstOperand = Number(numericStringComponents[0]);

    // Parse the second string component into an integer.
    const secondOperand = Number(numericStringComponents[1]);

    // Perform validation to ensure both parsed values are indeed finite numbers.
    // This catches cases where Number() might result in NaN.
    if (!Number.isFinite(firstOperand) || !Number.isFinite(secondOperand)) {
        console.error("Error: One or both input values could not be parsed as valid numbers.");
        return;
    }

    // Declare a variable to store the final computed result.
    let computedResult;

    // Implement a guard clause for division by zero before the modulo operation.
    // The original code would result in NaN for `b % 0` if `b` is non-zero,
    // and `0` for `0 % 0`. This explicitly handles the zero divisor case.
    if (firstOperand === 0) {
        // If the first operand is zero, the modulo check is tricky.
        // To maintain similar behavior as the original (which would likely fall to else for b%0 -> NaN),
        // we'll proceed with the subtraction path, or specifically handle it.
        // For Type III, let's explicitly make it fall through to subtraction as it's a "non-divisible" scenario in spirit.
        console.warn("Warning: First operand is zero. Modulo operation may not be meaningful. Proceeding with subtraction.");
        computedResult = secondOperand - firstOperand;
    } else {
        // Check if the second operand is perfectly divisible by the first operand.
        // The modulo operator (%) returns the remainder of the division.
        const isPerfectlyDivisible = (secondOperand % firstOperand === 0);

        // Based on the divisibility check, perform either addition or subtraction.
        // Using a ternary operator as an alternative to a traditional if/else block.
        computedResult = isPerfectlyDivisible
                         ? (firstOperand + secondOperand) // If divisible, sum them up.
                         : (secondOperand - firstOperand); // Otherwise, subtract the first from the second.
    }

    // Output the final computed numerical result to the standard console.
    console.log(computedResult);
}

// --- Main Program Execution Flow ---
// This immediately invoked function expression (IIFE) handles program startup,
// input reading, and error management for the entire script.
(function programEntrypoint() {
    // Import the Node.js file system module for reading standard input.
    const fileSystemModule = require('fs');

    // Define the standard input file path, common in Unix-like systems.
    const standardInputIdentifier = '/dev/stdin';

    try {
        // Read all data from standard input synchronously.
        // Specify 'utf8' encoding to get a string rather than a buffer.
        const rawInputDataBuffer = fileSystemModule.readFileSync(standardInputIdentifier, 'utf8');

        // Process the raw input string:
        // 1. Trim leading/trailing whitespace from the entire input.
        // 2. Split the string into an array of lines based on newline characters.
        const processedInputLineArray = rawInputDataBuffer.trim().split('\n');

        // Invoke the core logic function with the prepared input array.
        handleNumericOperations(processedInputLineArray);

    } catch (inputReadError) {
        // Catch and log any errors that occur during the file reading process.
        console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
        // Optionally, exit the process with an error code to indicate failure.
        // process.exit(1);
    }
})();