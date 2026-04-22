process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to store all lines read from standard input
let inputBuffer = [];

// Initialize a readline interface to handle input stream events
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Output stream is not directly used for printing here, but part of the interface setup
});

// Event handler for each line received from the input stream
inputProcessor.on('line', (currentLine) => {
  // Trim any leading/trailing whitespace and store the line
  const trimmedLine = currentLine.trim();
  if (trimmedLine.length > 0) { // Only store non-empty lines
    inputBuffer.push(trimmedLine);
  }
});

// Event handler for when the input stream closes (e.g., EOF)
inputProcessor.on('close', () => {
  // --- Input Data Validation and Extraction ---
  if (inputBuffer.length < 2) {
    console.error("Error: Insufficient input provided. Expected at least two lines for processing.");
    return; // Terminate execution if required input is missing
  }

  // The first line is expected to be the numeric shift value
  const rawShiftValue = inputBuffer[0];
  const cipherShiftAmount = parseInt(rawShiftValue, 10); // Parse as base-10 integer

  // Validate the parsed shift amount
  if (isNaN(cipherShiftAmount) || cipherShiftAmount < 0) { // Ensure it's a non-negative number
    console.error(`Error: Invalid shift value '${rawShiftValue}'. Must be a non-negative integer.`);
    return;
  }

  // The second line is the text to be transformed
  const sourceTextContent = inputBuffer[1];

  // --- Core Alphabet Definition ---
  // Dynamically generate the uppercase English alphabet array
  const uppercaseAlphabet = Array.from({ length: 26 }, (_, index) => String.fromCharCode('A'.charCodeAt(0) + index));
  const alphabetLength = uppercaseAlphabet.length; // Cache length for efficiency

  // --- Helper Function for Character Transformation ---
  /**
   * Applies a Caesar cipher shift to a single uppercase English character.
   * Non-alphabet characters are returned without modification.
   * @param {string} charToShift The character to transform.
   * @param {number} shiftValue The amount to shift the character by.
   * @returns {string} The shifted character, or the original if not an uppercase letter.
   */
  const processSingleCharacter = (charToShift, shiftValue) => {
    const originalCharPosition = uppercaseAlphabet.indexOf(charToShift);

    // If the character is not found in our alphabet (e.g., lowercase, symbol, space),
    // return it as is. This is a Type III robustness enhancement.
    if (originalCharPosition === -1) {
      return charToShift;
    }

    // Calculate the new position with wrap-around using the modulo operator
    let newCharPosition = (originalCharPosition + shiftValue) % alphabetLength;

    // Handle potential negative results from modulo if shiftValue was negative
    if (newCharPosition < 0) {
      newCharPosition += alphabetLength;
    }

    return uppercaseAlphabet[newCharPosition];
  };

  // --- Main Text Transformation Loop ---
  // Use an array to accumulate characters for potentially better performance than repeated string concatenation
  let transformedCharacterFragments = [];

  for (let charIterator = 0; charIterator < sourceTextContent.length; charIterator++) {
    const currentInputChar = sourceTextContent[charIterator];
    const shiftedChar = processSingleCharacter(currentInputChar, cipherShiftAmount);
    transformedCharacterFragments.push(shiftedChar);
  }

  // Join the processed character fragments to form the final output string
  const finalCipherResult = transformedCharacterFragments.join('');

  // Output the transformed text to standard output
  console.log(finalCipherResult);
});

// A small note: This implementation focuses on uppercase English letters.
// Further Type III modifications could include handling lowercase, numbers, or other character sets.