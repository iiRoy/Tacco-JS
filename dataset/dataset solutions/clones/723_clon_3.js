const lineInput = require('readline');

// This constant defines the specific input string that signals the end of processing.
const TERMINATION_SEQUENCE = ".";

// Set up the interface for reading data line by line from the standard input stream
// and writing output to the standard output stream.
const ioHandler = lineInput.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Executes the core logic for evaluating a string's "bracket balance" based on a specific,
 * potentially unconventional, set of rules derived from the original Java code.
 *
 * @param {string} rawInputString The string received from input to be processed.
 * @returns {string} "yes" if the string is deemed balanced by this logic, "no" otherwise.
 */
function evaluateStructuralIntegrity(rawInputString) {
  // A mutable copy of the input string, which will be transformed.
  let currentProcessingState = rawInputString;

  // First transformation step: Remove a specific set of characters.
  // The original Java regex `[a-zA-Z/d /.]` translates to matching:
  // - any uppercase or lowercase English letter (a-z, A-Z)
  // - a literal forward slash (/)
  // - a literal 'd' character
  // - a literal space character
  // - a literal dot (.)
  // All occurrences of these characters are removed globally.
  const characterStrippingPattern = /[a-zA-Z\/d \/\.]/g;
  currentProcessingState = currentProcessingState.replace(characterStrippingPattern, '');

  // Second transformation step: Iteratively "simplify" the string by removing specific bracket patterns.
  // Critically, the original Java logic used `str.replaceAll(".*pattern.*", "")`.
  // This means if the `pattern` (e.g., `[]` or `()`) is found *anywhere* in the string,
  // the *entire string* is replaced with an empty string. This behavior is intentionally replicated.
  let wasAnyReplacementMade; // Flag to track if the string was modified in the current iteration of the loop.

  do {
    wasAnyReplacementMade = false; // Reset the flag at the start of each iteration.

    // Check for the presence of the '[]' sequence.
    if (currentProcessingState.includes('[]')) {
      // If '[]' is found, replace the entire string with an empty string.
      // The regex `.*\\[\\].*` means "any character sequence, followed by '[]', followed by any character sequence".
      // When matched, the entire string is replaced by an empty string.
      currentProcessingState = currentProcessingState.replace(/.*\\[\\].*/, '');
      wasAnyReplacementMade = true; // Mark that a change occurred.
    }

    // Check for the presence of the '()' sequence.
    if (currentProcessingState.includes('()')) {
      // If '()' is found, replace the entire string with an empty string, similar to '[]'.
      // The regex `.*\\(\\).*` means "any character sequence, followed by '()', followed by any character sequence".
      currentProcessingState = currentProcessingState.replace(/.*\\(\\).*/, '');
      wasAnyReplacementMade = true; // Mark that a change occurred.
    }

    // Continue looping as long as at least one of the patterns caused a replacement in the current pass.
    // If no replacements were made, the string is in a stable state (or is already empty).
  } while (wasAnyReplacementMade);

  // Final determination: If the string is empty after all transformations, it's considered "balanced".
  // Otherwise, it's "unbalanced".
  const outcomeMessage = (currentProcessingState.length === 0) ? "yes" : "no";
  return outcomeMessage;
}

// Event handler for each line received from the standard input.
ioHandler.on('line', (incomingDataUnit) => {
  // Remove leading/trailing whitespace from the input line for robust comparison.
  const cleanedInput = incomingDataUnit.trim();

  // Check if the current line matches the predefined termination sequence.
  if (cleanedInput === TERMINATION_SEQUENCE) {
    // If the termination sequence is encountered, close the input interface.
    ioHandler.close();
    return; // Stop further processing for this line.
  }

  // Handle empty input lines explicitly.
  // Based on the original Java logic, an empty string after initial filtering
  // would result in an empty `workingString`, leading to a "yes" output.
  if (cleanedInput.length === 0) {
    console.log("yes");
    return;
  }

  // Process the cleaned input string using the main evaluation function.
  const analysisResult = evaluateStructuralIntegrity(cleanedInput);

  // Output the determined result to the standard output.
  console.log(analysisResult);
});

// Event handler for when the input stream is completely closed.
ioHandler.on('close', () => {
  // Ensure the Node.js process exits cleanly after all input has been processed.
  process.exit(0);
});