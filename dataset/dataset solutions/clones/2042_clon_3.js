// This module contains functions to evaluate string properties, specifically focusing on palindromic structures.

// Utility function to obtain a reversed version of a given string.
// This implementation leverages modern JavaScript string and array methods for efficiency.
const obtainReversedSequence = (originalSequence) => {
    // A preliminary check to ensure the input is a valid string.
    // Non-string inputs or empty strings are handled gracefully by returning an empty string,
    // which prevents errors in subsequent checks.
    if (typeof originalSequence !== 'string' || originalSequence.length === 0) {
        return "";
    }

    // The string is first broken down into an array of characters.
    const charArray = originalSequence.split('');

    // The character array is then reversed in place.
    const reversedCharArray = charArray.reverse();

    // Finally, the reversed characters are joined back together to form the new reversed string.
    const flippedSequence = reversedCharArray.join('');

    return flippedSequence;
};

// Core function to determine if a string is a palindrome.
// A palindrome is a sequence that reads the same forwards and backwards.
const assessSymmetry = (candidateString) => {
    // Robustness check: if the input is not a string, it cannot be a palindrome.
    if (typeof candidateString !== 'string') {
        return false;
    }

    // Edge cases: empty strings or strings with a single character are inherently palindromes.
    if (candidateString.length <= 1) {
        return true;
    }

    const sequenceLength = candidateString.length;
    // We only need to compare characters up to the middle of the string.
    // Math.floor ensures correct handling for both even and odd length strings.
    const comparisonLimit = Math.floor(sequenceLength / 2);

    // Iterate from the beginning up to the midpoint.
    for (let positionIndex = 0; positionIndex < comparisonLimit; positionIndex++) {
        // Fetch the character from the current position starting from the left.
        const charFromBeginning = candidateString.charAt(positionIndex);
        // Fetch the corresponding character from the end of the string.
        const charFromEnd = candidateString.charAt(sequenceLength - 1 - positionIndex);

        // If at any point the characters do not match, the string is not a palindrome.
        if (charFromBeginning !== charFromEnd) {
            return false;
        }
    }

    // If the loop completes without finding any mismatches, the string is indeed a palindrome.
    return true;
};

// Main entry point for processing the input and determining the final output.
const processInputAndEvaluate = (rawInputContent) => {
    // First, clean the input by removing any leading or trailing whitespace.
    const trimmedPayload = rawInputContent.trim();

    // If the string becomes empty after trimming, it doesn't meet the criteria.
    if (trimmedPayload.length === 0) {
        console.log("No");
        return;
    }

    const currentStringLength = trimmedPayload.length;
    // Calculate the integer half-length of the string.
    // This is used to extract the first half for the second palindrome check.
    const segmentLengthForHalf = Math.floor(currentStringLength / 2);

    // Extract the first half of the string.
    // For example, if 'abcde', firstHalfSegment will be 'ab'. If 'abcd', it will be 'ab'.
    const firstHalfSegment = trimmedPayload.slice(0, segmentLengthForHalf);

    // Perform the first condition check: Is the entire string a palindrome?
    const isMainStringSymmetric = assessSymmetry(trimmedPayload);

    // Perform the second condition check: Is the first half of the string a palindrome?
    const isLeadingHalfSymmetric = assessSymmetry(firstHalfSegment);

    // The final result depends on both conditions being true.
    const overallConditionMet = isMainStringSymmetric && isLeadingHalfSymmetric;

    // Output "Yes" or "No" based on the combined evaluation.
    console.log(overallConditionMet ? "Yes" : "No");
};

// Execute the primary function with content read from standard input.
processInputAndEvaluate(require('fs').readFileSync('/dev/stdin', 'utf8'));