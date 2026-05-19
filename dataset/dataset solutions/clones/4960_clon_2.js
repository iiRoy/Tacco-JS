'use strict';

/**
 * Processes an input string to modify a word based on a numeric value.
 * This function implements a specific character manipulation algorithm.
 * @param {string} rawData - The raw input string, expected to be two lines separated by newline.
 */
function ProcessInput(rawData) {
  // Split the input into individual lines.
  let parsedLines = rawData.split("\n");

  // The first line is the word to be modified.
  let currentWord = parsedLines[0];

  // The second line is a numeric value, parsed as an integer.
  let remainingOperations = parseInt(parsedLines[1]);

  // Initialize an index to iterate through the characters of the word.
  let currentIndex = 0;

  // Continue processing as long as there are operations remaining.
  while (remainingOperations > 0) {
    // Check if the character at the current index is 'a'.
    if (currentWord[currentIndex] === "a") {
      // If it's 'a', move to the next character without using any operations.
      currentIndex++;
    } else {
      // Calculate the cost to change the current character to 'a' by wrapping around the alphabet.
      // 'a' has char code 97. (char_code - 97 + 1) gives 1 for 'a', 2 for 'b', ..., 26 for 'z'.
      // 27 - (value) gives the "distance" to 'a' by wrapping. E.g., 'z' (26) needs 1 operation (27-26).
      const costToChangeToA = 27 - (currentWord[currentIndex].charCodeAt(0) - 97 + 1);

      // If we have enough operations to change the current character to 'a'.
      if (costToChangeToA <= remainingOperations) {
        // Deduct the cost from the total operations.
        remainingOperations -= costToChangeToA;

        // Replace the current character with 'a'.
        currentWord = currentWord.slice(0, currentIndex) + "a" + currentWord.slice(currentIndex + 1);

        // Move to the next character.
        currentIndex++;
      } else {
        // If we don't have enough operations to change to 'a',
        // and this is the last character in the word.
        if (currentWord.length === (currentIndex + 1)) {
          // Apply the remaining operations to this last character.
          // The operations are modulo 26 to ensure wrapping within the alphabet.
          remainingOperations %= 26;

          // Calculate the new character code by adding the remaining operations.
          let charValue = (currentWord[currentIndex].charCodeAt(0) + remainingOperations);

          // If the new character code exceeds 'z' (122), wrap it around to 'a'.
          // For example, if charValue is 123, it should become 97 ('a').
          // 123 - 122 = 1. 97 - 1 = 96. So 96 + 1 = 97.
          if (charValue > 122) {
            charValue += (-122 + 97 - 1);
          }

          // Convert the new character code back to a character.
          let finalChar = String.fromCharCode(charValue);

          // All operations are now used for this character, so set remaining operations to zero.
          remainingOperations = 0;

          // Update the word with the new last character.
          currentWord = currentWord.slice(0, currentIndex) + finalChar + currentWord.slice(currentIndex + 1);
        } else {
          // If it's not the last character and we can't change it to 'a',
          // just move to the next character.
          currentIndex++;
        }
      }
    }
  }

  // Output the final modified word to the console.
  console.log(currentWord);
}

// Read input from standard input (e.g., /dev/stdin) and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
