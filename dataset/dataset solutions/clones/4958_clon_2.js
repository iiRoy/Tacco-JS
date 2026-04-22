'use strict';

// This module provides a character sequence transformation utility.
function transformSequence(inputData) {
  // First, split the incoming raw data into an array of lines.
  const dataLines = inputData.split("\n");

  // The primary string to be processed comes from the first line.
  // The numeric adjustment factor is parsed from the second line.
  let workingString = dataLines[0];
  let adjustmentFactor = parseInt(dataLines[1], 10); // Explicitly specify radix 10 for parsing.

  let characterCode;    // Variable to hold the numeric ASCII code of a character.
  let finalCharacter;   // Variable to store a character after its potential modification.

  // Commence iteration through each character of the working string.
  for (
    let currentPosition = 0; // Initialize our character index.
    currentPosition < workingString.length; // Loop as long as we are within string bounds.
    currentPosition++ // Advance to the next character.
  ) {
    // Retrieve the ASCII value of the character at the current index.
    characterCode = workingString[currentPosition].charCodeAt(0);

    // Special handling for the very last character in the sequence.
    if (workingString.length - 1 === currentPosition) {
      // Apply the remaining adjustment factor to this last character's code.
      // The modulo 26 ensures the shift wraps within the English alphabet's range.
      characterCode += adjustmentFactor % 26;

      // If the shifted character code goes beyond 'z' (ASCII 122),
      // wrap it back around to the beginning of the alphabet ('a', ASCII 97).
      if (characterCode > 122) {
        // This calculation effectively shifts from 'z' back to 'a'.
        characterCode += (-122 + 97 - 1);
      }

      // Convert the modified ASCII code back into a character.
      finalCharacter = String.fromCharCode(characterCode);

      // Reconstruct the working string with the newly transformed last character.
      workingString = workingString.slice(0, currentPosition) + finalCharacter + workingString.slice(currentPosition + 1);
    } else {
      // For all characters except the last one, attempt to reduce them to 'a'.

      // Calculate the numeric shift required to change the current character to 'a'.
      // 'a' is ASCII 97. The expression (characterCode - 97 + 1) gives the 1-indexed position
      // in the alphabet (e.g., 'a' is 1, 'b' is 2).
      // (27 - this_position) gives the "wrap-around" shift needed to reach 'a' by going past 'z'.
      if (
        (27 - (characterCode - 97 + 1)) <= adjustmentFactor && // Check if enough adjustment factor is available
        !(workingString[currentPosition] === "a")                 // And if the character isn't already 'a'
      ) {
        // Deduct the shift amount used from the total adjustment factor.
        adjustmentFactor = adjustmentFactor - (27 - (characterCode - 97 + 1));

        // Replace the current character in the string with 'a'.
        workingString = workingString.slice(0, currentPosition) + "a" + workingString.slice(currentPosition + 1);
      }
    }
  }

  // After processing all characters, print the final transformed string to the console.
  console.log(workingString);
}

// Invoke the transformation function by reading input from the standard input stream.
transformSequence(
  require("fs")
    .readFileSync(
      "/dev/stdin",
      "utf8"
    )
);