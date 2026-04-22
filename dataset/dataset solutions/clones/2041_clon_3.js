'use strict';

/**
 * Helper function to determine if a given array of characters forms a palindrome.
 * This function is reusable for checking different parts of the input string.
 * It's designed to be efficient by only iterating through half of the sequence.
 *
 * @param {Array<string>} charArrayToCheck - The array of characters to evaluate.
 * @returns {boolean} - True if the sequence is a palindrome, false otherwise.
 */
function IsSubsequencePalindrome(charArrayToCheck) {
    const currentSequenceLength = charArrayToCheck.length;

    // An empty sequence or a sequence with a single element is inherently a palindrome.
    if (currentSequenceLength <= 1) {
        return true;
    }

    // Iterate only up to the middle of the sequence.
    // We compare characters from the start with corresponding characters from the end.
    const iterationLimit = Math.floor(currentSequenceLength / 2);
    for (let currentPosition = 0; currentPosition < iterationLimit; ++currentPosition) {
        const symmetricPosition = currentSequenceLength - 1 - currentPosition;
        // If any character pair doesn't match, it's not a palindrome.
        if (charArrayToCheck[currentPosition] !== charArrayToCheck[symmetricPosition]) {
            return false; // Mismatch found, thus not a palindrome.
        }
    }
    // If the loop completes without finding any mismatches, it is a palindrome.
    return true;
}

/**
 * Main processing function to analyze an input string based on specific palindrome criteria.
 * It checks if the entire string, its first calculated segment, and its second calculated segment
 * are all palindromes.
 *
 * @param {string} inputStringData - The raw input string from standard input.
 * @returns {string} - 'Yes' if all conditions are met, otherwise 'No'.
 */
function AnalyzeStringPalindrome(inputStringData) {
    // Clean the input: remove leading/trailing whitespace and convert to an array of characters.
    // Using Array.from for robust character handling (e.g., Unicode code points).
    const characterSequence = Array.from(inputStringData.trim());

    const totalCharacterCount = characterSequence.length;
    let finalVerdict = 'Yes'; // Optimistically assume 'Yes' until a condition fails.

    // Handle edge cases for very short strings.
    // An empty string or a single-character string is considered a palindrome,
    // and its segments (which would be empty or single-character) also satisfy palindrome conditions.
    // The original logic would also yield 'Yes' for these cases.
    if (totalCharacterCount <= 1) {
        return finalVerdict;
    }

    // --- Step 1: Verify if the entire input string forms a palindrome. ---
    // If the whole string isn't a palindrome, there's no need to check its sub-segments.
    if (!IsSubsequencePalindrome(characterSequence)) {
        finalVerdict = 'No';
        return finalVerdict; // Early exit as the primary condition failed.
    }

    // Calculate the boundaries for the two specific sub-segments as defined by the problem.
    // `firstSegmentLength` corresponds to `l` in the original code, defining the length of the initial part.
    const firstSegmentLength = Math.floor((totalCharacterCount - 1) / 2);
    // `secondSegmentStartingIndex` corresponds to `r-1` in the original code, defining the start of the final part.
    const secondSegmentStartingIndex = Math.floor((totalCharacterCount + 3) / 2) - 1;

    // --- Step 2: Extract and check the first segment for palindrome property. ---
    // This segment includes characters from the beginning up to the calculated `firstSegmentLength`.
    const initialCharacterSegment = characterSequence.slice(0, firstSegmentLength);
    if (!IsSubsequencePalindrome(initialCharacterSegment)) {
        finalVerdict = 'No';
        return finalVerdict; // Early exit if the first segment fails the check.
    }

    // --- Step 3: Extract and check the second segment for palindrome property. ---
    // This segment includes characters from `secondSegmentStartingIndex` to the end of the string.
    const finalCharacterSegment = characterSequence.slice(secondSegmentStartingIndex, totalCharacterCount);
    if (!IsSubsequencePalindrome(finalCharacterSegment)) {
        finalVerdict = 'No';
        return finalVerdict; // Early exit if the second segment fails the check.
    }

    // If execution reaches this point, all three palindrome conditions have been successfully met.
    return finalVerdict;
}


// This section handles standard input/output.
// It reads the entire input from stdin, passes it to the main analysis function,
// and then prints the returned result to stdout.
// IMPORTANT: Do not modify the code below this line as it is for environment setup.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const outcome = AnalyzeStringPalindrome(rawInputData);
console.log(outcome);