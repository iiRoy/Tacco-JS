'use strict';

/**
 * Determines if a given number is a prime number.
 * A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
 *
 * @param {number} candidateValue The integer to test for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
const checkPrimality = (candidateValue) => {
    // Prime numbers must be greater than 1.
    if (candidateValue <= 1) {
        return false;
    }
    // 2 is the smallest and only even prime number.
    if (candidateValue === 2) {
        return true;
    }
    // Any other even number is not prime.
    if (candidateValue % 2 === 0) {
        return false;
    }

    // Optimization: Check for divisors only up to the square root of the number.
    // Also, only check odd divisors since even ones are already handled.
    // Iteration starts from 3 and increments by 2.
    const limitDivisor = Math.floor(Math.sqrt(candidateValue));
    for (let currentFactor = 3; currentFactor <= limitDivisor; currentFactor += 2) {
        // If a factor is found, the number is not prime.
        if (candidateValue % currentFactor === 0) {
            return false;
        }
    }
    // If no factors were found, the number is prime.
    return true;
};

/**
 * Processes the input data to find the first prime number within a specified range.
 * The range starts from the initial value provided in the input and extends up to
 * (but not including) twice that initial value.
 *
 * @param {string[]} inputLines An array of strings representing the input lines.
 *                              The first element is expected to be a numeric string.
 */
const executePrimeSearch = (inputLines) => {
    // Define a constant for the minimum valid prime candidate.
    const MIN_ELIGIBLE_NUMBER = 2;

    // Attempt to parse the initial numeric value from the first line of input.
    // Using Number() for type conversion, which handles various numeric string formats.
    const initialNumericString = inputLines[0];
    let startingPoint = Number(initialNumericString);

    // Validate the parsed input: ensure it's a valid integer.
    if (isNaN(startingPoint) || !Number.isInteger(startingPoint)) {
        console.error("Input Error: The provided value is not a valid integer.");
        return; // Terminate execution due to invalid input.
    }

    // Adjust the starting point if it's less than the minimum eligible prime.
    // This ensures that the search always begins from a sensible value for primes.
    if (startingPoint < MIN_ELIGIBLE_NUMBER) {
        startingPoint = MIN_ELIGIBLE_NUMBER;
    }

    // Pre-calculate the upper boundary of the search range to avoid redundant calculations inside the loop.
    const searchUpperBoundary = startingPoint * 2;

    let discoveredPrime = null; // Variable to store the first prime found, initialized to null.

    // Iterate through numbers within the defined range.
    // The loop continues as long as the current number is less than the upper boundary.
    for (let currentCandidate = startingPoint; currentCandidate < searchUpperBoundary; currentCandidate++) {
        // Utilize the helper function to determine if the current number is prime.
        if (checkPrimality(currentCandidate)) {
            discoveredPrime = currentCandidate; // Store the prime number once found.
            break; // Exit the loop immediately after finding the first prime.
        }
    }

    // Output the result.
    if (discoveredPrime !== null) {
        console.log(discoveredPrime);
    } else {
        // This case is unlikely for positive integer inputs as primes are abundant,
        // but included for robustness.
        console.log("No prime number was found in the specified search interval.");
    }
};

// --- Program Execution Start ---
// This block handles reading input from stdin and initiating the prime search process.
(function initializeAndRun() {
    try {
        // Dynamically load the file system module.
        const fileSystemModule = require("fs");
        // Specify the standard input path typically used in competitive programming environments.
        const standardInputFilePath = "/dev/stdin";
        // Define the character encoding for input data.
        const inputEncoding = "utf8";

        // Read the entire content of the standard input file synchronously.
        const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, inputEncoding);

        // Split the raw input content into an array of lines, based on newline characters.
        const parsedInputLines = rawInputContent.split('\n');

        // Invoke the main processing function with the prepared input lines.
        executePrimeSearch(parsedInputLines);

    } catch (ioError) {
        // Catch and log any errors that occur during file reading or initial setup.
        console.error("An error occurred during input processing:", ioError.message);
        // Optionally, exit the process with an error code.
        // process.exit(1);
    }
})();