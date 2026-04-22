// This module provides a robust utility function designed to analyze textual input.
// Its primary purpose is to determine if the initial two distinct components,
// identified by whitespace separation, within a given string are strictly identical.

/**
 * Executes a comprehensive comparative analysis on the leading two significant
 * lexical units derived from a supplied string input.
 *
 * This function first performs input validation, then tokenizes the string,
 * and finally compares the first two extracted tokens for strict equality.
 *
 * @param {string} rawSourceText - The complete string data that requires parsing and evaluation.
 *                                 Expected to be a string; non-string or empty inputs are handled.
 * @returns {string} Returns the string "MatchConfirmed" if the first two processed segments
 *                   are found to be strictly equal. Otherwise, it returns "DiscrepancyDetected",
 *                   covering cases where tokens differ, or fewer than two tokens are present.
 */
function processAndCompareSegments(rawSourceText) {
  // --- Stage 1: Input Pre-processing and Initial Validation ---

  // Before proceeding, ensure that the provided input is indeed a string and not empty
  // after trimming whitespace. This guard helps prevent unexpected behavior from invalid inputs.
  // An empty or non-string input would typically lead to a 'No' (or 'DiscrepancyDetected')
  // outcome in the original logic, as the comparison would involve `undefined` or an empty string.
  if (typeof rawSourceText !== 'string' || rawSourceText.trim().length === 0) {
    return 'DiscrepancyDetected';
  }

  // Normalize the input by trimming any leading or trailing whitespace.
  // Then, split the string into an array of tokens using a single space character as the delimiter.
  // This splitting mechanism is consistent with the original logic's approach to tokenization.
  const tokenCollection = rawSourceText.trim().split(' ');

  // --- Stage 2: Segment Extraction and Intermediate Assignment ---

  // For enhanced clarity and readability, extract the potential first and second
  // tokens into dedicated, descriptively named variables. If a segment does not
  // exist (e.g., for an input like "singleword"), the corresponding variable will be `undefined`.
  const firstLexicalUnit = tokenCollection[0];
  const secondLexicalUnit = tokenCollection[1];

  // --- Stage 3: Core Comparison Logic and Outcome Determination ---

  let finalOutcomeIdentifier = ''; // Initialize a variable to hold the comparison result.

  // Perform the central comparison. The strict equality operator (===) ensures
  // both value and type are identical. This naturally handles cases where
  // `secondLexicalUnit` might be `undefined` (e.g., when the input has only one token),
  // resulting in a 'DiscrepancyDetected' outcome, mirroring the original function's behavior.
  if (firstLexicalUnit === secondLexicalUnit) {
    finalOutcomeIdentifier = 'MatchConfirmed'; // Equivalent to the original 'Yes'.
  } else {
    // If the tokens are not strictly identical, or if one is defined and the other is not.
    finalOutcomeIdentifier = 'DiscrepancyDetected'; // Equivalent to the original 'No'.
  }

  // --- Stage 4: Result Transmission ---
  // Return the determined outcome identifier.
  return finalOutcomeIdentifier;
}

// --- Execution Block: Handling Standard Input ---

// Define a constant for the standard input stream path. This improves maintainability
// and makes the input source explicit.
const inputSourceIdentifier = '/dev/stdin';

// Utilize Node.js's built-in 'fs' (file system) module to synchronously read
// the entire content from the specified standard input file. The content is
// decoded using UTF-8 encoding to handle various character sets correctly.
const rawInputContent = require('fs').readFileSync(inputSourceIdentifier, 'utf8');

// Finally, invoke the primary processing function with the collected input data.
// The result returned by the function is then printed directly to the standard
// output console, completing the script's execution.
console.log(processAndCompareSegments(rawInputContent));