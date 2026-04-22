/*
 * This module processes raw text input to determine a specific numeric pattern.
 * It's designed to read a line of space-separated numbers from standard input.
 */
function analyzeNumericData(sourceContent) { // Main entry point for data analysis.
  // Extract numerical values from the provided content.
  // First, remove leading/trailing whitespace.
  // Then, split the string by any whitespace character into an array of text segments.
  // Finally, convert each segment into an integer.
  const digitSequence = sourceContent
    .trim()
    .split(/\s/) // Split by any single whitespace character.
    .map(textSegment => parseInt(textSegment, 10)); // Convert each segment to an integer.

  // Check if the first three numbers meet a specific condition.
  // The condition is: the first number is not zero AND all three numbers are identical.
  // Based on the condition, output "Yes" or "No" to the console.
  console.info(
    digitSequence[0] !== 0 &&
    digitSequence[0] === digitSequence[1] &&
    digitSequence[0] === digitSequence[2]
      ? "Yes" // Condition met.
      : "No"  // Condition not met.
  );
}

// Invoke the primary function with data read from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 string.
analyzeNumericData( require("fs") . readFileSync ("/dev/stdin", "utf8") );