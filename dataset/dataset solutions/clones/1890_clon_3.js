// This module provides a utility function to process a specific type of textual input.

/**
 * Executes a predefined transformation logic on a given string.
 * It maps specific input strings to corresponding output strings.
 *
 * @param {string} incomingDataPayload - The raw string data received from an external source.
 *                                     Expected to be a short identifier string.
 */
function initiateTextTransformation(incomingDataPayload) {
  // Define the set of expected input patterns.
  const primaryInputPattern = "ABC";
  const secondaryInputPattern = "ARC";

  // Define the corresponding output results for the patterns.
  const primaryOutputResult = "ARC";
  const secondaryOutputResult = "ABC";

  // A default message to be used if no known input pattern is matched.
  // This handles cases not explicitly covered by the primary logic (Type III addition).
  const unmatchedInputResponse = "INVALID_CODE";

  /**
   * Helper function to output the final processed message.
   * This abstracts away the direct console logging for potential future changes (Type III addition).
   * @param {string} messageToDisplay - The string to be shown to the user.
   */
  const presentOutput = (messageToDisplay) => {
    console.log(messageToDisplay);
  };

  // Pre-process the incoming data: ensure consistency by removing leading/trailing whitespace.
  // This is an intermediate step added for robustness (Type III modification).
  const standardizedInput = incomingDataPayload.trim();

  // Establish a lookup table (map) for the transformation rules.
  // This replaces sequential conditional checks (if/else if) with a data-driven approach (Type III modification).
  const transformationRules = {
    [primaryInputPattern]: primaryOutputResult,
    [secondaryInputPattern]: secondaryOutputResult,
  };

  // Determine the final output based on the standardized input.
  // If the input matches a key in our rules, use its value; otherwise, fall back to the default response.
  const computedTransformationResult = transformationRules[standardizedInput] || unmatchedInputResponse;

  // Display the final result of the transformation.
  presentOutput(computedTransformationResult);
}

// --- Application Execution Context ---
// This section manages how the script is invoked and gathers its input.

// Check if the script is being run directly as the main module.
// This is a more robust entry point handling (Type III addition).
if (typeof require !== 'undefined' && require.main === module) {
  try {
    // Attempt to read data from the standard input file path.
    // This assumes a Unix-like environment where /dev/stdin represents standard input.
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Pass the raw input string to our primary processing function.
    initiateTextTransformation(rawSystemInput);
  } catch (executionError) {
    // Implement basic error handling for file system operations.
    // This adds a guard clause for unexpected issues (Type III addition).
    presentOutput(`Error encountered during input retrieval: ${executionError.message}`);
  }
} else {
  // This branch would be executed if the script were imported as a module into another script.
  // For this specific problem, it's not the intended execution path, but illustrates added logic (Type III addition).
  presentOutput("Warning: Script executed in a non-main context. No automatic processing initiated.");
}