// This module processes an input string to find numeric substrings
// that meet a specific divisibility criterion.

function processDataStream(incomingText) {
  // Store the raw text data for subsequent operations.
  const dataSegments = incomingText;

  // Initialize a counter for substrings that satisfy the condition.
  let divisibleSubstringsCount = 0;

  // Outer loop: iterates through all possible starting positions for a substring.
  for (
    let startPosition = 0; // The beginning index for the current segment.
    startPosition < dataSegments.length; // Continue as long as we are within bounds.
    startPosition++ // Move to the next potential starting point.
  ) {
    // Inner loop: iterates through all possible ending positions for a substring,
    // starting from the current 'startPosition'.
    for (
      let endPosition = startPosition; // The end index for the current segment.
      endPosition <= dataSegments.length; // Can go up to and including the length to get the last char.
      endPosition++ // Extend the segment by one character.
    ) {
      // Extract the current substring using 'substring' method.
      // Convert it to an integer (base 10) for numerical operations.
      // Check if the resulting number is perfectly divisible by 2019.
      // Also, ensure that the substring is not empty (start and end positions are different).
      if (
        (parseInt(dataSegments.substring(startPosition, endPosition), 10) % 2019 === 0) &&
        (startPosition !== endPosition)
      ) {
        // If both conditions are met, increment the counter.
        divisibleSubstringsCount++;
      }
    }
  }

  // Output the final tally of divisible substrings to the console.
  console.log(divisibleSubstringsCount);
}

// The program's entry point.
// Reads content from standard input (e.g., piped file or user input).
// The 'utf8' encoding ensures proper character handling.
processDataStream(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);