/**
 * Analyzes an input string to ascertain if it adheres to a specific set of palindromic conditions.
 * This function determines if the complete string, its initial segment, and its terminal segment
 * (excluding any central character for odd-length strings) are all palindromes.
 *
 * @param {string} rawTextData The raw string value provided for evaluation.
 */
function evaluateCompositePalindromicStatus(rawTextData) {
    // Convert the incoming string into an array of individual characters.
    // This facilitates character-by-character access and slicing operations.
    const charArrayRepresentation = rawTextData.split("");

    // Initialize a boolean flag to track the overall validity.
    // It is set to true initially and will be switched to false upon the first failed check.
    let isEntirelyValid = true;

    /**
     * Internal utility function to check if a given array of characters forms a palindrome.
     * It performs a symmetric comparison from the ends towards the center.
     *
     * @param {Array<string>} segment An array of characters to be checked for palindromic property.
     * @returns {boolean} True if the segment is a palindrome, false otherwise.
     */
    const verifySegmentIsPalindrome = (segment) => {
        const currentSegmentLength = segment.length;
        // An empty array or an array with a single character is inherently a palindrome.
        if (currentSegmentLength <= 1) {
            return true;
        }
        // Iterate only up to the middle point of the segment.
        // Comparing characters beyond this point would be redundant.
        for (let index = 0; index < Math.floor(currentSegmentLength / 2); ++index) {
            // If any character pair at symmetric positions does not match, it's not a palindrome.
            if (segment[index] !== segment[currentSegmentLength - 1 - index]) {
                return false;
            }
        }
        // If the loop completes without finding any mismatches, the segment is a palindrome.
        return true;
    };

    // --- Primary Palindrome Check: The entire input character sequence ---
    // If the full sequence itself is not a palindrome, there's no need for further checks,
    // as the overall condition cannot be met.
    if (!verifySegmentIsPalindrome(charArrayRepresentation)) {
        isEntirelyValid = false;
    }

    // Calculate the effective length for the first sub-segment.
    // This value determines the split point for the string's halves,
    // specifically handling the exclusion of a middle character for odd-length strings.
    const effectiveFirstHalfLength = (charArrayRepresentation.length - 1) / 2;

    // Extract the initial sub-segment (the "left half" of the string).
    // The `slice` method will implicitly floor the `effectiveFirstHalfLength` if it's fractional.
    const initialSubsegment = charArrayRepresentation.slice(0, effectiveFirstHalfLength);

    // --- Secondary Palindrome Check: The initial sub-segment ---
    // Only proceed with this check if the string is still considered entirely valid.
    if (isEntirelyValid && !verifySegmentIsPalindrome(initialSubsegment)) {
        isEntirelyValid = false;
    }

    // Extract the terminal sub-segment (the "right half" of the string).
    // The `slice` method will implicitly ceil `effectiveFirstHalfLength + 1` if it's fractional
    // for the starting index, ensuring correct segment extraction.
    const terminalSubsegment = charArrayRepresentation.slice(effectiveFirstHalfLength + 1, charArrayRepresentation.length);

    // --- Tertiary Palindrome Check: The terminal sub-segment ---
    // Only proceed with this check if the string is still considered entirely valid.
    if (isEntirelyValid && !verifySegmentIsPalindrome(terminalSubsegment)) {
        isEntirelyValid = false;
    }

    // Based on the final state of the validity flag, print the appropriate result.
    if (isEntirelyValid) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// --- Application Entry Point ---
// This block handles reading input from standard input and invoking the main processing logic.
try {
    // Utilize the 'fs' module to synchronously read content from '/dev/stdin'.
    // The input is expected to be UTF-8 encoded and any leading/trailing whitespace is removed.
    const acquiredInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();

    // Invoke the primary function with the cleaned input data.
    evaluateCompositePalindromicStatus(acquiredInputData);
} catch (inputError) {
    // If any error occurs during the input reading or initial processing,
    // a diagnostic message is logged to the console.
    console.error("An operational fault occurred during input acquisition or initial processing:", inputError.message);
    // In a production environment, one might also choose to exit the process with a non-zero status code.
    // process.exit(1);
}