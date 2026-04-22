/*
 * This module is designed to process an incoming text stream,
 * performing a character-by-character case inversion operation.
 * It reads from standard input, manipulates the character casing,
 * and then outputs the transformed string to standard output.
 */

// --- Configuration and Utilities ---

/**
 * Defines the ASCII code for the first uppercase letter 'A'.
 * @type {number}
 */
const ASCII_CODE_UPPERCASE_A = 65;

/**
 * Defines the ASCII code for the last uppercase letter 'Z'.
 * @type {number}
 */
const ASCII_CODE_UPPERCASE_Z = 90;

/**
 * Checks if a given character code falls within the ASCII range
 * for uppercase English alphabet letters.
 * @param {number} charNumericValue - The ASCII or Unicode value of a character.
 * @returns {boolean} True if the character is an uppercase letter, false otherwise.
 */
function isCharacterUppercaseAlpha(charNumericValue) {
  return charNumericValue >= ASCII_CODE_UPPERCASE_A && charNumericValue <= ASCII_CODE_UPPERCASE_Z;
}

// --- Main Processing Logic ---

// Acquire the file system module for input operations.
const fileSystemModule = require('fs');

// Read all incoming data from the standard input stream.
// It's assumed to be UTF-8 encoded text.
let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// A buffer to accumulate the modified characters. Using an array is often
// more efficient for many concatenations than repeated string additions.
const transformedCharacterAccumulator = [];

// Validate if any input was received. If not, there's nothing to process.
// If the input is not a string, or is null/undefined, treat it as empty.
if (rawInputContent === null || typeof rawInputContent !== 'string') {
    rawInputContent = ''; // Normalize to an empty string.
}

// Determine the total number of characters to iterate over.
const sourceTextLength = rawInputContent.length;

// If the input is empty after validation, no processing is needed.
if (sourceTextLength === 0) {
    process.stdout.write('\n'); // Output a newline for consistency.
    process.exit(0); // Terminate gracefully without further processing.
}

// Iterate through each character of the source text.
for (let currentCharacterIndex = 0; currentCharacterIndex < sourceTextLength; ++currentCharacterIndex) {
  // Extract the current character at the given position.
  const individualCharacter = rawInputContent[currentCharacterIndex];

  // Get the numerical ASCII/Unicode value of the character for comparison.
  const characterCodePoint = individualCharacter.charCodeAt(0);

  // Apply the case inversion logic.
  let modifiedCharacterSegment;
  if (isCharacterUppercaseAlpha(characterCodePoint)) {
    // If it's an uppercase letter, convert it to lowercase.
    modifiedCharacterSegment = individualCharacter.toLowerCase();
  } else {
    // Otherwise (it's lowercase, a number, symbol, etc.), convert it to uppercase.
    modifiedCharacterSegment = individualCharacter.toUpperCase();
  }

  // Add the processed character to our accumulation buffer.
  transformedCharacterAccumulator.push(modifiedCharacterSegment);
}

// Join all accumulated characters into a single string.
const finalProcessedString = transformedCharacterAccumulator.join('');

// Remove any leading or trailing whitespace from the final string
// before presenting the result. This ensures a clean output.
const trimmedOutputResult = finalProcessedString.trim();

// Output the final transformed string to standard output, followed by a newline character.
// Using process.stdout.write for direct stream output, which is an alternative to console.log.
process.stdout.write(trimmedOutputResult + '\n');