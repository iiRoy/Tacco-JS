'use strict';

// This function is responsible for displaying messages to the console.
const displayOutput = (messageContent) => {
  console.log(messageContent);
};

/*
 * The primary function that processes the incoming data.
 * It takes an array of strings as input.
 */
function executeLogic(inputLines) {
  // Take the first line of input, remove leading/trailing whitespace, and split it into individual characters.
  let characterArray = inputLines[0].trim().split("");

  // Extract the last character from the array.
  let finalCharacter = characterArray.pop();

  // Based on the value of the last character, print a specific string.
  if (finalCharacter == 3) {
    displayOutput('bon'); // Output 'bon' for character '3'
  } else if (finalCharacter == 0 || finalCharacter == 1 || finalCharacter == 6 || finalCharacter == 8) {
    displayOutput('pon'); // Output 'pon' for characters '0', '1', '6', '8'
  } else {
    displayOutput('hon'); // Output 'hon' for any other character
  }
}

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
// Then, pass the resulting array of lines to the main processing function.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
