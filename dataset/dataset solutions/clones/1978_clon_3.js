'use strict'; // Enforce stricter parsing and error handling

/**
 * Processes the raw input string to determine if the first number
 * on the first line contains the digit 7.
 * @param {string} rawInputString - The entire input data as a single string.
 */
function processNumericInput(rawInputString) {
    // Break down the input string into individual lines for easier processing.
    const inputLines = rawInputString.split('\n');

    // Early exit if there's no meaningful input provided.
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.log('No'); // If input is empty or just whitespace, no '7' can be found.
        return;
    }

    // Extract the first token from the very first line, assuming it represents the number of interest.
    const firstLineSegment = inputLines[0].split(' ')[0];

    // Convert the extracted string segment into an integer base 10.
    // This handles potential leading/trailing whitespace if any remained after split.
    let currentNumberUnderTest = parseInt(firstLineSegment, 10);

    // Validate if the conversion resulted in a valid number.
    // If the input isn't a number, it cannot contain the digit '7'.
    if (isNaN(currentNumberUnderTest)) {
        console.log('No');
        return;
    }

    // Initialize a boolean flag to track whether the target digit (7) has been found.
    let foundSpecificDigit = false;

    // Iterate through each digit of the number.
    // A do-while loop is used to ensure that even single-digit numbers (including 0) are checked at least once.
    do {
        // Extract the last digit of the current number using the modulo operator.
        const digitToCheck = currentNumberUnderTest % 10;

        // Compare the extracted digit with our target digit (7).
        if (digitToCheck === 7) {
            foundSpecificDigit = true; // Set the flag to true.
            break; // Exit the loop immediately as the digit has been found.
        }

        // Remove the last digit from the number by performing integer division.
        // Math.floor ensures we get an integer result, correctly truncating decimals.
        currentNumberUnderTest = Math.floor(currentNumberUnderTest / 10);

    } while (currentNumberUnderTest > 0); // Continue looping as long as there are digits left to process.

    // Output the final result based on the state of the 'foundSpecificDigit' flag.
    // A ternary operator provides a concise way to log 'Yes' or 'No'.
    console.log(foundSpecificDigit ? 'Yes' : 'No');
}

// This section of the code handles standard input/output operations.
// It reads the entire input from stdin, decodes it as UTF-8,
// and then invokes the primary processing function with the raw data.
// It is typically not modified for competitive programming environments.
processNumericInput(require("fs").readFileSync("/dev/stdin", "utf8"));