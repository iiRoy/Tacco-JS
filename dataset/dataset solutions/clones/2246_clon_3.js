// This module provides functionality to identify the character immediately following a given
// single lowercase Latin character within the standard alphabet sequence.
// It includes robust input validation and uses programmatic generation for its character set.

/**
 * Processes an input string to find and display the subsequent letter in the alphabet.
 *
 * @param {string} rawInputText - The raw string received, expected to contain a single lowercase letter.
 * @returns {void} This function prints its output directly to the console.
 */
function determineNextLetterInSequence(rawInputText) {
  // --- Stage 1: Input Validation and Normalization ---
  // Validate the presence and type of the input payload.
  if (!rawInputText || typeof rawInputText !== 'string') {
    console.error("ERROR_CODE_001: Input payload is missing or not a string type.");
    return; // Terminate execution for invalid input.
  }

  // Remove any leading or trailing whitespace from the raw input.
  const processedInput = rawInputText.trim();

  // Ensure the processed input represents a single character.
  if (processedInput.length !== 1) {
    console.error("ERROR_CODE_002: Expected a single character. Received input length of " + processedInput.length + " after trimming.");
    return;
  }

  // Store the validated single character for further operations.
  const validatedChar = processedInput;

  // --- Stage 2: Alphabet Sequence Generation ---
  // Define the range for lowercase Latin letters using ASCII character codes.
  const startCharCode = 'a'.charCodeAt(0); // ASCII value for 'a'
  const endCharCode = 'z'.charCodeAt(0);   // ASCII value for 'z'
  const totalAlphabetLetters = endCharCode - startCharCode + 1; // Should be 26

  // Programmatically construct the array of lowercase Latin characters.
  // This replaces a hardcoded array literal with a generative approach.
  let latinLowercaseSequence = [];
  for (let charOffset = 0; charOffset < totalAlphabetLetters; charOffset++) {
    const currentLetterCode = startCharCode + charOffset;
    latinLowercaseSequence.push(String.fromCharCode(currentLetterCode));
  }
  // At this point, latinLowercaseSequence holds ['a', 'b', ..., 'z']

  // --- Stage 3: Character Position Discovery ---
  // The original code used `indexOf`. Here, we'll manually iterate for a Type III rewrite.
  let charIndexPosition = -1; // Initialize with an invalid index.
  let sequenceLength = latinLowercaseSequence.length; // Cache length for loop efficiency.

  for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
    // Compare the validated input character with each element in our generated sequence.
    if (latinLowercaseSequence[currentIdx] === validatedChar) {
      charIndexPosition = currentIdx; // Found the character's position.
      break; // Exit loop once found.
    }
  }

  // --- Stage 4: Post-Discovery Validation ---
  // Check if the input character was successfully located within the alphabet.
  if (charIndexPosition === -1) {
    console.error(`ERROR_CODE_003: The character '${validatedChar}' is not a standard lowercase Latin alphabet letter.`);
    return;
  }

  // --- Stage 5: Determine Successor Character ---
  // Define the offset to find the next character.
  const nextCharOffset = 1; // To find the character immediately following.

  // Calculate the index of the successor character.
  const successorIndex = charIndexPosition + nextCharOffset;

  // Retrieve the character at the calculated successor index.
  // If the input was 'z', successorIndex will be 26, and latinLowercaseSequence[26] will be undefined.
  const nextAlphabeticalChar = latinLowercaseSequence[successorIndex];

  // --- Stage 6: Output Result ---
  // Present the identified successor character. If 'z' was input, nextAlphabeticalChar will be undefined,
  // matching the original code's behavior for this edge case.
  console.log(nextAlphabeticalChar);
}

// --- Execution Entry Point ---
// This block is responsible for reading the system's standard input
// and initiating the character processing workflow.
try {
  // Use Node.js 'fs' module to synchronously read the entire content
  // from /dev/stdin (standard input) as a UTF-8 encoded string.
  const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Invoke the main processing function with the obtained input.
  determineNextLetterInSequence(stdInputContent);
} catch (fileSystemError) {
  // Catch and report any errors that occur during file system operations (e.g., reading stdin).
  console.error("FATAL_ERROR_005: An unrecoverable error occurred while attempting to read from standard input:", fileSystemError.message);
  // In a production environment, one might exit the process with a non-zero status code.
  process.exit(1);
}