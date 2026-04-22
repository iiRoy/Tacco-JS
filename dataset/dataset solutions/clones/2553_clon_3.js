// Function to evaluate if a given sequence of characters adheres to specific positional rules.
function analyzeCharacterPattern(rawDataPayload) {
  // Extract the primary string for analysis from the raw input data.
  // The input is expected to be a multi-line string, where the first token
  // of the first line contains the sequence to be checked.
  const inputLines = rawDataPayload.split('\n');

  // Handle cases where the input is entirely empty or just newlines.
  if (inputLines.length === 0 || inputLines[0].trim() === '') {
    console.log("No"); // If no valid input line, consider it invalid.
    return;
  }

  const firstLineParts = inputLines[0].split(' ');

  // Handle cases where the first line is empty or contains no tokens.
  if (firstLineParts.length === 0 || firstLineParts[0].trim() === '') {
    console.log("No"); // If no primary token, consider it invalid.
    return;
  }

  const targetSequence = firstLineParts[0];

  // If the target sequence itself is empty after extraction, it trivially passes the pattern.
  // This is a design choice; an empty string could also be considered "No" depending on requirements.
  if (targetSequence.length === 0) {
    console.log("Yes");
    return;
  }

  // Define character sets allowed for different 1-based positions.
  // Using Set for efficient character lookup.
  const validCharsForOddPositions = new Set(['R', 'U', 'D']); // For 1st, 3rd, 5th... characters (1-indexed)
  const validCharsForEvenPositions = new Set(['L', 'U', 'D']); // For 2nd, 4th, 6th... characters (1-indexed)

  let sequenceConformsToRules = true; // Flag to track overall validity of the sequence.

  // Iterate through each character in the target sequence to perform validation.
  // The loop uses a 0-based index internally for array access.
  for (let currentCharacterIndex = 0; currentCharacterIndex < targetSequence.length; currentCharacterIndex++) {
    // Convert the 0-based index to a 1-based position for rule application.
    const oneBasedPosition = currentCharacterIndex + 1;
    // Extract the character at the current position for examination.
    const charUnderTest = targetSequence[currentCharacterIndex];

    let applicableValidSet; // This variable will hold the correct set of allowed characters for the current position.

    // Determine which set of rules applies based on the parity (even/odd) of the 1-based position.
    if (oneBasedPosition % 2 === 0) { // If the position is even (e.g., 2, 4, 6, etc.)
      applicableValidSet = validCharsForEvenPositions;
    } else { // If the position is odd (e.g., 1, 3, 5, etc.)
      applicableValidSet = validCharsForOddPositions;
    }

    // Check if the character being tested is NOT present in its respective allowed set.
    // If it's not found, the sequence is invalid, and we can immediately stop checking.
    if (!applicableValidSet.has(charUnderTest)) {
      sequenceConformsToRules = false; // Mark the sequence as non-conforming.
      break; // Exit the loop early as the outcome is already determined.
    }
  }

  // Output the final verdict based on the `sequenceConformsToRules` flag.
  // A ternary operator is used for concise conditional output.
  const finalVerdict = sequenceConformsToRules ? "Yes" : "No";
  console.log(finalVerdict);
}

// Entry point for the program: read input from standard input and invoke the analysis function.
// A try-catch block is used to gracefully handle potential file system errors during input reading.
try {
  const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  analyzeCharacterPattern(stdInputContent);
} catch (error) {
  // Log the error for debugging purposes.
  console.error("An operational error occurred during input processing:", error.message);
  // In case of an error, it's safer to assume the pattern is not met.
  console.log("No");
}