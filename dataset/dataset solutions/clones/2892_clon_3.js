/**
 * @file This script analyzes an input string to count specific character occurrences
 *       and provides a determination based on a defined threshold.
 *       It also includes a testing utility for browser environments.
 * @author CodeCloneExpert
 * @version 1.1
 */

/**
 * Defines the character we are interested in counting within the input sequence.
 * @type {string}
 * @constant
 */
const TARGET_CHARACTER = 'x';

/**
 * Specifies the maximum allowed occurrences of the TARGET_CHARACTER
 * for the input to be considered 'successful'.
 * @type {number}
 * @constant
 */
const ALLOWED_MAX_OCCURRENCES = 7;

/**
 * Processes a given text string, extracting the first line, counting
 * occurrences of a specific character, and returning a categorical result.
 *
 * @param {string} sourceText The raw input string, potentially multi-line.
 * @returns {string} 'YES' if TARGET_CHARACTER occurrences are within ALLOWED_MAX_OCCURRENCES,
 *                   'NO' otherwise. Returns 'INVALID_INPUT' for non-string or empty input.
 */
function evaluateTextForTarget(sourceText) {
  // Input validation: Ensure the provided argument is a valid string.
  if (typeof sourceText !== 'string' || sourceText === null || sourceText === undefined) {
    console.warn('Warning: Received invalid input type. Expected a string.');
    return 'INVALID_INPUT';
  }

  // Extract the primary line from the input.
  // The problem context implies only the first line is relevant for character counting.
  const primaryLineContent = sourceText.split('\n')[0];

  // Handle cases where the first line itself is empty or non-existent after splitting.
  if (!primaryLineContent || primaryLineContent.trim().length === 0) {
    console.info('No substantial content found on the first line for evaluation.');
    return 'NO_CONTENT'; // Indicate that no content was available for analysis.
  }

  // Convert the primary line into an array of individual characters for easier iteration.
  const characterSequence = Array.from(primaryLineContent);

  // Initialize a counter for the target character.
  let characterOccurrenceCounter = 0;

  // Iterate over each character in the sequence to find matches.
  // Using a traditional for loop for explicit control flow.
  for (let sequenceIndex = 0; sequenceIndex < characterSequence.length; sequenceIndex++) {
    const currentCharacter = characterSequence[sequenceIndex];
    // Check if the current character matches our predefined target.
    if (currentCharacter === TARGET_CHARACTER) {
      characterOccurrenceCounter++; // Increment the counter upon a match.
    }
  }

  // Determine the final outcome based on the count and the allowed maximum.
  // This logic is crucial for the problem's core functionality.
  let finalAssessmentOutcome = 'NO'; // Default to 'NO' (failure)
  if (characterOccurrenceCounter <= ALLOWED_MAX_OCCURRENCES) {
    finalAssessmentOutcome = 'YES'; // Change to 'YES' if the condition is met.
  }

  // Log the result for diagnostic purposes.
  console.log(`Analysis Result: ${finalAssessmentOutcome} (Count: ${characterOccurrenceCounter}, Max Allowed: ${ALLOWED_MAX_OCCURRENCES})`);

  // Return the computed assessment.
  return finalAssessmentOutcome;
}

/**
 * Utility function for retrieving values from DOM elements,
 * providing a safe access pattern.
 * @param {string} elementId The ID of the HTML element.
 * @returns {string | null} The value of the element, or null if not found.
 */
const getDomElementValue = (elementId) => document.getElementById(elementId)?.value || null;

/**
 * Performs a validation test for a given scenario number in a browser environment.
 * It fetches input and expected output from specific DOM elements,
 * calls the main analysis function, and displays the comparison result.
 *
 * @param {number} scenarioNumber An identifier for the test case, used to construct DOM element IDs.
 */
function performSolutionValidation(scenarioNumber) {
  console.groupCollapsed(`--- Initiating Test Scenario ${scenarioNumber} ---`);

  // Fetch the input data for the current test scenario.
  const testInputData = getDomElementValue(`input${scenarioNumber}`);
  // Log the input data for debugging purposes.
  console.log(`Test Input: "${testInputData}"`);

  // Ensure input data is available before proceeding with the main logic.
  if (!testInputData) {
    console.error(`Error: Input data for scenario ${scenarioNumber} not found.`);
    document.getElementById(`result${scenarioNumber}`).innerHTML = 'ERR: No Input';
    console.groupEnd();
    return;
  }

  // Execute the primary analysis function with the test input.
  const processedOutput = evaluateTextForTarget(testInputData);
  console.log(`Computed Output: "${processedOutput}"`);

  // Fetch the expected output for comparison.
  const expectedOutcomeRaw = getDomElementValue(`output${scenarioNumber}`);
  // Extract only the first line of the expected outcome, similar to how Main processes input.
  const expectedOutcome = expectedOutcomeRaw ? expectedOutcomeRaw.split('\n')[0] : null;
  console.log(`Expected Output: "${expectedOutcome}"`);

  let validationStatus = 'WA'; // Default to 'Wrong Answer'

  // Compare the computed result with the expected result.
  if (processedOutput === expectedOutcome) {
    validationStatus = 'AC'; // 'Accepted' if they match.
  } else {
    // Provide more detail for a wrong answer.
    console.warn(`Mismatch detected: Expected "${expectedOutcome}", Got "${processedOutput}"`);
  }

  // Display the validation status in the designated result element.
  const resultDisplayElement = document.getElementById(`result${scenarioNumber}`);
  if (resultDisplayElement) {
    resultDisplayElement.innerHTML = validationStatus;
  } else {
    console.error(`Result display element for scenario ${scenarioNumber} not found.`);
  }

  console.groupEnd();
}

// --- Entry Point for Execution ---

// This block handles execution in a Node.js environment (e.g., when run from the command line).
// It attempts to read input from stdin and pass it to the main processing function.
if (typeof require !== 'undefined' && typeof process !== 'undefined' && typeof process.versions.node !== 'undefined') {
  try {
    const fileSystem = require('fs');
    const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    evaluateTextForTarget(standardInputContent);
  } catch (error) {
    console.error('Failed to read from /dev/stdin in Node.js environment:', error);
    // As a fallback, or for testing without stdin, provide a default input.
    // evaluateTextForTarget("xxxxxxxxx\n");
  }
} else {
  // This block provides a placeholder for how the function might be called
  // in a browser context or other non-Node.js environments.
  console.info("Script running in a non-Node.js environment (e.g., browser).");
  console.info("To test, manually call `performSolutionValidation(1)` or similar,");
  console.info("assuming relevant DOM elements (`input1`, `output1`, `result1`) exist.");
  // Example for browser environment if DOM elements are present for `performSolutionValidation`.
  // window.onload = () => {
  //   // You might call a test function here if the page sets up test cases.
  //   // For example, if there's a button to trigger a test:
  //   // document.getElementById('runTestButton').addEventListener('click', () => performSolutionValidation(1));
  // };
  // A simple direct call for demonstration if no DOM interaction is expected.
  // evaluateTextForTarget("xxxyyyzzzxxx\n");
}