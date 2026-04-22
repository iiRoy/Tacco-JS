'use strict';

// This script processes text input from standard input.
// It reads two lines: a string and an integer shift value.
const inputRecords = require("fs"). readFileSync("/dev/stdin", "utf8").split("\n");

// Initialize variables for the input string, the numerical shift,
// a temporary character code, and the final transformed string.
let initialPhrase = inputRecords[0],
    cyclicShift = parseInt(inputRecords[1]),
    characterValue,
    outputPhrase = "";

// Iterate over each individual character within the initial phrase.
for (let positionIndex = 0; positionIndex < initialPhrase.length; positionIndex++) {
    // Obtain the numeric (ASCII/Unicode) representation of the current character.
    characterValue = initialPhrase[positionIndex].charCodeAt(0);

    // Special handling for the very last character in the sequence.
    if (initialPhrase.length - 1 === positionIndex) {
        // Apply a Caesar-like shift to the last character, wrapping around 'z'.
        characterValue += cyclicShift % 26;
        characterValue += (characterValue > 122) ? -26 : 0; // 'z' is 122

        // Append the newly shifted character to the cumulative output.
        outputPhrase += String.fromCharCode(characterValue);
    } else {
        // For all characters preceding the final one.
        // Check if the character can be converted to 'a' using the remaining shift.
        // (123 is char code of 'z' + 1).
        if ((123 - characterValue) <= cyclicShift && !(initialPhrase[positionIndex] === "a")) {
            // Deduct the shift amount consumed to transform to 'a'.
            cyclicShift -= (123 - characterValue);
            // Add 'a' to the resulting string.
            outputPhrase += "a";
        } else {
            // If the character cannot be shifted to 'a' or is already 'a',
            // retain its original form.
            outputPhrase += initialPhrase[positionIndex];
        }
    }
}

// Display the ultimately processed string to the console output.
console.log(outputPhrase);