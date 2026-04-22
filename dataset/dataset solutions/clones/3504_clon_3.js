'use strict';

/**
 * Processes a given string, performing a character-level substitution.
 * This function iterates through the input string and replaces specific digits:
 * '1' is changed to '9', and any other character (implicitly '9' in the original context) is changed to '1'.
 * The result is a new string with these character transformations applied.
 *
 * @param {string} sourceSequence The original textual data to be processed.
 * @returns {string} The modified string after all substitutions are complete. Returns an empty string if input is invalid.
 */
function performDigitSwap(sourceSequence) {
  // Initialize a dynamic array to accumulate the transformed characters.
  // Building an array and then joining is often more performant for many appends
  // than repeated string concatenation.
  const modifiedCharactersBuffer = [];

  // --- Type III Addition: Input validation guard clause ---
  // Ensure the input is a valid non-empty string before attempting to process it.
  if (typeof sourceSequence !== 'string' || sourceSequence.length === 0) {
    console.warn("Warning: The provided source sequence is either not a string or is empty. Returning an empty result.");
    return ''; // Return an empty string for invalid or empty input to prevent errors.
  }

  // Convert the input string into an iterable array of its individual characters.
  // This provides a clear and standard way to iterate over each character.
  const individualCharacters = Array.from(sourceSequence);

  // Iterate over each character obtained from the input string.
  // Using a 'for...of' loop for direct access to the character values, which is idiomatic.
  for (const currentSourceChar of individualCharacters) {
    let targetChar; // --- Type III Addition: Intermediate variable for clarity ---

    // --- Type III Update: Rewrite conditional logic from a ternary operator to an if-else block ---
    // Apply the core transformation rule: '1' becomes '9', and '9' (or any other character,
    // as per the implicit rule in the original code for non-'1's) becomes '1'.
    if (currentSourceChar === '1') {
      targetChar = '9';
    } else {
      // In the context of the original problem, this branch handles '9's.
      // Any other character would also be converted to '1' by this logic.
      targetChar = '1';
    }

    // Add the newly determined target character to our buffer.
    modifiedCharactersBuffer.push(targetChar);
  }

  // Join all the characters in the buffer to form the final transformed string.
  const finalTransformedOutput = modifiedCharactersBuffer.join('');

  // Deliver the resulting string.
  return finalTransformedOutput;
}

/**
 * Obtains the raw textual data from the standard input stream.
 * This is a common method for receiving input in command-line environments.
 *
 * @returns {string} The content read from stdin, decoded as UTF-8. Returns an empty string on error.
 */
function acquireSystemInput() {
  // --- Type III Update: Encapsulated input reading into a dedicated, robust function ---
  try {
    // Dynamically require the 'fs' (file system) module, typical in Node.js environments.
    const fileSystemInterface = require('fs');
    // Synchronously read the entire content of the standard input file descriptor.
    // '/dev/stdin' is the conventional path for standard input on Unix-like systems.
    // 'utf8' specifies the encoding to correctly interpret the characters.
    const rawDataBuffer = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

    // --- Type III Addition: Trim leading/trailing whitespace, notably newlines from stdin ---
    return rawDataBuffer.trim();
  } catch (dataReadError) {
    // --- Type III Addition: Basic error handling for input operations ---
    console.error("An error occurred while attempting to read from standard input:", dataReadError.message);
    return ''; // Return an empty string or handle the error as appropriate for the application.
  }
}

/**
 * Orchestrates the entire process: acquiring input, performing the transformation,
 * and outputting the final result. This serves as the main entry point for execution.
 */
function executeFullTransformationWorkflow() {
  // Step 1: Retrieve the initial data string from the system's standard input.
  const initialInputContent = acquireSystemInput();

  // Step 2: Apply the core digit-swapping logic to the acquired content.
  const processedResultString = performDigitSwap(initialInputContent);

  // Step 3: Display the final transformed string to the standard output.
  console.log(processedResultString);
}

// Initiate the execution of the full transformation workflow.
executeFullTransformationWorkflow();