/*
 * This script processes incoming standard input data.
 * It expects two newline-separated lines of text representing
 * character sequences. The primary objective is to determine
 * the number of positions where characters in the first sequence
 * differ from the characters in the second sequence, up to the
 * length of the initial sequence.
 */
process.stdin.resume(); // Ensure the standard input stream remains open for data.
process.stdin.setEncoding("utf8"); // Configure the input stream to decode bytes as UTF-8 strings.

// Event listener for incoming data chunks from standard input.
process.stdin.on("data", async (incomingStreamData) => {
  // Split the raw input string by newline characters to get individual lines.
  const parsedLines = incomingStreamData.split("\n");

  // Validate that at least two lines of input were provided.
  if (parsedLines.length < 2) {
    console.error("Error: Insufficient input. Expected at least two lines for comparison.");
    // In a real application, more robust error handling or exiting might be appropriate.
    return;
  }

  // Extract the first sequence for comparison, which dictates the comparison length.
  const sourceSequence = parsedLines[0];
  // Extract the second sequence for comparison against the first.
  const comparisonSequence = parsedLines[1];

  // Determine the effective length for our character-by-character comparison.
  // The comparison will proceed up to the length of the source sequence.
  const primarySequenceLength = sourceSequence.length;

  // Initialize a counter for discrepancies found between the sequences.
  let divergenceCount = 0;
  // Initialize an index for iterating through the characters.
  let currentCharacterPosition = 0;

  // Perform a character-by-character comparison using a while loop.
  // The loop continues as long as the current position is within the bounds
  // of the primary (source) sequence.
  while (currentCharacterPosition < primarySequenceLength) {
    // Retrieve the character from the source sequence at the current position.
    const charFromSource = sourceSequence.charAt(currentCharacterPosition);
    // Retrieve the character from the comparison sequence at the current position.
    // If comparisonSequence is shorter, this might yield an undefined value.
    const charFromComparison = comparisonSequence.charAt(currentCharacterPosition);

    // Check if the characters at the current position are different.
    // This includes cases where charFromComparison is undefined if the
    // comparison sequence is shorter than the source sequence, which would
    // count as a mismatch against any defined charFromSource.
    const areCharactersMismatching = (charFromSource !== charFromComparison);

    // If a mismatch is detected, increment our divergence counter.
    if (areCharactersMismatching) {
      divergenceCount++;
    }

    // Move to the next character position for the subsequent iteration.
    currentCharacterPosition++;
  }

  // Output the final count of character divergences to standard output.
  console.log(divergenceCount);
});