/**
 * @fileoverview This module provides a function to process a given text string,
 * converting the case of alphabetical characters within it.
 * Lowercase letters are transformed to uppercase, and uppercase letters to lowercase.
 * Non-alphabetical characters remain unchanged.
 */

/**
 * Processes an input string, inverting the case of all alphabetical characters.
 * Lowercase letters become uppercase, and uppercase letters become lowercase.
 * Other characters (numbers, symbols, spaces) are preserved in their original form.
 *
 * @param {string} initialText - The raw string input to be processed.
 *                                This function expects a string; non-string inputs
 *                                will be coerced or result in an empty string.
 * @returns {void} This function prints the transformed string to the console,
 *                  trimmed of leading/trailing whitespace.
 */
function adjustCharacterCasing(initialText) {
  // Input validation and normalization: Ensure we are working with a string.
  // If the input is not a string, convert it to an empty string to prevent errors.
  const sourceString = typeof initialText === 'string' ? initialText : '';

  // Early exit for empty or non-string input after normalization.
  if (sourceString.length === 0) {
    console.log(''); // Print an empty line for empty input.
    return;
  }

  // A buffer to store the processed characters. Using an array for efficient
  // string concatenation, especially for long strings, as direct string
  // concatenation can be less performant in loops.
  const transformedCharacterBuffer = [];

  // Define a regular expression to efficiently check if a character is an alphabetical letter.
  // This helps distinguish letters from numbers or symbols that might behave similarly
  // with toLowerCase() / toUpperCase() (e.g., '1'.toLowerCase() === '1').
  const letterPattern = /[a-zA-Z]/;

  // Iterate over each character of the input string using a traditional for loop.
  // The index `charPosition` tracks the current character's location.
  for (let charPosition = 0; charPosition < sourceString.length; charPosition++) {
    const currentCharacter = sourceString[charPosition];
    let modifiedCharacter = currentCharacter; // Default: character remains unchanged.

    // Check if the current character is an alphabetical letter using the regex pattern.
    if (letterPattern.test(currentCharacter)) {
      // If it's a letter, determine its current case and invert it.
      // A character is lowercase if it is equal to its lowercase version AND not equal to its uppercase version.
      // This handles edge cases where numbers or symbols might be equal to both their lower and upper case forms.
      if (currentCharacter === currentCharacter.toLowerCase() && currentCharacter !== currentCharacter.toUpperCase()) {
        modifiedCharacter = currentCharacter.toUpperCase();
      }
      // A character is uppercase if it is equal to its uppercase version AND not equal to its lowercase version.
      else if (currentCharacter === currentCharacter.toUpperCase() && currentCharacter !== currentCharacter.toLowerCase()) {
        modifiedCharacter = currentCharacter.toLowerCase();
      }
      // If a character is alphabetical but doesn't strictly fall into the above (e.g., already converted),
      // it will retain its original form as `modifiedCharacter` was initialized with `currentCharacter`.
    }

    // Add the (potentially modified) character to our buffer.
    transformedCharacterBuffer.push(modifiedCharacter);
  }

  // Join all characters in the buffer to form the final string.
  const finalProcessedString = transformedCharacterBuffer.join('');

  // Output the final string to the standard console, ensuring any
  // leading or trailing whitespace is removed from the result.
  console.log(finalProcessedString.trim());
}

// Entry point for execution:
// Reads content from standard input, assumes UTF-8 encoding, and passes it
// to the `adjustCharacterCasing` function for processing.
// The `require("fs").readFileSync` method is synchronous, suitable for
// simple script execution environments like competitive programming platforms.
adjustCharacterCasing(require("fs").readFileSync("/dev/stdin", "utf-8"));