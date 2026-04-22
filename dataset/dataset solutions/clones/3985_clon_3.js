// This module is designed to count five-digit palindromic numbers
// within a specified numerical range.
// A five-digit palindrome has the form 'abcba', where 'a' is the first/last digit,
// 'b' is the second/fourth digit, and 'c' is the middle digit.
//
// The input is expected to be a string containing two space-separated integers,
// representing the lower and upper bounds of the search range, respectively.

/**
 * Processes the provided input string to count 5-digit palindromes
 * that fall within a given numerical range.
 * @param {string} rawInputString - The raw input string containing two space-separated integers.
 */
function ProcessPalindromeCount(rawInputString) {
    // Attempt to parse the input string into numerical boundaries.
    // Trim whitespace to handle potential leading/trailing spaces in the input.
    const inputParts = rawInputString.trim().split(' ');

    // --- Input Validation: Added guard clauses for robustness (Type III) ---
    // Ensure that exactly two numerical values are provided in the input.
    if (inputParts.length !== 2) {
        console.error("Error: Input string must contain exactly two space-separated values.");
        // In a production system, this might throw an error or return a specific status.
        return;
    }

    // Parse the string parts into integers for the numerical range.
    const lowerBoundary = parseInt(inputParts[0], 10);
    const upperBoundary = parseInt(inputParts[1], 10);

    // Further validation to ensure the parsed values are indeed numbers.
    if (isNaN(lowerBoundary) || isNaN(upperBoundary)) {
        console.error("Error: Input values must be valid integers.");
        return;
    }

    // Initialize a counter to keep track of palindromes found within the specified range.
    let matchingPalindromeCount = 0; // Renamed 'cnt' to 'matchingPalindromeCount' (Type II)

    // Define the permissible range for each digit of a 5-digit palindrome 'abcba'.
    // The first digit ('a') cannot be zero for a 5-digit number.
    const MIN_FIRST_DIGIT = 1; // Renamed and made constant (Type II, Type III)
    const MAX_FIRST_DIGIT = 9;   // Renamed and made constant (Type II, Type III)
    // The second ('b') and third ('c') digits can range from 0 to 9.
    const MIN_MIDDLE_DIGIT = 0; // Renamed and made constant (Type II, Type III)
    const MAX_MIDDLE_DIGIT = 9;   // Renamed and made constant (Type II, Type III)

    // --- Core Logic: Iterating through all possible 5-digit palindrome structures ---
    // Outer loop iterates through all possible values for the first and last digit ('a').
    for (let primaryDigit = MIN_FIRST_DIGIT; primaryDigit <= MAX_FIRST_DIGIT; primaryDigit++) {
        // Middle loop iterates through all possible values for the second and fourth digit ('b').
        for (let secondaryDigit = MIN_MIDDLE_DIGIT; secondaryDigit <= MAX_MIDDLE_DIGIT; secondaryDigit++) {
            // Inner loop iterates through all possible values for the central digit ('c').
            for (let tertiaryDigit = MIN_MIDDLE_DIGIT; tertiaryDigit <= MAX_MIDDLE_DIGIT; tertiaryDigit++) {

                // --- Palindrome Construction: Rewritten using string concatenation (Type III) ---
                // Construct the 5-digit palindrome 'abcba' by concatenating its digits as a string.
                const palindromeString = `${primaryDigit}${secondaryDigit}${tertiaryDigit}${secondaryDigit}${primaryDigit}`;
                // Convert the string representation of the palindrome to its numerical value.
                const currentPalindromeValue = Number(palindromeString); // Using Number() for conversion (Type II)

                // --- Range Check: Updated variable names and broken down condition (Type II, Type III) ---
                // Check if the numerically generated palindrome falls within the specified lower and upper boundaries.
                const isWithinLowerBound = currentPalindromeValue >= lowerBoundary;
                const isWithinUpperBound = currentPalindromeValue <= upperBoundary;

                if (isWithinLowerBound && isWithinUpperBound) {
                    // If the palindrome is within the range, increment the counter.
                    matchingPalindromeCount++;
                    // Optional: A debug log for each found palindrome can be added here (Type III addition).
                    // console.debug(`Found palindrome: ${currentPalindromeValue}`);
                }
            }
        }
    }

    // Output the final count of palindromes found within the given range to the console.
    console.log(matchingPalindromeCount);
}

// --- Execution Entry Point: Refactored and added constants/error handling (Type III) ---
// Define the standard input file path as a constant for clarity and potential reusability.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

// Read input from the standard input stream and execute the main processing function.
// A try-catch block is added for robust error handling during file operations.
try {
    // Dynamically require the 'fs' module.
    const fileSystem = require('fs');
    // Read the content of the standard input file, specifying UTF-8 encoding.
    const inputContent = fileSystem.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');
    // Call the main processing function with the obtained input content.
    ProcessPalindromeCount(inputContent);
} catch (error) {
    // Log any errors that occur during file reading or subsequent processing.
    console.error(`An unexpected error occurred during input processing: ${error.message}`);
    // Further error handling mechanisms (e.g., exiting with a non-zero status code)
    // could be implemented here for more robust application behavior.
}