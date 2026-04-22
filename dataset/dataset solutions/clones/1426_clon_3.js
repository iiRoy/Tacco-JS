const fileSystemModule = require('fs');

// Attempt to read the entire content from standard input.
// A try-catch block is added for robust error handling during file operations.
let rawInputData;
try {
    rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (dataReadError) {
    console.error("An error occurred while trying to read from standard input:", dataReadError.message);
    // If reading fails, we can either exit, or provide a default empty string
    // to allow the rest of the script to run without further errors.
    rawInputData = '';
}

// Split the raw input string into an array of individual lines of text.
// Each element in this array represents a single line from the input.
const documentLines = rawInputData.split('\n');

// Initialize a Map to store the frequency of each alphabetic character.
// Using a Map provides a clear key-value structure (character -> count).
const characterFrequencyMap = new Map();

// If no input lines are found, issue a warning.
if (documentLines.length === 0) {
    console.warn("No input lines were detected for processing. The character frequency map will be empty.");
} else {
    // Iterate through each line extracted from the input data.
    // Using a 'for...of' loop for cleaner iteration over array elements.
    for (const currentLineContent of documentLines) {
        // Skip lines that are empty or contain only whitespace, as they don't contribute to character counts.
        if (currentLineContent.trim().length === 0) {
            continue; // Move to the next line without processing.
        }

        // Convert the current line into an array of its constituent characters.
        const lineCharacters = currentLineContent.split('');

        // Process each individual character within the current line.
        for (const charUnit of lineCharacters) {
            // Convert the character to lowercase to ensure case-insensitive counting.
            const normalizedChar = charUnit.toLowerCase();

            // Check if the normalized character is an English alphabet letter (a-z).
            // Only alphabetic characters are considered for frequency counting.
            if (normalizedChar >= 'a' && normalizedChar <= 'z') {
                // Retrieve the current count for this character, defaulting to 0 if not previously encountered.
                // The nullish coalescing operator (??) provides a concise way to handle undefined values.
                const currentCount = characterFrequencyMap.get(normalizedChar) ?? 0;
                // Increment the count for the character and update it in the map.
                characterFrequencyMap.set(normalizedChar, currentCount + 1);
            }
            // Characters that are not 'a' through 'z' are simply ignored.
        }
    }
}

// Define the ASCII character code for 'a' to serve as a reference point.
const asciiCodeForA = 'a'.charCodeAt(0);

// The total number of letters in the English alphabet.
const totalAlphabetLetters = 26;

// Iterate through the entire English alphabet, from 'a' to 'z', to display counts.
for (let alphabetIndex = 0; alphabetIndex < totalAlphabetLetters; alphabetIndex++) {
    // Calculate the ASCII code for the current alphabet character.
    const currentLetterCode = asciiCodeForA + alphabetIndex;
    // Convert the ASCII code back to its corresponding character.
    const currentAlphabetLetter = String.fromCharCode(currentLetterCode);

    // Retrieve the frequency count for the current letter from the map.
    // If the letter was never encountered, its count is explicitly set to 0.
    const finalOccurrenceCount = characterFrequencyMap.get(currentAlphabetLetter) ?? 0;

    // Output the character and its total frequency count in a descriptive format.
    console.log(`Letter: '${currentAlphabetLetter}' | Occurrences: ${finalOccurrenceCount}`);
}