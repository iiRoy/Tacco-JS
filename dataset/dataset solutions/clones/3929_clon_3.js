// This module provides functionality to transform a given string
// based on specific rules related to character availability and lexicographical order.
// It aims to find a "next" string, either by appending a character or by
// modifying an existing one, following a defined algorithm.

/**
 * Transforms an input string according to two main rules:
 * 1. If the string is shorter than the full alphabet, it appends the
 *    smallest missing lowercase English letter.
 * 2. If the string is the length of the full alphabet (26 characters),
 *    it attempts to find a lexicographically greater string by modifying
 *    its characters. If the string is already the lexicographically
 *    largest possible (e.g., "zyxwvutsrqponmlkjihgfedcba"), it outputs -1.
 *
 * @param {string} originalInput The string to be processed.
 * @throws {Error} If the input is not a string.
 */
function processStringForLexicographicalModification(originalInput) {
    // --- Input Validation ---
    if (typeof originalInput !== 'string') {
        throw new Error("Invalid input: The provided value must be a string.");
    }

    let currentWorkingString = originalInput;
    const currentStringLength = currentWorkingString.length;

    // --- Core Constants for Alphabet Processing ---
    const ALPHABET_CHARACTER_COUNT = 26;
    const ASCII_CODE_FOR_LOWERCASE_A = 'a'.charCodeAt(0);

    // Helper arrow function to convert a lowercase character to its 0-indexed alphabet position.
    const convertCharToAlphabetIndex = (char) => char.charCodeAt(0) - ASCII_CODE_FOR_LOWERCASE_A;
    // Helper arrow function to convert a 0-indexed alphabet position back to its lowercase character.
    const convertAlphabetIndexToChar = (index) => String.fromCharCode(ASCII_CODE_FOR_LOWERCASE_A + index);

    // An array to keep track of which characters ('a' through 'z') are available (1) or used (0).
    // Using Uint8Array for memory efficiency as it only stores 0 or 1.
    const characterPresenceFlags = new Uint8Array(ALPHABET_CHARACTER_COUNT).fill(1); // Initially all characters are available.

    // --- Logic Branch 1: String is shorter than the full alphabet ---
    // In this case, we aim to append the smallest missing character.
    if (currentStringLength < ALPHABET_CHARACTER_COUNT) {
        // First, mark all characters present in the `currentWorkingString` as 'used' (0).
        for (let charIterator = 0; charIterator < currentStringLength; charIterator++) {
            const charAlphabetIndex = convertCharToAlphabetIndex(currentWorkingString[charIterator]);
            characterPresenceFlags[charAlphabetIndex] = 0; // Mark as used.
        }

        // Then, iterate through the alphabet to find the first 'available' character.
        for (let alphabetProbeIndex = 0; alphabetProbeIndex < ALPHABET_CHARACTER_COUNT; alphabetProbeIndex++) {
            if (characterPresenceFlags[alphabetProbeIndex] === 1) { // If character is available.
                // Append this character to the string and terminate the search.
                currentWorkingString += convertAlphabetIndexToChar(alphabetProbeIndex);
                break; // Mission accomplished for this branch.
            }
        }
    }
    // --- Logic Branch 2: String is the length of the full alphabet (or longer, though problem typically implies 26) ---
    // This branch handles finding a lexicographically greater string by modifying existing characters.
    else {
        // --- Specific Edge Case Check ---
        // If the string is already the lexicographically largest possible sequence of 26 unique characters,
        // no further modification is possible to make it larger while maintaining length 26.
        const MAX_LEXICOGRAPHICAL_26_CHAR_STRING = "zyxwvutsrqponmlkjihgfedcba";
        if (currentWorkingString === MAX_LEXICOGRAPHICAL_26_CHAR_STRING) {
            console.log(-1); // Output -1 as per problem specification.
            return; // Exit the function immediately.
        }

        // Variable to hold a character from the right suffix. Its type/meaning changes during the process.
        // Initially, it stores the character at the very end of the string.
        let suffixBoundaryCharacter = currentWorkingString[currentStringLength - 1];
        // Mark this character as 'used' (0) in our presence map.
        characterPresenceFlags[convertCharToAlphabetIndex(suffixBoundaryCharacter)] = 0;

        let identifiedPivotAlphabetIndex = -1; // Will store the alphabet index of the character to be replaced.
        let truncationPointIndex = -1;        // Will store the index before which the string should be truncated.

        // Iterate from the second-to-last character towards the beginning of the string.
        // This loop aims to find the rightmost character that can be "incremented".
        for (let currentScanPosition = currentStringLength - 2; currentScanPosition >= 0; currentScanPosition--) {
            const characterAtCurrentPosition = currentWorkingString[currentScanPosition];

            // If the `suffixBoundaryCharacter` (which always refers to `s[stringLength - 1]` from the original code's behavior)
            // is lexicographically greater than the character at the current scan position.
            if (suffixBoundaryCharacter > characterAtCurrentPosition) {
                identifiedPivotAlphabetIndex = convertCharToAlphabetIndex(characterAtCurrentPosition);
                truncationPointIndex = currentScanPosition;
                // Truncate the string to keep only the prefix before this pivot character.
                currentWorkingString = currentWorkingString.substring(0, truncationPointIndex);
                break; // Found the pivot point, no need to scan further left.
            } else {
                // If the current character is not smaller than `suffixBoundaryCharacter`,
                // it's part of a non-increasing suffix (e.g., 'zyx...'). Mark it as 'used'.
                characterPresenceFlags[convertCharToAlphabetIndex(characterAtCurrentPosition)] = 0;
            }
        }

        // Now, find the smallest character (from the entire alphabet) that meets two criteria:
        // 1. Its alphabet index is greater than or equal to the `identifiedPivotAlphabetIndex`.
        // 2. It was already 'used' (0) in the `characterPresenceFlags` array.
        //    (Note: This `=== 0` condition is a direct clone of the original code's behavior.)
        for (let potentialReplacementIndex = identifiedPivotAlphabetIndex; potentialReplacementIndex < ALPHABET_CHARACTER_COUNT; potentialReplacementIndex++) {
            if (characterPresenceFlags[potentialReplacementIndex] === 0) { // If this character is marked as 'used'.
                // Append this character to the truncated prefix.
                currentWorkingString += convertAlphabetIndexToChar(potentialReplacementIndex);
                break; // Found and appended, exit the loop.
            }
        }
    }

    // --- Final Output ---
    console.log(currentWorkingString);
}

// --- Entry Point for Script Execution ---
// This block handles reading input from standard input, processing it, and catching potential errors.
try {
    const fileSystemModule = require("fs"); // Import Node.js File System module.
    // Read the entire content of standard input synchronously.
    const inputBufferData = fileSystemModule.readFileSync("/dev/stdin");
    // Convert the buffer to a UTF-8 string.
    const rawInputText = inputBufferData.toString("utf8");
    // Remove leading/trailing whitespace (like newlines) from the input.
    const processedInput = rawInputText.trim();

    // Call the main transformation function with the cleaned input.
    processStringForLexicographicalModification(processedInput);
} catch (executionError) {
    // Log any errors that occur during file reading or string processing.
    console.error("An operational error occurred:", executionError.message);
    // Depending on problem requirements, a default output like -1 or an empty string might be desired here.
    // console.log(-1);
}