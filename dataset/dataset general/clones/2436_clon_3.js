'use strict';

/**
 * This utility module provides a robust function to sanitize input values
 * by escaping specific characters. It primarily focuses on ensuring
 * backslashes and single quotes are properly escaped, making the resulting
 * string safe for contexts where these characters could cause syntax errors
 * or unexpected behavior, such as within string literals in generated code.
 *
 * @param {*} inputData The value to be processed and escaped.
 * @returns {string} The escaped string representation of the input data.
 */
module.exports = function processAndEscapeString(inputData) {
  // --- Type III: Guard Clause / Input Validation ---
  // Ensure the provided input is neither null nor undefined to prevent
  // potential runtime errors during string conversion.
  if (inputData === null || inputData === undefined) {
    // In such cases, returning an empty string is a common and safe default
    // to avoid breaking subsequent operations that expect a string.
    return '';
  }

  // --- Type III: Intermediate Step / Explicit Type Coercion ---
  // Convert the input value into its string representation explicitly.
  // Using the String() constructor is a reliable way to coerce any value
  // to a string, including primitives and objects.
  const initialStringRepresentation = String(inputData);

  // --- Type III: Rewrite of Core Logic with Helper Variables ---
  // Instead of relying on chained regular expression replacements,
  // we iterate through the string character by character. This approach
  // provides fine-grained control and can be more performant for
  // very large strings or when dealing with complex escaping rules.
  let finalEscapedOutput = '';
  const dataLength = initialStringRepresentation.length;

  for (let charIndex = 0; charIndex < dataLength; charIndex++) {
    const currentCharacter = initialStringRepresentation[charIndex];

    // --- Type III: Detailed Conditional Logic (instead of regex) ---
    // Apply specific escaping rules based on the character.
    switch (currentCharacter) {
      case '\\': // If a backslash is encountered, double it.
        finalEscapedOutput += '\\\\';
        break;
      case '\'': // If a single quote is encountered, escape it with a backslash.
        finalEscapedOutput += '\\\'';
        break;
      default: // For all other characters, append them as they are.
        finalEscapedOutput += currentCharacter;
        break;
    }
  }

  // Return the fully processed and escaped string.
  return finalEscapedOutput;
};