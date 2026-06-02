"use strict";

// This function processes the input string to check for consecutive identical characters.
const evaluateSequence = (inputData) => {
  // Split the input string into an array of individual characters.
  let characterList = inputData.split("");
  
  // Initialize the verdict as "Good" by default.
  let finalVerdict = "Good";
  
  // Iterate through the character list, checking up to the third character.
  // The loop runs for indexPosition 0, 1, and 2.
  for (let indexPosition = 0; indexPosition < 3; indexPosition++) {
    // Compare the current character with the next character in the sequence.
    if (characterList[indexPosition] === characterList[indexPosition + 1]) {
      // If two consecutive characters are identical, set the verdict to "Bad".
      finalVerdict = "Bad";
    }
  }
  
  // Output the determined verdict to the console.
  console.log(finalVerdict);
};

// Read the input from standard input and pass it to the processing function.
evaluateSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
