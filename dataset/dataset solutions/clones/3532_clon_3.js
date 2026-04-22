// This module provides utilities for evaluating character sequence correspondence.

/**
 * Pre-processes raw input text into an array of character arrays.
 * It performs initial validation of the input string and its structure.
 *
 * @param {string} rawInputContent - The unprocessed string input, expected to contain two lines.
 * @returns {string[][]} An array containing two character arrays (first and second sequence), or null if input is invalid.
 */
const prepareInputSequences = (rawInputContent) => {
  // Guard clause: Ensure the input is a valid, non-empty string.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.error("Input data is either missing, not a string, or empty. Cannot proceed with analysis.");
    return null;
  }

  // Divide the complete input string into individual lines based on newline characters.
  const contentLines = rawInputContent.split('\n');

  // Guard clause: Verify that at least two lines are present for a meaningful comparison.
  if (contentLines.length < 2) {
    console.error("Insufficient data: At least two lines are required for sequence correspondence evaluation.");
    return null;
  }

  // Convert the first two lines into arrays of individual characters.
  const firstCharacterSequence = Array.from(contentLines[0]);
  const secondCharacterSequence = Array.from(contentLines[1]);

  // Return the prepared sequences as a tuple.
  return [firstCharacterSequence, secondCharacterSequence];
};

/**
 * Determines if two character sequences maintain a consistent mapping rule from their prefixes.
 *
 * This function evaluates whether the relationship between the leading characters
 * of two sequences (designated as primary and secondary) remains consistent
 * throughout their respective remaining characters. If a character in the primary
 * sequence at a given position maps to a specific character in the secondary sequence
 * at the same position, this mapping must hold true for all other occurrences
 * where either the primary or secondary leading character reappears.
 *
 * @param {string} incomingData - The raw input string containing two lines of characters to be analyzed.
 */
function EvaluateStringCorrespondence(incomingData) {
  // Utilize a dedicated helper function for initial data preparation and validation.
  const sequences = prepareInputSequences(incomingData);

  // If the input preparation failed (e.g., invalid input format), output "No" and terminate the process.
  if (sequences === null) {
    process.stdout.write("No\n"); // Using process.stdout.write for direct output in Node.js.
    return;
  }

  // Destructure the prepared sequences into distinct variables.
  let [primaryCharacters, secondaryCharacters] = sequences;

  // Initialize a boolean flag to track the overall consistency of the mapping.
  // Assume consistency until an anomaly is detected.
  let isMappingConsistent = true;

  // Outer processing loop: Continues as long as the secondary character sequence
  // still contains elements and no inconsistency has been discovered.
  while (secondaryCharacters.length > 0 && isMappingConsistent) {
    // Capture the current leading characters (anchors) from both sequences for comparison.
    const currentPrimaryAnchor = primaryCharacters[0];
    const currentSecondaryAnchor = secondaryCharacters[0];

    // Inner comparison loop: Iterates through the remaining characters in both sequences,
    // starting from the second element (index 1) to compare against the anchors.
    let comparisonPosition = 1;
    while (comparisonPosition < secondaryCharacters.length) {
      const comparedPrimaryChar = primaryCharacters[comparisonPosition];
      const comparedSecondaryChar = secondaryCharacters[comparisonPosition];

      // Introduce boolean flags for clearer conditional logic.
      const isSecondaryMatchAtPosition = (currentSecondaryAnchor === comparedSecondaryChar);
      const isPrimaryMatchAtPosition = (currentPrimaryAnchor === comparedPrimaryChar);

      // Condition 1: If the secondary anchor character matches the current secondary character,
      // but the primary anchor character *does not* match the current primary character,
      // then an inconsistency is found.
      if (isSecondaryMatchAtPosition && !isPrimaryMatchAtPosition) {
        isMappingConsistent = false; // Mark the mapping as inconsistent.
        break; // Exit the inner loop immediately upon finding an inconsistency.
      }

      // Condition 2: If the primary anchor character matches the current primary character,
      // but the secondary anchor character *does not* match the current secondary character,
      // then an inconsistency is found.
      if (isPrimaryMatchAtPosition && !isSecondaryMatchAtPosition) {
        isMappingConsistent = false; // Mark the mapping as inconsistent.
        break; // Exit the inner loop immediately upon finding an inconsistency.
      }

      // Advance to the next character pair for further comparison.
      comparisonPosition++;
    }

    // If an inconsistency was identified within the inner loop,
    // the outer loop should also be terminated.
    if (!isMappingConsistent) {
      break; // Exit the outer loop.
    }

    // After completing an inner loop pass (or if an inconsistency was found),
    // remove the first elements from both sequences to process the next set of characters.
    // Using `splice` as an alternative to `shift` for structural variation.
    primaryCharacters.splice(0, 1);
    secondaryCharacters.splice(0, 1);
  }

  // Output the final result ("Yes" or "No") based on the consistency flag's state.
  if (isMappingConsistent) {
    process.stdout.write("Yes\n");
  } else {
    process.stdout.write("No\n");
  }
}

// --- Auxiliary functions and execution context setup for different environments ---

/**
 * Provides a mechanism to execute the string correspondence evaluation
 * within a browser environment, typically for debugging or testing purposes.
 * It retrieves input from a designated DOM element.
 */
function executeInBrowserContext() {
  const inputSourceElement = document.getElementById("input");
  // Ensure the target input element exists and contains a value.
  if (inputSourceElement && inputSourceElement.value) {
    EvaluateStringCorrespondence(inputSourceElement.value);
  } else {
    console.warn("Browser debug: Input field with ID 'input' not found or is empty. No operation was performed.");
  }
}

// Main execution block: This section is responsible for detecting the environment
// (e.g., Node.js for competitive programming) and initiating the primary function.
// It includes robust error handling for file system operations.
try {
  // Check for Node.js specific global objects and modules to confirm the environment.
  if (typeof require === 'function' && typeof module !== 'undefined' && require('fs')) {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard input file path in many competitive programming systems.

    // Read the entire content of the standard input file synchronously.
    // The content is initially read as a buffer.
    const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath);
    // Convert the buffer content into a UTF-8 encoded string.
    const decodedInputString = fileContentBuffer.toString("utf8");

    // Execute the core logic function with the input obtained from stdin.
    EvaluateStringCorrespondence(decodedInputString);
  } else {
    // This branch is executed if the environment is not detected as Node.js.
    // In such cases, the `executeInBrowserContext` function is expected to be
    // triggered externally (e.g., by a user action in a browser).
    // No direct execution occurs here to avoid conflicts or unexpected behavior.
    // console.log("Non-Node.js environment detected. Assuming browser or custom execution context.");
  }
} catch (initializationError) {
  // Catch and report any errors that occur during the environment setup
  // or the process of reading input from the file system.
  console.error("A critical error occurred during environment setup or input reading:", initializationError.message);
  // In case of a critical error, output "No" to indicate failure.
  process.stdout.write("No\n");
}