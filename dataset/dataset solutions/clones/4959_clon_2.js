'use strict';

// Obtain input data from standard input, decode it as UTF-8, and then divide it into an array of lines.
const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

// Declare and initialize variables for processing.
// `inputString` holds the primary string from the first line of input.
// `shiftAmount` stores the integer value from the second line, representing a numerical shift.
// `charAscii` is a temporary variable to store the ASCII code of a character during iteration.
// `finalOutput` accumulates the characters to form the final processed string.
let inputString = inputLines[0];
let shiftAmount = parseInt(inputLines[1]);
let charAscii;
let finalOutput = "";

// Iterate through each character of the `inputString` using its index.
for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
  // Retrieve the ASCII (Unicode) value of the character at the current index.
  charAscii = inputString[charIndex].charCodeAt(0);

  // Check if the current character is the very last character in the string.
  if (inputString.length - 1 === charIndex) {
    // For the final character, apply a modular shift.
    // The shift is `shiftAmount` modulo 26, ensuring it wraps around the alphabet.
    charAscii += shiftAmount % 26;
    // If the character's ASCII value exceeds 'z' (122), subtract 26 to wrap it back to 'a' or beyond.
    charAscii += (charAscii > 122) ? -26 : 0;
    // Convert the modified ASCII code back to a character and append it to the result.
    finalOutput += String.fromCharCode(charAscii);
  } else {
    // For all characters that are not the last one.
    // Determine the "cost" to transform the current character to 'a'.
    // This is calculated as (123 - charAscii), where 123 is one more than 'z' (122).
    // If this cost is less than or equal to the remaining `shiftAmount`
    // AND the current character is not already 'a'.
    if ((123 - charAscii) <= shiftAmount && !(inputString[charIndex] === "a")) {
      // Deduct the cost from `shiftAmount`.
      shiftAmount -= (123 - charAscii);
      // Append 'a' to the `finalOutput` as the character has been transformed.
      finalOutput += "a";
    } else {
      // If the conditions for transformation are not met, append the original character as is.
      finalOutput += inputString[charIndex];
    }
  }
}

// Output the completely processed string to the console.
console.log(finalOutput);
