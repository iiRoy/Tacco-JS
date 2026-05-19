'use strict';

// This function processes an input string to perform a specific character manipulation.
// It takes a multi-line string as input, where the first line is the target string
// and the second line is an integer representing a shift amount.
function ProcessInput(inputString) {
  // Split the multi-line input into an array of individual lines.
  const inputLines = inputString.split("\n");

  // Initialize the string that will be modified and the numeric shift value.
  // The first element of the array is the string, the second is parsed as an integer.
  let processedString = inputLines[0];
  let shiftAmount = parseInt(inputLines[1], 10); // Parse the shift value with radix 10.

  // Declare variables to temporarily hold character ASCII codes and the final character.
  let charAsciiCode;
  let finalChar;

  // Iterate through each character of the `processedString` using its index.
  for (let charIndex = 0; charIndex < processedString.length; charIndex++) {
    // Obtain the ASCII (Unicode) value of the character at the current index.
    charAsciiCode = processedString[charIndex].charCodeAt(0);

    // Check if the current character is the very last character in the string.
    if (processedString.length - 1 === charIndex) {
      // For the last character, apply the remaining `shiftAmount` modulo 26
      // to ensure it wraps around the alphabet (a-z).
      charAsciiCode += shiftAmount % 26;

      // If the character's ASCII code exceeds 'z' (122),
      // wrap it back to the beginning of the lowercase alphabet ('a' is 97).
      // The calculation (-122 + 97 - 1) is equivalent to subtracting 26.
      if (charAsciiCode > 122) {
        charAsciiCode += (-122 + 97 - 1);
      }

      // Convert the modified ASCII code back into a character.
      finalChar = String.fromCharCode(charAsciiCode);

      // Update the `processedString` by replacing the last character with the newly calculated one.
      processedString = processedString.slice(0, charIndex) + finalChar + processedString.slice(charIndex + 1);
    } else {
      // For any character that is not the last one in the string.
      // Calculate the shift required to transform the current character into 'a'.
      // 'a' has ASCII 97. (charAsciiCode - 97 + 1) gives its 1-based position in the alphabet.
      // (27 - position) gives the shift needed to reach 'a' by wrapping around.
      const shiftToA = (27 - (charAsciiCode - 97 + 1));

      // If the `shiftAmount` is sufficient to change the current character to 'a'
      // AND the current character is not already 'a', then perform this transformation.
      if (shiftToA <= shiftAmount && processedString[charIndex] !== "a") {
        // Deduct the `shiftToA` value from the total `shiftAmount`.
        shiftAmount = shiftAmount - shiftToA;

        // Replace the current character in the string with 'a'.
        processedString = processedString.slice(0, charIndex) + "a" + processedString.slice(charIndex + 1);
      }
    }
  }

  // Output the final, modified string to the standard console.
  console.log(processedString);
}

// Read the entire content from standard input (typically a file like /dev/stdin)
// using Node.js's file system module, and then pass it to the `ProcessInput` function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
