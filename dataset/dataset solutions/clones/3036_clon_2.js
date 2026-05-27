'use strict';

/**
 * Processes raw input data to transform a character sequence based on a key index.
 * This function reads three lines of input: a number (N), a string (S), and an index (K).
 * It then identifies the character at index K in string S, and generates a new string
 * where all characters in S matching the identified character are kept, and others are replaced by '*'.
 *
 * @param {string} inputContent - The complete string content read from the standard input.
 */
function ProcessData(inputContent) {
  // Normalize the input string by trimming whitespace and splitting it into an array of lines.
  const parsedLines = inputContent.trim().split(/\n/);

  // Extract the numerical value from the first line (N),
  // the character sequence from the second line (S),
  // and the key index from the third line (K).
  // The first line's value is converted to a number using the unary plus operator.
  const firstNumber = +parsedLines[0]; // N, not directly used in the algorithm, but extracted.
  const charSequence = parsedLines[1].split(''); // S, split into individual characters.
  const keyIndex = parsedLines[2]; // K, the position to find the reference character.

  // Determine the specific character at the `keyIndex` within the `charSequence`.
  const referenceChar = charSequence[keyIndex];

  // Iterate through the `charSequence`. For each character, compare it with the `referenceChar`.
  // If they match, keep the character; otherwise, substitute it with an asterisk '*'.
  // Finally, join all the processed characters back into a single output string.
  const outputResult = charSequence.map(currentSymbol => {
    return currentSymbol === referenceChar ? referenceChar : '*';
  }).join('');

  // Display the final generated string to the console.
  console.log(outputResult);
}

// Execute the main processing function by reading input from standard input.
// The 'fs' module is used to read the file content synchronously from '/dev/stdin' with UTF-8 encoding.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
