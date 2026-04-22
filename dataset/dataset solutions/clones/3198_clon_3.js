/**
 * This module defines a core processing unit to evaluate a numerical condition
 * based on input data, typically from a file or user interface.
 * It aims for robust parsing and clear decision logic.
 */

/**
 * Processes a raw string payload containing numerical data to determine a specific outcome.
 *
 * The expected format is a string where the first line contains two space-separated integers.
 * E.g., "10 3\nother data..."
 *
 * @param {string} rawInputPayload The complete input string, potentially multi-lined.
 * @returns {string} "YES" if the condition is met, "NO" if not, or "ERROR" if parsing fails.
 */
function EvaluateNumericalCondition(rawInputPayload) {
  // Input validation: Check for null, undefined, non-string, or empty input.
  if (!rawInputPayload || typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
    console.error("Evaluation Error: Provided input payload is invalid or empty.");
    return "ERROR";
  }

  // Segment the input string into an array of lines.
  const inputLineSegments = rawInputPayload.split("\n");

  // Ensure there's at least one line to process for numerical values.
  if (inputLineSegments.length === 0) {
    console.error("Evaluation Error: No discernible data lines found in the payload.");
    return "ERROR";
  }

  // Focus on the very first line for our critical numerical parameters.
  const primaryDataLine = inputLineSegments[0].trim();

  // Validate that the primary data line isn't empty after trimming.
  if (!primaryDataLine) {
    console.error("Evaluation Error: The first line of data is empty after trimming.");
    return "ERROR";
  }

  // Break down the primary data line into individual numerical tokens using space as a delimiter.
  const candidateNumericalTokens = primaryDataLine.split(" ");

  // We require at least two numerical tokens for the calculation.
  if (candidateNumericalTokens.length < 2) {
    console.error("Evaluation Error: Insufficient numerical tokens found on the primary data line. Expected at least two.");
    return "ERROR";
  }

  // Parse the first required integer value (N in original context).
  const primaryValueString = candidateNumericalTokens[0];
  const primaryNumericalValue = parseInt(primaryValueString, 10); // Explicitly specifying base 10.

  // Validate if the parsed primary value is a legitimate number.
  if (isNaN(primaryNumericalValue)) {
    console.error(`Evaluation Error: Failed to parse primary numerical value from string: '${primaryValueString}'.`);
    return "ERROR";
  }

  // Parse the second required integer value (K in original context).
  const comparisonLimitString = candidateNumericalTokens[1];
  const comparisonLimitValue = parseInt(comparisonLimitString, 10); // Explicitly specifying base 10.

  // Validate if the parsed comparison limit is a legitimate number.
  if (isNaN(comparisonLimitValue)) {
    console.error(`Evaluation Error: Failed to parse comparison limit value from string: '${comparisonLimitString}'.`);
    return "ERROR";
  }

  // Initialize the result flag to its default 'negative' state.
  let finalOutcomeIdentifier = "NO";

  // Perform the core calculation: Divide the primary value by two.
  const intermediateDivisionResult = primaryNumericalValue / 2;

  // Round up the division result to the nearest whole number.
  const ceilingOfHalf = Math.ceil(intermediateDivisionResult);

  // Apply the decision logic: Check if the rounded-up half meets or exceeds the comparison limit.
  if (ceilingOfHalf >= comparisonLimitValue) {
    finalOutcomeIdentifier = "YES"; // Update the flag if the condition is satisfied.
  }

  // Return the determined outcome.
  return finalOutcomeIdentifier;
}

/**
 * Standardized function for logging the final outcome to the console.
 * @param {string} message The message to be displayed.
 */
function OutputEvaluationResult(message) {
  console.log('Final Outcome: %s', message);
}

/**
 * A utility function for simulating the application's execution within a web browser
 * environment, typically triggered by a user interface event.
 * It expects an HTML element with id "testInputArea" to retrieve its value.
 */
function ExecuteWebEnvironmentTest() {
  const browserInputSource = document.getElementById("testInputArea");
  if (browserInputSource && typeof browserInputSource.value === 'string') {
    const browserProvidedData = browserInputSource.value;
    const computedResult = EvaluateNumericalCondition(browserProvidedData);
    OutputEvaluationResult(computedResult);
  } else {
    // If the input element is not found or its value is not accessible,
    // log a warning. This function is meant for debugging and
    // not critical for the main application flow.
    console.warn("Web environment test skipped: Input element 'testInputArea' not found or inaccessible.");
  }
}

/**
 * Main execution routine for server-side (e.g., Node.js) environments.
 * It reads from standard input, processes the data, and outputs the result.
 */
function RunServerApplication() {
  try {
    // Read the entire content from standard input (e.g., /dev/stdin) synchronously.
    // This assumes a Node.js environment with 'fs' module available.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const applicationResult = EvaluateNumericalCondition(standardInputContent);
    OutputEvaluationResult(applicationResult);
  } catch (error) {
    // Gracefully handle any errors during file reading or processing.
    console.error("Application Execution Failure: An unexpected error occurred.", error.message);
    OutputEvaluationResult("APPLICATION_FAILURE");
  }
}

// Immediately-invoked Function Expression (IIFE) to manage application initialization
// and determine the appropriate execution path based on the environment.
(function InitializeAndExecuteApplication() {
  // Check if the current environment appears to be Node.js.
  // This is identified by the presence of the 'process' global object with 'versions.node'.
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    RunServerApplication(); // Execute the server-side logic.
  } else {
    // For other environments (e.g., browser), no automatic execution is triggered globally.
    // The `ExecuteWebEnvironmentTest` function would be called by specific user actions
    // or through other client-side scripting.
    console.info("Application initialized. No automatic execution path detected for this environment.");
  }
})();