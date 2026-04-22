// This module contains a utility function to determine if a number is perfectly divisible by another.
// It processes a string input consisting of two space-separated integers.

/**
 * Executes a divisibility check on two numbers provided in a string.
 * @param {string} rawInputString - A string containing two space-separated integer values.
 */
function performDivisibilityCheck(rawInputString) {
    // Trim whitespace from the input string and split it into individual components.
    const stringTokens = rawInputString.trim().split(" ");

    // Ensure we have exactly two numeric tokens for processing.
    // If not, it's an invalid input scenario, so we indicate an error.
    if (stringTokens.length < 2) {
        console.error("Error: Insufficient input values. Expected two numbers.");
        return; // Exit early if input is malformed.
    }

    // Attempt to convert the first string token into an integer.
    const firstNumberCandidate = Number(stringTokens[0]);
    // Attempt to convert the second string token into an integer.
    const secondNumberCandidate = Number(stringTokens[1]);

    // Validate if the parsed values are indeed numbers.
    if (isNaN(firstNumberCandidate) || isNaN(secondNumberCandidate)) {
        console.error("Error: One or both input values are not valid numbers.");
        return; // Exit early if parsing fails.
    }

    // Assign the validated numbers to final variables.
    const firstNumber = firstNumberCandidate;
    const secondNumber = secondNumberCandidate;

    // A variable to store the final result that will be displayed.
    let calculationResult;

    // Determine if the first number is perfectly divisible by the second.
    // The modulo operator returns 0 for perfect divisibility.
    // We check if the remainder is not zero, meaning it's NOT perfectly divisible.
    if (firstNumber % secondNumber !== 0) {
        calculationResult = firstNumber; // If not perfectly divisible, output the first number.
    } else {
        // If it is perfectly divisible, output a sentinel value indicating this.
        calculationResult = -1;
    }

    // Display the computed result to standard output.
    console.log(calculationResult);
}

// Helper function to abstract the input reading mechanism.
function acquireStandardInput() {
    // Read the entire content of standard input as a UTF-8 string.
    // This is typical for competitive programming environments.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

// The main execution block:
// 1. Obtain the raw input string.
// 2. Pass it to our primary processing function.
const receivedDataPayload = acquireStandardInput();
performDivisibilityCheck(receivedDataPayload);