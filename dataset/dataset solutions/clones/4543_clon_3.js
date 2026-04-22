"use strict";

/**
 * Analyzes an input string to determine if it contains any adjacent identical characters.
 *
 * @param {string} sourceText The raw string input to be processed.
 */
const AnalyzeStringPattern = (sourceText) => {
  // Initialize a flag to track if a problematic sequence is found.
  let isProblematicSequenceDetected = false;

  // --- Input Sanitization and Preparation ---
  // Ensure the input is treated as a string and remove leading/trailing whitespace.
  const cleanedInput = String(sourceText || '').trim();

  // Convert the cleaned string into an array of individual characters.
  // This helps in iterating and comparing adjacent elements.
  const characterTokens = Array.from(cleanedInput);

  // --- Early Exit / Edge Case Handling ---
  // If the input string is empty or has only one character,
  // there cannot be any adjacent identical characters.
  if (characterTokens.length < 2) {
    console.log("yes"); // No adjacent duplicates found.
    return; // Terminate function execution.
  }

  // --- Core Pattern Detection Logic ---
  // Iterate through the character tokens, comparing each character with its immediate successor.
  // The loop runs up to the second-to-last character to safely access 'i + 1'.
  for (let currentPos = 0; currentPos < characterTokens.length - 1; ++currentPos) {
    const primaryChar = characterTokens[currentPos];
    const nextChar = characterTokens[currentPos + 1];

    // Check if the current character is identical to the next one.
    if (primaryChar === nextChar) {
      isProblematicSequenceDetected = true; // Mark that an identical pair was found.
      break; // No need to check further, the condition is met.
    }
  }

  // --- Final Output Determination ---
  // Based on whether a problematic sequence was detected, output the corresponding message.
  const finalVerdict = isProblematicSequenceDetected ? "no" : "yes";
  console.log(finalVerdict);
};

// --- Execution Entry Point ---
// Read the input from standard input and pass it to the analysis function.
// This ensures compatibility with typical competitive programming environments.
AnalyzeStringPattern(require('fs').readFileSync('/dev/stdin', 'utf8'));