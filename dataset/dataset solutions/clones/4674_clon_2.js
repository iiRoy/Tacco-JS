"use strict"; // Enforce strict mode for robust code execution

/**
 * Analyzes an input string to determine and display a specific character based on conditional logic.
 * This function processes a single line of input containing two space-separated characters.
 * @param {string} inputString - The raw string provided as input, expected to have at least one line with two characters.
 */
const processInput = (inputString) => {
    // Extract the first line from the entire input string.
    // Then, split this first line by a space character.
    // The initial character for evaluation is the first element of this split array.
    const initialCharacter = inputString.split("\n")[0].split(" ")[0];

    // The subsequent character for evaluation is the second element of the same split array.
    const subsequentCharacter = inputString.split("\n")[0].split(" ")[1];

    // Based on the value of the initial character, a decision path is chosen.
    if (initialCharacter === "D") {
        // If the initial character is 'D', then the subsequent character is checked.
        // If the subsequent character is 'H', output 'D'; otherwise, output 'H'.
        console.log(subsequentCharacter === "H" ? "D" : "H");
    } else {
        // If the initial character is anything other than 'D',
        // the subsequent character is directly outputted.
        console.log(subsequentCharacter);
    }
};

// Read the entire content from the standard input stream,
// assuming UTF-8 encoding, and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
