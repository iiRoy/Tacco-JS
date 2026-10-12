"use strict";

// Helper function to determine the count of a specific character within a given string.
const getCharCount = (targetChar, sourceString) => {
    let charOccurrenceCount = 0;
    for (const charInSource of sourceString) {
        if (charInSource === targetChar) {
            charOccurrenceCount++;
        }
    }
    return charOccurrenceCount;
};

// Core logic for processing the input data and generating the desired output.
const processInputData = (rawInputContent) => {
    const inputLines = rawInputContent.trim().split("\n");
    const numberOfStrings = parseInt(inputLines[0], 10); // Parse the first line as an integer, specifying radix.
    const stringCollection = inputLines.slice(1, numberOfStrings + 1); // Extract the relevant strings.

    const STANDARD_ALPHABET_SEQUENCE = "abcdefghijklmnopqrstuvwxyz";
    const alphabetCharacters = STANDARD_ALPHABET_SEQUENCE.split("");

    let finalResultCharacters = [];

    // Iterate through each character of the alphabet.
    for (const currentAlphabetCharacter of alphabetCharacters) {
        let minimumOccurrencesAcrossStrings = Infinity;
        let characterFoundInAllStrings = true; // Flag to track if the character is present in every string.

        // For the current alphabet character, check its occurrences in each string of the collection.
        for (const currentInputString of stringCollection) {
            const currentStringCharCount = getCharCount(currentAlphabetCharacter, currentInputString);

            // If the character is not found in the current string, its minimum occurrence across all strings is 0.
            // We can then stop checking this character against further strings.
            if (currentStringCharCount === 0) {
                minimumOccurrencesAcrossStrings = 0;
                characterFoundInAllStrings = false; // Update flag.
                break; // Exit the inner loop early.
            } else {
                // Update the minimum occurrences found so far for this character.
                minimumOccurrencesAcrossStrings = Math.min(minimumOccurrencesAcrossStrings, currentStringCharCount);
            }
        }

        // If the character was found in all strings (or if minimumOccurrencesAcrossStrings > 0),
        // add it to the result array as many times as its minimum occurrences.
        // The check `characterFoundInAllStrings` is implicitly handled by `minimumOccurrencesAcrossStrings` being 0.
        for (let repetitionIndex = 0; repetitionIndex < minimumOccurrencesAcrossStrings; repetitionIndex++) {
            finalResultCharacters.push(currentAlphabetCharacter);
        }
    }

    // Output the final string by joining all collected characters.
    console.log(finalResultCharacters.join(""));
};

// Main entry point for the script execution.
const executeProgram = () => {
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(fileContents);
};

executeProgram();
