// Define essential constants for cryptographic operations.
const UPPER_CASE_ALPHA_START_CODE = 'A'.charCodeAt(0); // ASCII value for 'A'
const ENGLISH_ALPHABET_SPAN = 26; // Number of letters in the English alphabet

/**
 * Applies a Caesar cipher shift to a single character.
 * This function handles the modular arithmetic required for character rotation.
 * It processes all characters based on their ASCII value relative to 'A',
 * consistent with the original code's behavior for any input character.
 *
 * @param {string} characterToShift - The single character to encrypt.
 * @param {number} shiftAmount - The integer shift value (e.g., 3 for a 3-letter shift).
 * @returns {string} The shifted character.
 */
function applyCharacterRotation(characterToShift, shiftAmount) {
  // Retrieve the Unicode code point for the character.
  // Using codePointAt for a slight variation from charCodeAt, though for ASCII it's equivalent.
  const initialCodePoint = characterToShift.codePointAt(0);

  // Calculate its position relative to 'A' (0-indexed for the alphabet).
  // Example: 'A' -> 0, 'B' -> 1, etc.
  const relativeIndex = initialCodePoint - UPPER_CASE_ALPHA_START_CODE;

  // Apply the shift to this relative index.
  // The shift can be positive or negative.
  let shiftedRelativeIndex = (relativeIndex + shiftAmount);

  // Use modulo to wrap around the alphabet (e.g., Z + 1 wraps to A).
  // The expression `(x % n + n) % n` ensures a positive result for the modulo operation
  // in JavaScript, which can return negative results for negative dividends.
  const finalRelativeIndex = (shiftedRelativeIndex % ENGLISH_ALPHABET_SPAN + ENGLISH_ALPHABET_SPAN) % ENGLISH_ALPHABET_SPAN;

  // Convert the final 0-indexed relative position back to an actual Unicode code point.
  const finalCodePoint = finalRelativeIndex + UPPER_CASE_ALPHA_START_CODE;

  // Return the character corresponding to the new code point.
  return String.fromCodePoint(finalCodePoint);
}

/**
 * Reads raw input from standard input, processes it, and returns an array of lines.
 * This function includes basic error handling for file system access and input data.
 *
 * @returns {string[]} An array where each element is a line read from /dev/stdin.
 *                     Returns an empty array if input cannot be read or is empty.
 */
function fetchSystemInputLines() {
  let fileSystemModule;
  try {
    // Dynamically require the 'fs' module, primarily for Node.js environments.
    fileSystemModule = require('fs');
  } catch (e) {
    // Log a fatal error if 'fs' module is unavailable.
    console.error("FATAL ERROR: 'fs' module not found. Cannot read input. Please ensure this script is run in a Node.js environment.");
    return []; // Return an empty array to prevent further processing.
  }

  try {
    // Read the entire content of /dev/stdin synchronously as a UTF-8 string.
    const rawContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Trim any leading or trailing whitespace (like newlines) from the entire input block.
    const cleanedContent = rawContentBuffer.trim();

    // Guard clause: Check if the content is empty after trimming.
    if (cleanedContent.length === 0) {
      console.warn("WARNING: Received empty input from /dev/stdin. Processing will proceed with no data.");
      return []; // Return an empty array if no meaningful input is present.
    }

    // Split the cleaned content into an array of individual lines.
    const individualLines = cleanedContent.split("\n");

    // Optional: For debugging purposes, uncomment the line below to see how many lines were read.
    // console.debug(`DEBUG: Successfully read ${individualLines.length} lines from input.`);

    return individualLines;
  } catch (err) {
    // Catch and report any errors encountered during file reading or processing.
    console.error(`ERROR: Failed to read or process input from /dev/stdin: ${err.message}`);
    return []; // Provide a default empty array on error to prevent cascading failures.
  }
}

/**
 * Main function to orchestrate the Caesar cipher encryption process.
 * It takes an array of input lines, extracts the cipher parameters,
 * applies the cipher to the message text, and outputs the result to the console.
 *
 * @param {string[]} inputLineCollection - An array of strings. The first element
 *                                         is expected to be the integer shift value,
 *                                         and the second element is the text to be encrypted.
 */
function executeCipherTransformation(inputLineCollection) {
  // Input validation: Ensure we have at least two lines of input data.
  // The first line for the shift value, the second for the text.
  if (!Array.isArray(inputLineCollection) || inputLineCollection.length < 2) {
    console.error("OPERATION ABORTED: Insufficient input lines provided. Expected at least 2 lines (shift value, text message).");
    return; // Exit the function early if validation fails.
  }

  // Extract the shift value from the first line of input.
  // Using the Number() constructor for explicit type conversion, similar to the original's `value-0`.
  const cipherShiftValue = Number(inputLineCollection[0]);

  // Validate that the extracted shift value is indeed a valid integer.
  if (isNaN(cipherShiftValue) || !Number.isInteger(cipherShiftValue)) {
    console.error(`OPERATION ABORTED: Invalid shift value "${inputLineCollection[0]}". The shift value must be an integer.`);
    return; // Exit if the shift value is not a proper integer.
  }

  // Extract the message text to be encrypted from the second line of input.
  const originalMessageText = inputLineCollection[1];

  // Initialize an array to store the characters after they have been processed.
  const processedCharactersArray = [];

  // Iterate over each character of the original message text.
  // Using a traditional `for` loop here, as a structural alternative to the original's `map` method.
  for (let charIndex = 0; charIndex < originalMessageText.length; charIndex++) {
    const currentChar = originalMessageText[charIndex];
    // Apply the character rotation using our dedicated helper function.
    const encryptedChar = applyCharacterRotation(currentChar, cipherShiftValue);
    processedCharactersArray.push(encryptedChar); // Add the transformed character to our results array.
  }

  // Join the array of processed characters back into a single string.
  const finalEncryptedOutput = processedCharactersArray.join('');

  // Display the final encrypted string to the console.
  console.log(finalEncryptedOutput);
}

// === Script Execution Entry Point ===
// This block orchestrates the entire process:
// 1. Fetches the input data from the system's standard input.
// 2. Passes the fetched data to the main transformation function for processing.
const receivedApplicationData = fetchSystemInputLines();
executeCipherTransformation(receivedApplicationData);