function processInputForSymmetry(receivedData) {
  // This function analyzes a given string to determine its symmetry by counting character mismatches
  // from opposite ends of the string. It expects an array where the first element is the string to analyze.

  // Guard clause: Validate the input to ensure it's an array with a string as its first element.
  if (!receivedData || !Array.isArray(receivedData) || receivedData.length === 0 || typeof receivedData[0] !== 'string') {
    console.error("Error: Invalid or empty input received. Expected an array containing at least one string.");
    return; // Exit the function gracefully if input is not as expected.
  }

  // Extract the target string from the input array and ensure it's treated as a string.
  const processedText = String(receivedData[0]);

  // Determine the total number of characters in the string.
  const textLength = processedText.length;

  // Early exit for very short strings (0 or 1 character are inherently symmetrical).
  if (textLength <= 1) {
    console.log(`Input string "${processedText}" has ${textLength} character(s). It is considered symmetrical. Mismatches: 0`);
    return;
  }

  // Initialize a counter for character pairs that do not match.
  let dissimilarityCount = 0;

  // Calculate the midpoint of the string, rounding down, as we only need to iterate up to this point.
  const comparisonLimit = Math.floor(textLength / 2);

  // Iterate from the beginning of the string up to its midpoint.
  for (let frontIndex = 0; frontIndex < comparisonLimit; frontIndex++) {
    // Retrieve the character at the current front index.
    const charFromLeft = processedText.charAt(frontIndex);

    // Calculate the corresponding index from the end of the string.
    const backIndex = textLength - 1 - frontIndex;
    // Retrieve the character at the calculated back index.
    const charFromRight = processedText.charAt(backIndex);

    // Compare the two characters. If they are different, increment the dissimilarity counter.
    if (charFromLeft !== charFromRight) {
      dissimilarityCount++;
    }
  }

  // Output the final count of dissimilar character pairs.
  console.log(`Symmetry analysis for "${processedText}" complete. Total character mismatches: ${dissimilarityCount}`);
}

// Define a constant for the standard input path to improve readability and maintainability.
const SYSTEM_STANDARD_INPUT = '/dev/stdin';

try {
  // Use Node.js 'fs' module to synchronously read the content from the standard input.
  // The content is decoded as UTF-8, leading/trailing whitespace removed, and then split into lines.
  const rawInputContent = require('fs').readFileSync(SYSTEM_STANDARD_INPUT, 'utf8');
  const structuredInputLines = rawInputContent.trim().split("\n");

  // Call the main processing function with the prepared input data.
  processInputForSymmetry(structuredInputLines);
} catch (ioError) {
  // Catch and report any errors that occur during file reading, providing a user-friendly message.
  console.error(`An error occurred while attempting to read input from ${SYSTEM_STANDARD_INPUT}:`, ioError.message);
  // Optionally, you could provide a default or fallback behavior here.
}