"use strict";

// Helper function to construct a frequency map for characters within a given string.
// This optimizes repeated character counting operations by pre-calculating them.
const buildCharFrequencyMap = (inputStringValue) => {
    const characterOccurrenceMap = new Map();
    // Iterate over each character in the input string.
    for (const individualCharacter of inputStringValue) {
        // Increment the count for the current character, or initialize if it's the first time seen.
        characterOccurrenceMap.set(individualCharacter, (characterOccurrenceMap.get(individualCharacter) || 0) + 1);
    }
    return characterOccurrenceMap;
};

// This is the primary routine responsible for processing the incoming text data.
const processInputData = (sourceTextPayload) => {
    // Normalize the input: remove leading/trailing whitespace and split into an array of lines.
    const inputContentLines = sourceTextPayload.trim().split("\n");

    // Implement a crucial guard clause: if the input is empty or just whitespace,
    // there's nothing to process, so we output an empty string and exit.
    if (inputContentLines.length === 0 || inputContentLines[0].length === 0) {
        console.log("");
        return;
    }

    // The first line is expected to be an integer indicating the number of subsequent text fragments.
    // We use Number() for explicit type conversion, with a fallback to 0 if parsing fails.
    const expectedFragmentQuantity = Number(inputContentLines[0]) || 0;

    // Another validation: if the expected quantity is zero or less, no fragments exist,
    // so we output an empty string.
    if (expectedFragmentQuantity <= 0) {
        console.log("");
        return;
    }

    // Extract the actual text fragments from the input lines, starting from the second line.
    // We ensure to only take as many fragments as specified by expectedFragmentQuantity.
    const textFragmentArray = inputContentLines.slice(1, expectedFragmentQuantity + 1);

    // A final check for input integrity: if the number of actual fragments doesn't match
    // what was declared, or if the array is unexpectedly empty, we output an empty string.
    if (textFragmentArray.length === 0 || textFragmentArray.length !== expectedFragmentQuantity) {
        console.log("");
        return;
    }

    // Pre-computation step: Transform each raw text fragment into its character frequency map.
    // This allows for efficient lookups later without re-processing strings.
    const fragmentCharFrequencyMaps = textFragmentArray.map(fragmentEntry => buildCharFrequencyMap(fragmentEntry));

    // Dynamically generate an array containing all lowercase English alphabet characters.
    // This is an alternative to hardcoding the alphabet string.
    const englishLowerCaseAlphabet = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));

    // This array will accumulate the common characters, each repeated by its minimum shared count.
    const finalCharacterSequence = [];

    // Begin the main processing loop: iterate through each character of the alphabet.
    for (const currentAlphabetChar of englishLowerCaseAlphabet) {
        let minimumCommonOccurrences = Infinity; // Initialize with a very large number to find the true minimum.
        let isCharPresentAcrossAllFragments = true; // Flag to determine if the character exists in every fragment.

        // Iterate through each pre-computed frequency map.
        for (const currentFragmentMap of fragmentCharFrequencyMaps) {
            // Retrieve the count of the current character from the map, defaulting to 0 if not found.
            const characterCountInThisFragment = currentFragmentMap.get(currentAlphabetChar) || 0;

            // If the character is entirely absent from even a single fragment,
            // it cannot be a common character across all, so we can stop checking for this char.
            if (characterCountInThisFragment === 0) {
                isCharPresentAcrossAllFragments = false;
                break; // Exit the inner loop as this character isn't universally present.
            }

            // Update the minimum occurrence count found so far across all fragments.
            minimumCommonOccurrences = Math.min(minimumCommonOccurrences, characterCountInThisFragment);
        }

        // If the character was found in every single fragment (and thus has a minimum count > 0),
        // append it to our result buffer, repeated by its determined minimum frequency.
        if (isCharPresentAcrossAllFragments) {
            // Utilize String.prototype.repeat for efficient string construction.
            finalCharacterSequence.push(currentAlphabetChar.repeat(minimumCommonOccurrences));
        }
    }

    // Concatenate all accumulated character strings into a single result string and print it.
    console.log(finalCharacterSequence.join(""));
};

// Entry point for execution: read input from standard input and pass it to the processor.
// Includes error handling for robust input reading operations.
try {
    // Use the modern Node.js 'node:fs' module for file system operations.
    const fileSystemModule = require('node:fs');
    const incomingInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    processInputData(incomingInputContent);
} catch (inputReadError) {
    // In case of an error during input reading, log the error and output an empty string
    // as a graceful fallback, preventing program crashes.
    console.error("An error occurred while attempting to read input:", inputReadError.message);
    console.log(""); // Default to empty output on error.
}