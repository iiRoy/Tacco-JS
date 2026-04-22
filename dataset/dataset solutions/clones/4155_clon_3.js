((inputRawText) => {
  // This module processes multi-line text input, transforms individual lines
  // based on their position, and then performs a final comparison.

  // --- Helper Functions for Character Sorting ---

  /**
   * Sorts the characters of a given string in ascending (alphabetical) order.
   * This function ensures graceful handling of non-string or empty inputs
   * by returning an empty string, preventing potential runtime errors.
   * @param {string} textSegment - The string whose characters are to be sorted.
   * @returns {string} The string with its characters arranged in ascending sequence.
   */
  const sortCharsAscending = (textSegment) => {
    // Validate input type and content to ensure robustness.
    if (typeof textSegment !== 'string' || textSegment.length === 0) {
      return ''; // Return an empty string for invalid or empty inputs.
    }
    // Convert the string into an array of characters for sorting.
    const characterArray = Array.from(textSegment);
    // Perform an explicit lexicographical sort on the character array.
    characterArray.sort((charA, charB) => charA.localeCompare(charB));
    // Reconstruct the string from the sorted characters.
    return characterArray.join('');
  };

  /**
   * Sorts the characters of a given string in descending (reverse alphabetical) order.
   * Similar to its ascending counterpart, this function also handles invalid
   * or empty inputs by returning an empty string.
   * @param {string} textSegment - The string whose characters are to be sorted.
   * @returns {string} The string with its characters arranged in descending sequence.
   */
  const sortCharsDescending = (textSegment) => {
    // Validate input to maintain data integrity.
    if (typeof textSegment !== 'string' || textSegment.length === 0) {
      return ''; // Default to empty string for non-processible inputs.
    }
    // Prepare the string for character-level manipulation.
    const characterArray = Array.from(textSegment);
    // Sort in reverse lexicographical order.
    characterArray.sort((charA, charB) => charB.localeCompare(charA));
    // Combine the sorted characters back into a single string.
    return characterArray.join('');
  };

  // --- Main Processing Logic for Input Lines ---

  // First, segment the entire raw input text into individual lines.
  // It's crucial to filter out any lines that are empty or consist solely of whitespace,
  // to ensure that only meaningful data segments are processed.
  const sourceLines = inputRawText.split('\n').filter(line => line.trim().length > 0);

  // Initialize an array to accumulate the results after applying sorting rules to each line.
  const transformedSegments = [];

  // Iterate through each valid source line, applying a specific character sorting rule.
  // The rule varies based on whether it's the very first line or a subsequent one.
  for (let currentLineIndex = 0; currentLineIndex < sourceLines.length; currentLineIndex++) {
    const originalLineContent = sourceLines[currentLineIndex];
    let finalSortedLine; // Temporary variable to hold the sorted line content.

    // Conditional logic to determine the sorting method:
    // The initial line (at index 0) receives descending character sort.
    if (currentLineIndex === 0) {
      finalSortedLine = sortCharsDescending(originalLineContent);
    } else {
      // All other lines (index > 0) are sorted in ascending character order.
      finalSortedLine = sortCharsAscending(originalLineContent);
    }
    // Add the newly processed string to our collection.
    transformedSegments.push(finalSortedLine);
  }

  // --- Final Comparison and Result Output ---

  // A critical guard clause: The comparison requires at least two processed segments.
  // If fewer than two segments are available, the intended comparison cannot be performed.
  // In such a scenario, a default 'No' is outputted, and the script terminates
  // further execution within this scope.
  if (transformedSegments.length < 2) {
    console.log('No'); // Output default result for insufficient data.
    return; // Exit early as the primary operation is not feasible.
  }

  // Extract the specific strings necessary for the final comparison.
  // Using descriptive variable names enhances clarity regarding their role.
  const primaryComparisonTarget = transformedSegments[0];
  const secondaryComparisonTarget = transformedSegments[1];

  // Perform the core comparison: Is the first processed string lexicographically greater
  // than the second processed string?
  const isFirstSegmentDominant = primaryComparisonTarget > secondaryComparisonTarget;

  // Formulate the final textual output based on the comparison's boolean result.
  const outcomeMessage = isFirstSegmentDominant ? 'Yes' : 'No';

  // Display the determined outcome to the standard output stream.
  console.log(outcomeMessage);

// This Immediately Invoked Function Expression (IIFE) sources its input
// by reading the entire content of the standard input file (`/dev/stdin`)
// as a UTF-8 encoded string.
})(require("fs").readFileSync("/dev/stdin", "utf8"));