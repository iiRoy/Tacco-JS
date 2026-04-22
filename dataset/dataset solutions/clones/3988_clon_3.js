// Core module for file system operations in Node.js environments.
const filesystemModule = require('fs');

// Designate the standard input stream's file path, common in Unix-like systems.
const STANDARD_INPUT_SOURCE_PATH = "/dev/stdin";

// Read the entire content of the standard input file synchronously.
// The content is assumed to be encoded in UTF-8.
const rawInputBuffer = filesystemModule.readFileSync(STANDARD_INPUT_SOURCE_PATH, "utf8");

// Convert the raw buffer content to a string and then split it by spaces.
// This operation is expected to produce an array containing two string representations of numbers.
const numericLimitStrings = rawInputBuffer.toString().split(" ");

// Parse the first string from the array into an integer, representing the inclusive lower boundary.
// The unary plus operator is used here as a concise alternative to `parseInt()` for type coercion.
const lowerBoundaryValue = +numericLimitStrings[0];

// Parse the second string from the array into an integer, representing the exclusive upper boundary.
// The `Number()` constructor provides an explicit way to convert a string to a number.
const upperBoundaryValue = Number(numericLimitStrings[1]);

// --- Robust Input Validation ---
// It is critical to validate user or system input to prevent unexpected behavior or errors.
// This block checks for common issues: non-numeric inputs or an improperly defined range.
if (isNaN(lowerBoundaryValue) || isNaN(upperBoundaryValue) || lowerBoundaryValue >= upperBoundaryValue) {
    // If validation fails, log an informative error message to the standard error stream.
    console.error("Error: The provided range is invalid. Please ensure both values are numeric and the lower boundary is strictly less than the upper boundary.");
    // Output a default result (0) and terminate the process with an error code to signal failure.
    console.log(0);
    process.exit(1); // Exit code 1 indicates an error.
}

// Initialize a counter to keep track of the quantity of palindromic numbers identified.
let identifiedPalindromeCount = 0;

/**
 * Determines if a given string represents a 5-digit number that is a palindrome.
 * A 5-digit palindrome follows the pattern 'ABABA' (e.g., 12321).
 *
 * @param {string} candidateNumberString - The string form of the number to be evaluated.
 * @returns {boolean} - Returns `true` if the string is a 5-digit palindrome, `false` otherwise.
 *                      It specifically returns `false` if the string does not have exactly 5 characters.
 */
const checkIsFiveDigitPalindrome = (candidateNumberString) => {
    // Guard clause: A number must be exactly five digits long to be considered a 5-digit palindrome.
    // This prevents errors from accessing out-of-bounds indices for shorter strings.
    if (candidateNumberString.length !== 5) {
        return false;
    }

    // Extract individual characters at specific positions for comparison.
    // `charAt()` is used for reliable character retrieval.
    const charAtPositionZero = candidateNumberString.charAt(0); // The first digit (A)
    const charAtPositionOne = candidateNumberString.charAt(1);  // The second digit (B)
    const charAtPositionThree = candidateNumberString.charAt(3); // The fourth digit (B)
    const charAtPositionFour = candidateNumberString.charAt(4);  // The fifth digit (A)

    // Compare the outer pair of digits (first and fifth).
    const isOuterPairIdentical = (charAtPositionZero === charAtPositionFour);
    // Compare the inner pair of digits (second and fourth).
    const isInnerPairIdentical = (charAtPositionOne === charAtPositionThree);

    // For a 5-digit number to be a palindrome, both conditions must be true.
    return isOuterPairIdentical && isInnerPairIdentical;
};


// Iterate through each integer within the specified range.
// The loop begins at `lowerBoundaryValue` (inclusive) and continues up to, but not including, `upperBoundaryValue`.
for (let currentNumericCandidate = lowerBoundaryValue; currentNumericCandidate < upperBoundaryValue; currentNumericCandidate++) {

    // Convert the current integer into its string representation.
    // This is essential for performing character-by-character palindrome checks.
    const currentNumberAsText = String(currentNumericCandidate); // `String()` constructor is used for conversion.

    // Utilize the helper function to determine if the current number's string form
    // qualifies as a 5-digit palindrome.
    if (checkIsFiveDigitPalindrome(currentNumberAsText)) {
        // If the number is indeed a palindrome, increment the total count.
        identifiedPalindromeCount++;
    }
}

// Output the final tally of 5-digit palindromic numbers found within the given range
// to the standard output.
console.log(identifiedPalindromeCount);