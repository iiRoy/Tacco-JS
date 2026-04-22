function processInputString(rawTextInput) {
    // Validate input: If the raw text is empty or just whitespace, there are no characters to process.
    if (!rawTextInput || rawTextInput.trim() === '') {
        console.log('None');
        return;
    }

    // Convert the input string into an array of characters.
    // Ensure all characters are lowercase for consistent comparison.
    const inputCharacterSequence = Array.from(rawTextInput.toLowerCase());

    // Define the full set of characters we expect to find (the English alphabet).
    const fullEnglishAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // --- Type III: Refactor uniqueness and sorting ---
    // Obtain unique characters from the input sequence using a Set for efficiency.
    // Then convert back to an array and sort them alphabetically.
    const distinctPresentCharacters = Array.from(new Set(inputCharacterSequence)).sort();

    // Determine which characters from the full alphabet are missing from the input.
    const absentCharacters = identifyMissingElements(distinctPresentCharacters, fullEnglishAlphabet);

    // --- Type III: Enhanced output logic ---
    // If there are any missing characters, output the first one found (alphabetically).
    if (absentCharacters.length > 0) {
        console.log(absentCharacters[0]);
    } else {
        // Otherwise, if all alphabet characters are present, indicate 'None'.
        console.log('None');
    }
}

// --- Type II & III: Refactored helper function to determine set difference ---
// This function efficiently finds elements present in 'referenceSet' but not in 'elementsToEvaluate'.
const identifyMissingElements = (elementsToEvaluate, referenceSet) => {
    // Create a Set from the elements we have, allowing for fast lookups (O(1) average time complexity).
    const existingElementsSet = new Set(elementsToEvaluate);

    // Initialize an array to store the characters that are found to be missing.
    const resultingMissingList = [];

    // Iterate through each character in the complete reference set (e.g., 'a' through 'z').
    for (const characterInReference of referenceSet) {
        // If the character from the reference set is NOT present in our input set,
        // it means this character is missing.
        if (!existingElementsSet.has(characterInReference)) {
            resultingMissingList.push(characterInReference);
        }
    }

    // Return the collected list of missing characters.
    return resultingMissingList;
};

// --- Type III: Robust input handling ---
// This block reads the input from stdin, similar to the original,
// but includes basic error handling for file operations.
try {
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputString(fileContents);
} catch (readError) {
    // Log any errors that occur during file reading and proceed with empty input.
    console.error("Failed to read input from /dev/stdin:", readError.message);
    processInputString(''); // Handle the error gracefully by processing an empty string.
}