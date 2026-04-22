/**
 * Processes a multi-line string input to extract specific characters
 * and format them into a new string.
 * This function handles the main logic for data manipulation.
 * @param {string} rawContentStream - The raw input string, typically from stdin.
 */
function processInputData(rawContentStream) {
  // Defensive check for valid input stream: ensures the input is a non-empty string.
  if (!rawContentStream || typeof rawContentStream !== 'string' || rawContentStream.trim() === '') {
    console.error("Error: Input stream is empty, invalid type, or contains only whitespace.");
    // Providing a default fallback output to maintain execution flow.
    console.log("A_C");
    return;
  }

  // Define constants for output formatting and fallback character.
  const outputPrefixChar = 'A';
  const outputSuffixChar = 'C';
  const missingCharFallback = '_'; // Used if the target character cannot be extracted.

  // Split the raw input content into an array of individual lines.
  // This prepares the data for line-by-line processing.
  const lineSegments = rawContentStream.split("\n");

  // Attempt to retrieve the first significant line from the input.
  // Leading/trailing whitespace is removed to standardize the line content.
  let firstMeaningfulLine = (lineSegments.length > 0 && lineSegments[0])
    ? lineSegments[0].trim()
    : '';

  // Validate if the first line contains any data after trimming.
  // If it's empty, we cannot proceed with the expected extraction.
  if (firstMeaningfulLine === '') {
    console.warn("Warning: The first line of input was empty after trimming whitespace.");
    console.log(`${outputPrefixChar}${missingCharFallback}${outputSuffixChar}`);
    return;
  }

  // Split the processed first line into an array of words, using space as the delimiter.
  // This array will be used to access specific word components.
  const wordComponents = firstMeaningfulLine.split(" ");

  let derivedCharacter = missingCharFallback; // Initialize with the fallback character.

  // Check if there are at least two words available in the line.
  // The problem requires the second word (index 1) for character extraction.
  if (wordComponents.length >= 2) {
    const secondWordCandidate = wordComponents[1];

    // Further validate if the second word itself is not empty.
    // An empty string for the second word would mean no character to extract.
    if (secondWordCandidate && secondWordCandidate.length > 0) {
      // Extract the very first character from the validated second word.
      derivedCharacter = secondWordCandidate[0];
    } else {
      // This fragment handles the specific case where the second word exists but is empty.
      console.warn("Warning: The second word on the first line was found but is empty.");
    }
  } else {
    // This fragment handles the case where there aren't enough words on the line.
    console.warn("Warning: Insufficient words found on the first line to extract the target character.");
  }

  // Construct the final output string using template literals for improved readability.
  // This combines the predefined prefix, the extracted character, and the suffix.
  const finalFormattedOutput = `${outputPrefixChar}${derivedCharacter}${outputSuffixChar}`;

  // Display the final result to the standard output.
  console.log(finalFormattedOutput);
}

// --- Standard Input Handling Mechanism ---
// This part of the code is responsible for reading the entire content
// from standard input and passing it to the main processing function.
// It is typically kept as-is to conform to standard competitive programming environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));