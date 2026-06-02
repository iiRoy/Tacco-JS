"use strict"; // Enforce strict mode for better code quality and error handling

// Utilize Node.js 'fs' module to synchronously read input from standard input stream.
// The input is expected to be UTF-8 encoded.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Split the entire input string by newline characters to get an array of lines.
const inputLinesArray = rawInputData.split('\n');

// The first line contains the initial string.
const initialString = inputLinesArray[0];
// The second line contains the repetition count, which needs to be parsed as an integer.
const repetitionFactor = parseInt(inputLinesArray[1]);

// Convert the initial string into a mutable array of characters for easier manipulation.
let characterSequence = initialString.split('');

// Initialize a variable to accumulate the final calculated score.
let finalCalculatedScore = 0;

// A flag to determine if the character sequence (from index 1 onwards) is homogeneous.
// This specific check determines if all characters from the second element to the end
// are identical to the second element itself.
let isSequenceHomogeneous = true;
// A temporary variable to store the reference character for homogeneity check.
let referenceCharForCheck = '';

// Loop through the character sequence starting from the second element (index 1)
// up to and including the element at `characterSequence.length`.
// Note: Accessing `characterSequence[characterSequence.length]` will yield `undefined`.
for (let currentIdx = 1; currentIdx <= characterSequence.length; currentIdx++) {
    // If the current character matches the established reference character, do nothing.
    if (referenceCharForCheck === characterSequence[currentIdx]) {
        // No action needed, continue to the next character.
    }
    // If a reference character has been established (i.e., not empty)
    // and the current character does not match it, then the sequence is not homogeneous.
    else if (referenceCharForCheck) {
        isSequenceHomogeneous = false; // Mark as non-homogeneous.
        break; // Exit the loop early as the condition is met.
    }
    // If no reference character has been established yet (first iteration for index 1),
    // set the current character as the reference.
    else {
        referenceCharForCheck = characterSequence[currentIdx];
    }
}

// If the sequence was determined to be non-homogeneous by the preceding check.
if (!isSequenceHomogeneous) {
    // Iterate through the character sequence again, starting from the second character (index 1).
    // This loop identifies and modifies adjacent identical characters.
    for (let position = 1; position <= characterSequence.length; position++) {
        let previousCharacter = characterSequence[position - 1]; // Get the character at the prior position.
        let currentCharacter = characterSequence[position];     // Get the character at the current position.

        // If the previous and current characters are identical.
        if (previousCharacter === currentCharacter) {
            characterSequence[position] = 'X'; // Modify the current character to 'X' to break the pair.
            finalCalculatedScore++;            // Increment the score for this modification.
        }
    }
}

// Multiply the accumulated score by the repetition factor.
finalCalculatedScore *= repetitionFactor;

// Evaluate conditions related to the first and last characters of the (potentially modified) sequence.
// Condition 1: If the first and last characters are the same AND the sequence was deemed homogeneous
// by the specific `isSequenceHomogeneous` check.
if (characterSequence[0] === characterSequence[characterSequence.length - 1] && isSequenceHomogeneous) {
    const totalCombinedLength = characterSequence.length * repetitionFactor;
    // Add half of the total combined length to the score.
    // If totalCombinedLength is odd, it effectively adds (totalCombinedLength - 1) / 2.
    finalCalculatedScore += (totalCombinedLength % 2 === 0) ? (totalCombinedLength / 2) : ((totalCombinedLength - 1) / 2);
}
// Condition 2: If only the first and last characters are the same (and Condition 1 was false).
else if (characterSequence[0] === characterSequence[characterSequence.length - 1]) {
    // Add (repetitionFactor - 1) to the score.
    finalCalculatedScore += repetitionFactor - 1;
}

// Output the final calculated score to the console.
console.log(finalCalculatedScore);
