const POSITIVE_OUTCOME_MSG = 'YES';
const NEGATIVE_OUTCOME_MSG = 'NO';

/**
 * Generates a reversed version of the provided string.
 * This utility function enhances modularity and readability.
 * @param {string} sourceText - The string intended for reversal.
 * @returns {string} The string with its characters in reverse order.
 */
function obtainReversedString(sourceText) {
  // Explicitly ensure the input is treated as a string, handling potential non-string inputs gracefully.
  const stringifiedInput = String(sourceText);

  // Convert the string into an array of characters.
  // Using Array.from() is an alternative to split('') for robust character handling.
  const characterComponents = Array.from(stringifiedInput);

  // Reverse the order of elements within the character array.
  const reversedComponents = characterComponents.reverse();

  // Join the reversed characters back together to form the final reversed string.
  const finalReversedForm = reversedComponents.join('');

  return finalReversedForm;
}

/**
 * Processes a multi-line text input to determine if the first significant line
 * is the exact reverse of the second significant line.
 * This serves as the primary processing unit for the application's logic.
 * @param {string} rawInputText - The complete raw string data provided, expected to contain multiple lines.
 */
function evaluateStringReversalMatch(rawInputText) {
  // Divide the raw input text into individual lines based on newline characters.
  const parsedInputLines = rawInputText.split('\n');

  // Guard clause: Ensure that there are at least two lines of input available for comparison.
  // If not, the comparison cannot be performed meaningfully.
  if (parsedInputLines.length < 2) {
    console.log(NEGATIVE_OUTCOME_MSG);
    return; // Terminate execution early as insufficient data is present.
  }

  // Extract the first line, which represents the candidate string to be reversed.
  const candidateString = parsedInputLines[0];

  // Extract the second line, which serves as the reference string for comparison.
  const referenceString = parsedInputLines[1];

  // Utilize the helper function to obtain the reversed version of the candidate string.
  const derivedReversedCandidate = obtainReversedString(candidateString);

  // Initialize a variable to store the outcome of the comparison.
  let finalComparisonOutcome;

  // Perform the core comparison logic.
  // Explicitly casting the reference string to ensure type consistency for comparison.
  if (derivedReversedCandidate === String(referenceString)) {
    finalComparisonOutcome = POSITIVE_OUTCOME_MSG;
  } else {
    finalComparisonOutcome = NEGATIVE_OUTCOME_MSG;
  }

  // Output the determined outcome to the standard output stream.
  console.log(finalComparisonOutcome);
}

// This immediately invoked function expression (IIFE) handles the initial
// setup and execution flow, including reading input from the system.
(function initializeAndExecuteProcessing() {
  try {
    // Attempt to read all data from the standard input stream.
    // 'utf8' encoding is specified to correctly handle text data.
    const systemInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Pass the acquired system input data to the main processing function.
    evaluateStringReversalMatch(systemInputBuffer);
  } catch (errorReadingInput) {
    // Implement basic error handling for issues encountered during input acquisition.
    // This provides robustness against environmental or input-related problems.
    console.error("An error occurred during input processing:", errorReadingInput.message);
    // In case of an error, default to a negative outcome to avoid undefined behavior.
    console.log(NEGATIVE_OUTCOME_MSG);
  }
})();