function evaluateCharacterSequence(sourceInputString) {
  // Ensure the input is a valid string and has sufficient length for processing.
  if (typeof sourceInputString !== 'string' || sourceInputString.length < 4) {
    // If the input is invalid or too short, the specific pattern cannot be formed.
    console.error("Error: The provided input string must be at least four characters long.");
    return false; // Indicate that no pattern was identified due to invalid input.
  }

  // Extract the initial four characters from the input string.
  // This approach directly creates an array of characters, streamlining the process.
  const characterSegments = sourceInputString.slice(0, 4).split('');

  // Sort the extracted characters alphabetically. This step is critical
  // for standardizing the character order before pattern matching.
  // For instance, "BABA" becomes ["A", "A", "B", "B"] after sorting.
  characterSegments.sort();

  // Deconstruct the sorted character array into individually named constants.
  // This enhances readability when checking the pattern conditions.
  const [firstSegment, secondSegment, thirdSegment, fourthSegment] = characterSegments;

  // Initialize a flag to track whether the desired character pattern is found.
  // Using a boolean is generally clearer than a numeric flag (0 or 1).
  let patternMatchDetected = false;

  // Implement the core logic to identify the 'XXYY' pattern, where X is distinct from Y.
  // This unified condition replaces the original, fragmented, and syntactically flawed checks.
  // 1. The first two sorted characters must be identical (e.g., 'A' === 'A').
  // 2. The third and fourth sorted characters must also be identical (e.g., 'B' === 'B').
  // 3. The first character must be different from the third character (e.g., 'A' !== 'B'),
  //    to differentiate 'AABB' from patterns like 'AAAA'.
  if (firstSegment === secondSegment && thirdSegment === fourthSegment && firstSegment !== thirdSegment) {
    patternMatchDetected = true; // The specific 'XXYY' pattern has been successfully identified.
  }

  // Based on the detection flag, output the corresponding message to the console.
  // A ternary expression offers a concise way to select the output string.
  console.log(patternMatchDetected ? "Yes" : "NO");
  
  // Return the boolean result, allowing the calling context to react programmatically.
  return patternMatchDetected;
}

// --- Script Execution Entry Point ---
// This block handles reading input from the standard input stream and invoking the analysis function.
try {
  // Utilize the Node.js 'fs' module to synchronously read data from /dev/stdin.
  // Specifying 'utf8' encoding ensures correct interpretation of character data.
  const rawInputContent = require('fs').readFileSync("/dev/stdin", "utf8");

  // Call the main pattern evaluation function.
  // .trim() is used to remove any leading/trailing whitespace, including newlines,
  // which might be present in the standard input.
  evaluateCharacterSequence(rawInputContent.trim());

} catch (processingError) {
  // Should any error occur during file reading or initial processing,
  // log the error details to the console for diagnostic purposes.
  console.error("An unexpected issue occurred during input acquisition or processing:", processingError.message);
  // Optionally, a non-zero exit code could be used here to signal a script failure.
  // process.exit(1);
}