// This JavaScript module provides a utility function designed to analyze the initial segment of a given string.
// Its primary purpose is to determine if the first three characters of the input string exhibit
// a specific pattern: whether they are all identical to each other. This is a common pattern-matching
// task that might be part of a larger text processing or validation system.

/**
 * Examines an incoming string to ascertain if its initial three characters are uniformly identical.
 * This function includes robust input validation and clear, step-by-step logic for the character comparison.
 * The outcome of the analysis is directly printed to the standard console output.
 *
 * @param {string} incomingTextualData - The string which is to be processed and analyzed.
 *                                     It is expected that this parameter will be a string type.
 * @returns {void} This function does not return any value; it performs a side effect by printing
 *                 either "No" (if the first three characters are identical) or "Yes" (otherwise)
 *                 to the console. It may also print error messages for invalid inputs.
 */
function evaluateInitialCharacterHomogeneity(incomingTextualData) {
  // Declare a constant to define the minimum length required for our pattern analysis.
  // This makes the code more maintainable and self-documenting.
  const minimumSignificantLength = 3;

  // --- Comprehensive Input Validation (A Type III structural addition for robustness) ---
  // First, verify that the provided input is indeed a string. Non-string inputs are erroneous.
  if (typeof incomingTextualData !== 'string') {
    console.error("Fatal Error: The input provided for analysis is not a string type.");
    console.error("Received an input of type:", typeof incomingTextualData, "instead of 'string'.");
    // An early exit is crucial here to prevent runtime errors from invalid data types.
    return;
  }

  // Next, ensure the string has sufficient length for the pattern check.
  // If the string is shorter than three characters, it's impossible for "all three"
  // to be the same, so by definition, they are "not all the same."
  if (incomingTextualData.length < minimumSignificantLength) {
    console.log("Yes"); // Not enough characters present to form an identical trio.
    // Exit the function early as the condition cannot be met.
    return;
  }

  // --- Character Extraction and Assignment (Type II identifier renaming, Type III intermediate steps) ---
  // Extract the individual characters from the beginning of the string into distinct, descriptive variables.
  // This enhances readability compared to direct array access or repeated indexing.
  const primaryCharacter = incomingTextualData.charAt(0); // Using charAt() for explicit character retrieval.
  const secondaryCharacter = incomingTextualData.charAt(1);
  const tertiaryCharacter = incomingTextualData.charAt(2);

  // Introduce a boolean flag to store the result of our comparison logic.
  // This intermediate variable improves code clarity by separating computation from decision making.
  let isTripleMatchDetected = false;

  // --- Core Logic Rephrasing and Strict Comparison (Type III update to statements) ---
  // Evaluate the condition: Are all three extracted characters strictly identical?
  // Using '===' for strict equality comparison, which is generally preferred in JavaScript.
  // The original check `s[0] == s[1] && s[0] == s[2]` is logically equivalent to this chain.
  if (primaryCharacter === secondaryCharacter && secondaryCharacter === tertiaryCharacter) {
    isTripleMatchDetected = true;
  } else {
    // If the condition is not met, the characters are not uniformly identical.
    isTripleMatchDetected = false;
  }

  // --- Final Output Determination (Type III rephrasing of the conditional output) ---
  // Based on the boolean flag, print the appropriate response as per the problem's specification.
  // The logic dictates "No" for a match and "Yes" for a mismatch.
  if (isTripleMatchDetected) {
    console.log("No"); // All characters in the initial triple are identical.
  } else {
    console.log("Yes"); // At least one character in the initial triple differs.
  }
}

// --- Execution Entry Point (Type II renaming, Type III error handling and refinement) ---
// This block serves as the main entry point for running the script, particularly in a Node.js environment.
// It handles reading input from standard input and passing it to our analysis function.
try {
  // Utilize Node.js's 'fs' module to read synchronous input from '/dev/stdin'.
  // The '.trim()' method is a Type III refinement, ensuring that any trailing newline characters
  // (common in standard input) do not interfere with the character count or comparison logic.
  const acquiredInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

  // Invoke the primary analysis function with the content obtained from standard input.
  evaluateInitialCharacterHomogeneity(acquiredInputContent);
} catch (inputReadingError) {
  // --- Robust Error Handling (A significant Type III addition) ---
  // Catch and report any errors that might occur during the input reading process,
  // such as file not found or permission issues. This makes the program more resilient.
  console.error("An operational fault occurred while attempting to retrieve input data:");
  console.error("Specific error details:", inputReadingError.message);
  // For debugging, one might also log the full stack trace:
  // console.error(inputReadingError.stack);
}