/**
 * Processes an input string to find the maximum number of common unique characters
 * between two dynamically split segments of a target string.
 * This function expects the input to be two lines:
 * - The first line contains an integer representing the expected length or loop limit.
 * - The second line contains the target string itself.
 *
 * @param {string} rawInputText The raw input string, potentially containing multiple lines and leading/trailing whitespace.
 */
function analyzeStringSegments(rawInputText) {
  // Trim leading/trailing whitespace from the entire input.
  const processedInput = rawInputText.trim();

  // Split the input into individual lines.
  const inputLines = processedInput.split("\n");

  // --- Input Validation ---
  // Ensure we have at least two lines for the length and the string.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least two lines.");
    return; // Exit if input is invalid
  }

  // Parse the first line as the numeric limit for string segmentation.
  // Using parseInt with radix 10 for robust conversion.
  const segmentIterationLimit = parseInt(inputLines[0], 10);

  // Validate the parsed limit.
  if (isNaN(segmentIterationLimit) || segmentIterationLimit <= 0) {
    console.error(`Error: Invalid string length specified: '${inputLines[0]}'. Must be a positive integer.`);
    return; // Exit if the limit is invalid
  }

  // The actual string to be analyzed is the second line of the input.
  const primarySequence = inputLines[1];

  // This array will store the counts of common unique characters
  // for each possible split point of the primary sequence.
  const intersectionCounts = [];

  /**
   * Helper function to extract all unique characters from a given string segment.
   * This simplifies the main loop by abstracting the unique character logic.
   * @param {string} segment The string part from which to extract unique characters.
   * @returns {Array<string>} An array containing only the unique characters from the segment.
   */
  const extractUniqueCharacters = (segment) => {
      // Convert the segment string into an array of characters,
      // then use a Set to automatically filter out duplicates.
      // Finally, convert the Set back into an array.
      return [...new Set(segment.split(''))];
  };

  // Iterate through all possible split points of the primary sequence.
  // The loop starts from 1 to ensure the first segment is not empty.
  // It continues up to (but not including) the segmentIterationLimit,
  // which generally corresponds to the length of the primary sequence.
  for (let currentSplitIndex = 1; currentSplitIndex < segmentIterationLimit; currentSplitIndex++) {
    // Divide the primary sequence into two parts based on the current split index.
    // The first segment contains characters from the beginning up to (but not including) currentSplitIndex.
    const firstSegment = primarySequence.substring(0, currentSplitIndex);
    // The second segment contains characters from currentSplitIndex to the end of the string.
    const secondSegment = primarySequence.substring(currentSplitIndex);

    // Obtain the unique characters for each of the two segments.
    const uniqueCharsInFirst = extractUniqueCharacters(firstSegment);
    const uniqueCharsInSecond = extractUniqueCharacters(secondSegment);

    // Convert the unique character arrays into Sets for efficient lookups
    // when calculating the intersection (common elements).
    const setOfFirstUnique = new Set(uniqueCharsInFirst);
    const setOfSecondUnique = new Set(uniqueCharsInSecond);

    // Calculate the number of characters that are common to both sets of unique characters.
    // This effectively finds the intersection size.
    let currentCommonalitySize = 0;
    for (const char of setOfFirstUnique) {
      if (setOfSecondUnique.has(char)) {
        currentCommonalitySize++; // Increment if the character exists in both sets.
      }
    }
    
    // Store the calculated commonality count for this specific split point.
    intersectionCounts.push(currentCommonalitySize);
  }

  // Handle the edge case where no valid splits were processed,
  // or if all splits resulted in zero common characters.
  // Math.max(...[]) would return -Infinity, so we explicitly handle it.
  if (intersectionCounts.length === 0) {
      console.log(0); // Output 0 if no common characters could be determined.
      return;
  }

  // Determine the maximum commonality count found across all split points.
  // Using the spread operator (...) is a modern and clean way to pass array elements to Math.max.
  const maximumCommonality = Math.max(...intersectionCounts);

  // Output the final maximum count.
  console.log(maximumCommonality);
}

// --- Application Entry Point ---
// This block handles reading input from standard input, typically used in competitive programming environments.
try {
    // Attempt to read the entire file content from /dev/stdin as a UTF-8 string.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the main analysis function with the read content.
    analyzeStringSegments(fileContent);
} catch (error) {
    // If an error occurs during file reading (e.g., file not found or permission issues),
    // log the error message to the console.
    console.error("Failed to read input from /dev/stdin:", error.message);
}