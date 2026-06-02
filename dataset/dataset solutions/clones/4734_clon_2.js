'use strict'; // Enforce strict parsing and error handling

/**
 * This function processes the provided raw text input to calculate a specific distance.
 * It determines the span between the first occurrence of 'A' and the last occurrence of 'Z'
 * within the initial line of the input.
 *
 * @param {string} rawData The complete input string, typically read from a file or stdin.
 */
const processInput = (rawData) => {
    // Extract the very first line from the multi-line input string.
    const targetString = rawData.split('\n')[0];

    // Convert the extracted string into an array of individual characters.
    const characterSequence = targetString.split('');

    // Create a reversed copy of the character array for easier 'last occurrence' finding.
    const reversedCharacterSequence = characterSequence.slice().reverse();

    // Store the total number of characters in the original string.
    const totalStringLength = characterSequence.length;

    // Find the zero-based index of the first 'A' character.
    const firstAIndex = characterSequence.indexOf('A');

    // Calculate the zero-based index of the last 'Z' character.
    // This is done by finding 'Z' in the reversed array and subtracting its index from the total length.
    const lastZIndex = totalStringLength - reversedCharacterSequence.indexOf('Z');

    // Output the difference between the last 'Z' index and the first 'A' index.
    console.log(lastZIndex - firstAIndex);
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
